const productData = require("../../models/AdminModel/productsData");
const createError = require("http-errors");

const handleAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts: handleAsync(async (req, res) => {
        const { page = 1, limit = 20, search = "", category = "", sort = "createdAt", order = "desc" } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
            ];
        }
        if (category) {
            query.category = { $regex: `^${category}$`, $options: "i" };
        }

        const allowedSortFields = ["title", "category", "maxPrice", "quantity", "rating", "createdAt"];
        const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
        const sortOrder = order === "asc" ? 1 : -1;

        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            productData.find(query, { __v: 0 }).skip(skip).limit(Number(limit)).sort({ [sortField]: sortOrder }),
            productData.countDocuments(query),
        ]);

        res.status(200).json({
            status: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            products,
        });
    }),

    getProductById: handleAsync(async (req, res) => {
        const product = await productData.findById(req.params.id);
        if (!product) throw createError(404, "Product not found.");
        res.status(200).json(product);
    }),

    addProduct: handleAsync(async (req, res) => {
        const product = new productData(req.body);
        const saved = await product.save();
        res.status(201).json(saved);
    }),

    updateProduct: handleAsync(async (req, res) => {
        const updated = await productData.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) throw createError(404, "Product not found.");
        res.status(200).json(updated);
    }),

    deleteProduct: handleAsync(async (req, res) => {
        const deleted = await productData.findByIdAndDelete(req.params.id);
        if (!deleted) throw createError(404, "Product not found.");
        res.status(200).json({ status: true, message: "Product deleted successfully" });
    }),
};
