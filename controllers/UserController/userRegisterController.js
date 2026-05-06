const createError = require("http-errors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const registerData = require("../../models/UserModel/UserRegister");
const productData = require("../../models/AdminModel/productsData");
const { generateToken } = require("../../services/jwtUtils");
const jwt = require("jsonwebtoken");

const handleAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    // ── Auth ──────────────────────────────────────────────────────────────────

    createNewUser: handleAsync(async (req, res) => {
        const { name, email, mobile, password, gender } = req.body;

        const existing = await registerData.findOne({ $or: [{ email }, { mobile }] });
        if (existing) {
            throw createError(409, "Email or mobile already registered.");
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new registerData({ name, email, mobile, password: hash, gender });
        const result = await user.save();

        res.status(201).json({ status: true, message: "Registration successful", result });
    }),

    loginCredential: handleAsync(async (req, res) => {
        const { email, password: payloadPassword } = req.body;

        const user = await registerData.findOne({ email });
        if (!user) {
            throw createError(401, "Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(payloadPassword, user.password);
        if (!isMatch) {
            throw createError(401, "Invalid email or password.");
        }

        const token = generateToken({ id: user._id, email: user.email, role: user.role });

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            status: true,
            message: "Authentication successful",
            token,
            id: user._id,
            name: user.name,
            role: user.role,
        });
    }),

    // ── Profile ───────────────────────────────────────────────────────────────

    getProfile: handleAsync(async (req, res) => {
        const user = await registerData
            .findById(req.user.id)
            .select("-password -__v");
        if (!user) throw createError(404, "User not found.");
        res.json({ status: true, user });
    }),

    updateProfile: handleAsync(async (req, res) => {
        const { name, gender, mobile } = req.body;
        const updated = await registerData
            .findByIdAndUpdate(
                req.user.id,
                { name, gender, mobile },
                { new: true, runValidators: true }
            )
            .select("-password -__v");
        if (!updated) throw createError(404, "User not found.");
        res.json({ status: true, message: "Profile updated", user: updated });
    }),

    // ── Cart ──────────────────────────────────────────────────────────────────

    getCart: handleAsync(async (req, res) => {
        const user = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId", "-__v");
        if (!user) throw createError(404, "User not found.");
        res.json({ status: true, cart: user.addToCart });
    }),

    addToCart: handleAsync(async (req, res) => {
        const { productId, quantity = 1 } = req.body;

        const product = await productData.findById(productId);
        if (!product) throw createError(404, "Product not found.");

        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const existingItem = user.addToCart.find(
            (item) => item.productId.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            user.addToCart.push({ productId, quantity });
        }

        await user.save();
        const updated = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId", "-__v");
        res.json({ status: true, message: "Added to cart", cart: updated.addToCart });
    }),

    removeFromCart: handleAsync(async (req, res) => {
        const { productId } = req.params;

        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        user.addToCart = user.addToCart.filter(
            (item) => item.productId.toString() !== productId
        );
        await user.save();

        // Re-fetch with populate so client gets full product data
        const updated = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId", "-__v");
        res.json({ status: true, message: "Item removed from cart", cart: updated.addToCart });
    }),

    updateCartItem: handleAsync(async (req, res) => {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) throw createError(400, "Quantity must be at least 1.");

        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const item = user.addToCart.find(
            (item) => item.productId.toString() === productId
        );
        if (!item) throw createError(404, "Item not in cart.");

        item.quantity = quantity;
        await user.save();

        // Re-fetch with populate so client gets full product data
        const updated = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId", "-__v");
        res.json({ status: true, message: "Cart updated", cart: updated.addToCart });
    }),

    clearCart: handleAsync(async (req, res) => {
        await registerData.findByIdAndUpdate(req.user.id, { addToCart: [] });
        res.json({ status: true, message: "Cart cleared" });
    }),

    // ── Addresses ─────────────────────────────────────────────────────────────

    getAddresses: handleAsync(async (req, res) => {
        const user = await registerData.findById(req.user.id).select("addresses");
        if (!user) throw createError(404, "User not found.");
        res.json({ status: true, addresses: user.addresses });
    }),

    addAddress: handleAsync(async (req, res) => {
        const { fullName, mobile, pincode, addressLine1, addressLine2, city, state, addressType, isDefault } = req.body;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        // If new address is default, unset all others
        if (isDefault) {
            user.addresses.forEach((a) => { a.isDefault = false; });
        }
        // If this is the first address, make it default
        const makeDefault = isDefault || user.addresses.length === 0;

        user.addresses.push({ fullName, mobile, pincode, addressLine1, addressLine2, city, state, addressType, isDefault: makeDefault });
        await user.save();
        res.status(201).json({ status: true, message: "Address added", addresses: user.addresses });
    }),

    updateAddress: handleAsync(async (req, res) => {
        const { addressId } = req.params;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const address = user.addresses.id(addressId);
        if (!address) throw createError(404, "Address not found.");

        if (req.body.isDefault) {
            user.addresses.forEach((a) => { a.isDefault = false; });
        }

        Object.assign(address, req.body);
        await user.save();
        res.json({ status: true, message: "Address updated", addresses: user.addresses });
    }),

    deleteAddress: handleAsync(async (req, res) => {
        const { addressId } = req.params;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const address = user.addresses.id(addressId);
        if (!address) throw createError(404, "Address not found.");

        const wasDefault = address.isDefault;
        address.deleteOne();

        // If deleted address was default, make first remaining address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ status: true, message: "Address deleted", addresses: user.addresses });
    }),

    setDefaultAddress: handleAsync(async (req, res) => {
        const { addressId } = req.params;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        user.addresses.forEach((a) => { a.isDefault = a._id.toString() === addressId; });
        await user.save();
        res.json({ status: true, message: "Default address updated", addresses: user.addresses });
    }),

    // ── Orders ────────────────────────────────────────────────────────────────

    placeOrder: handleAsync(async (req, res) => {
        const { addressId } = req.body;
        const user = await registerData
            .findById(req.user.id)
            .populate("addToCart.productId");
        if (!user) throw createError(404, "User not found.");
        if (!user.addToCart.length) throw createError(400, "Cart is empty.");

        // Validate address
        let deliveryAddress = null;
        if (addressId) {
            const addr = user.addresses.id(addressId);
            if (!addr) throw createError(400, "Selected address not found.");
            deliveryAddress = {
                fullName: addr.fullName,
                mobile: addr.mobile,
                pincode: addr.pincode,
                addressLine1: addr.addressLine1,
                addressLine2: addr.addressLine2,
                city: addr.city,
                state: addr.state,
            };
        } else {
            const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
            if (!defaultAddr) throw createError(400, "Please add a delivery address before placing order.");
            deliveryAddress = {
                fullName: defaultAddr.fullName,
                mobile: defaultAddr.mobile,
                pincode: defaultAddr.pincode,
                addressLine1: defaultAddr.addressLine1,
                addressLine2: defaultAddr.addressLine2,
                city: defaultAddr.city,
                state: defaultAddr.state,
            };
        }

        const items = user.addToCart
            .filter((item) => item.productId && typeof item.productId === "object")
            .map((item) => ({
                productId: item.productId._id,
                title: item.productId.title,
                image: item.productId.image[0],
                quantity: item.quantity,
                price: Math.round(
                    item.productId.maxPrice -
                        (item.productId.discount / 100) * item.productId.maxPrice
                ),
            }));

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Expected delivery: 5 days from now
        const expectedDelivery = new Date();
        expectedDelivery.setDate(expectedDelivery.getDate() + 5);

        user.orders.push({
            items,
            totalAmount,
            deliveryAddress,
            expectedDelivery,
            statusHistory: [{ status: "confirmed", message: "Order placed successfully" }],
        });
        user.addToCart = [];
        await user.save();

        const newOrder = user.orders[user.orders.length - 1];
        res.status(201).json({ status: true, message: "Order placed successfully", order: newOrder });
    }),

    getOrders: handleAsync(async (req, res) => {
        const user = await registerData.findById(req.user.id).select("orders").lean();
        if (!user) throw createError(404, "User not found.");
        res.json({ status: true, orders: [...user.orders].reverse() });
    }),

    getOrderById: handleAsync(async (req, res) => {
        const { orderId } = req.params;
        const user = await registerData.findById(req.user.id).select("orders").lean();
        if (!user) throw createError(404, "User not found.");
        const order = user.orders.find((o) => o._id.toString() === orderId);
        if (!order) throw createError(404, "Order not found.");
        res.json({ status: true, order });
    }),

    cancelOrder: handleAsync(async (req, res) => {
        const { orderId } = req.params;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const order = user.orders.id(orderId);
        if (!order) throw createError(404, "Order not found.");
        if (["delivered", "cancelled"].includes(order.status)) {
            throw createError(400, `Cannot cancel an order that is already ${order.status}.`);
        }

        order.status = "cancelled";
        order.statusHistory.push({ status: "cancelled", message: "Cancelled by customer" });
        await user.save();
        res.json({ status: true, message: "Order cancelled", order });
    }),

    // ── Admin: update order status ────────────────────────────────────────────

    adminUpdateOrderStatus: handleAsync(async (req, res) => {
        const { userId, orderId } = req.params;
        const { status, message } = req.body;

        const validStatuses = ["pending", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) throw createError(400, "Invalid status.");

        const user = await registerData.findById(userId);
        if (!user) throw createError(404, "User not found.");

        const order = user.orders.id(orderId);
        if (!order) throw createError(404, "Order not found.");

        order.status = status;
        order.statusHistory.push({
            status,
            message: message || `Order ${status}`,
        });
        await user.save();
        res.json({ status: true, message: "Order status updated", order });
    }),

    // ── Wishlist ──────────────────────────────────────────────────────────────

    getWishlist: handleAsync(async (req, res) => {
        const user = await registerData
            .findById(req.user.id)
            .populate("wishlist", "-__v -addToCart -orders -addresses -password");
        if (!user) throw createError(404, "User not found.");
        res.json({ status: true, wishlist: user.wishlist });
    }),

    addToWishlist: handleAsync(async (req, res) => {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) throw createError(400, "Invalid product ID.");

        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        const alreadyIn = user.wishlist.some((id) => id.toString() === productId);
        if (!alreadyIn) {
            user.wishlist.push(productId);
            await user.save();
        }

        const updated = await registerData
            .findById(req.user.id)
            .populate("wishlist", "-__v -addToCart -orders -addresses -password");
        res.json({ status: true, message: "Added to wishlist", wishlist: updated.wishlist });
    }),

    removeFromWishlist: handleAsync(async (req, res) => {
        const { productId } = req.params;
        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        const updated = await registerData
            .findById(req.user.id)
            .populate("wishlist", "-__v -addToCart -orders -addresses -password");
        res.json({ status: true, message: "Removed from wishlist", wishlist: updated.wishlist });
    }),

    // ── Recently Viewed ───────────────────────────────────────────────────────

    getRecentlyViewed: handleAsync(async (req, res) => {
        const user = await registerData
            .findById(req.user.id)
            .populate("recentlyViewed.productId", "-__v -addToCart -orders -addresses -password");
        if (!user) throw createError(404, "User not found.");

        // Sort newest first, return up to 10
        const sorted = [...user.recentlyViewed]
            .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
            .slice(0, 10);

        res.json({ status: true, recentlyViewed: sorted });
    }),

    trackRecentlyViewed: handleAsync(async (req, res) => {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) throw createError(400, "Invalid product ID.");

        const user = await registerData.findById(req.user.id);
        if (!user) throw createError(404, "User not found.");

        // Remove existing entry for this product (to re-insert at top)
        user.recentlyViewed = user.recentlyViewed.filter(
            (rv) => rv.productId.toString() !== productId
        );

        // Add to front
        user.recentlyViewed.unshift({ productId, viewedAt: new Date() });

        // Keep only last 20
        if (user.recentlyViewed.length > 20) {
            user.recentlyViewed = user.recentlyViewed.slice(0, 20);
        }

        await user.save();
        res.json({ status: true, message: "Tracked" });
    }),

    // ── Admin: get all orders ─────────────────────────────────────────────────

    adminGetAllOrders: handleAsync(async (req, res) => {
        const { page = 1, limit = 20, status = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const pipeline = [
            { $unwind: "$orders" },
            ...(status ? [{ $match: { "orders.status": status } }] : []),
            { $sort: { "orders.placedAt": -1 } },
            {
                $project: {
                    _id: 0,
                    orderId: "$orders._id",
                    order: "$orders",
                    userId: "$_id",
                    userName: "$name",
                    userEmail: "$email",
                    userMobile: "$mobile",
                },
            },
        ];

        const [results, countResult] = await Promise.all([
            registerData.aggregate([...pipeline, { $skip: skip }, { $limit: Number(limit) }]),
            registerData.aggregate([...pipeline, { $count: "total" }]),
        ]);

        const total = countResult[0]?.total || 0;
        res.json({
            status: true,
            orders: results,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    }),

    // ── Admin helpers ─────────────────────────────────────────────────────────

    getAlluserData: handleAsync(async (req, res) => {
        const { page = 1, limit = 10, search = "", role = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { mobile: { $regex: search, $options: "i" } },
            ];
        }
        if (role && ["user", "admin"].includes(role)) {
            query.role = role;
        }

        const [users, total] = await Promise.all([
            registerData
                .find(query, { password: 0, __v: 0, addToCart: 0, addresses: 0 })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            registerData.countDocuments(query),
        ]);

        res.json({
            status: true,
            users,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    }),

    findUserById: handleAsync(async (req, res) => {
        const user = await registerData.findById(req.params.id).select("-password -__v");
        if (!user) throw createError(404, "User not found.");
        res.json(user);
    }),

    updateUserById: handleAsync(async (req, res) => {
        const result = await registerData.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select("-password -__v");
        if (!result) throw createError(404, "User not found.");
        res.json(result);
    }),

    deleteUserById: handleAsync(async (req, res) => {
        const result = await registerData.findByIdAndDelete(req.params.id);
        if (!result) throw createError(404, "User not found.");
        res.json({ status: true, message: "User deleted successfully" });
    }),
};
