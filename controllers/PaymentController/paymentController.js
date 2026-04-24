const createError = require("http-errors");
const { createOrder, verifyPaymentSignature } = require("../../services/razorpayService");
const registerData = require("../../models/UserModel/UserRegister");

const handleAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    /**
     * Get Razorpay key for frontend
     */
    getRazorpayKey: handleAsync(async (req, res) => {
        res.json({ key: process.env.RAZORPAY_KEY_ID });
    }),

    /**
     * Create Razorpay order before payment
     */
    createPaymentOrder: handleAsync(async (req, res) => {
        const user = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId");
        if (!user) throw createError(404, "User not found.");
        if (!user.addToCart.length) throw createError(400, "Cart is empty.");

        // Filter out any cart items where product was deleted
        const validItems = user.addToCart.filter(
            (item) => item.productId && typeof item.productId === "object"
        );
        if (!validItems.length) throw createError(400, "No valid items in cart.");

        // Calculate total from cart
        const totalAmount = validItems.reduce((sum, item) => {
            const price = Math.round(
                item.productId.maxPrice -
                    (item.productId.discount / 100) * item.productId.maxPrice
            );
            return sum + price * item.quantity;
        }, 0);

        if (totalAmount <= 0) throw createError(400, "Invalid cart total.");

        // Create Razorpay order
        const receipt = `rcpt_${req.user.id.toString().slice(-6)}_${Date.now()}`;
        try {
            const razorpayOrder = await createOrder(totalAmount, "INR", receipt);
            res.json({
                status: true,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
            });
        } catch (razorpayError) {
            console.error("Razorpay order creation failed:", razorpayError);
            throw createError(502, razorpayError?.error?.description || "Payment gateway error. Please try again.");
        }
    }),

    /**
     * Verify payment and place order
     */
    verifyPaymentAndPlaceOrder: handleAsync(async (req, res) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } = req.body;

        const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) throw createError(400, "Payment verification failed. Invalid signature.");

        const user = await registerData.findById(req.user.id).populate("addToCart.productId");
        if (!user) throw createError(404, "User not found.");
        if (!user.addToCart.length) throw createError(400, "Cart is empty.");

        // Resolve delivery address
        let deliveryAddress = null;
        if (addressId) {
            const addr = user.addresses.id(addressId);
            if (addr) {
                deliveryAddress = { fullName: addr.fullName, mobile: addr.mobile, pincode: addr.pincode, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2, city: addr.city, state: addr.state };
            }
        }
        if (!deliveryAddress) {
            const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
            if (defaultAddr) {
                deliveryAddress = { fullName: defaultAddr.fullName, mobile: defaultAddr.mobile, pincode: defaultAddr.pincode, addressLine1: defaultAddr.addressLine1, addressLine2: defaultAddr.addressLine2, city: defaultAddr.city, state: defaultAddr.state };
            }
        }

        const items = user.addToCart
            .filter((item) => item.productId && typeof item.productId === "object")
            .map((item) => ({
                productId: item.productId._id,
                title: item.productId.title,
                image: item.productId.image[0],
                quantity: item.quantity,
                price: Math.round(item.productId.maxPrice - (item.productId.discount / 100) * item.productId.maxPrice),
            }));

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + 5);

        user.orders.push({
            items,
            totalAmount,
            deliveryAddress,
            expectedDelivery,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            statusHistory: [{ status: "confirmed", message: "Payment received. Order confirmed." }],
        });
        user.addToCart = [];
        await user.save();

        const newOrder = user.orders[user.orders.length - 1];
        res.status(201).json({ status: true, message: "Payment verified and order placed successfully", order: newOrder });
    }),
};
