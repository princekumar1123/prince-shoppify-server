// For single db connection
const productData = require('../../models/AdminModel/productsData')
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
        const products = await productData.find({}, { __v: 0 });
        res.status(200).json(products);
    }),

    getProductById: handleAsync(async (req, res) => {
        const { id } = req.params;
        const product = await productData.findById(id);
        if (!product) throw createError(404, "Product not found");
        res.status(200).json(product);
    }),

    addProduct: handleAsync(async (req, res) => {
        const product = new productData(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    }),

    updateProduct: handleAsync(async (req, res) => {
        const { id } = req.params;
        const update = req.body;
        const options = { new: true, runValidators: true };
        const updatedProduct = await productData.findByIdAndUpdate(id, update, options);
        if (!updatedProduct) throw createError(404, "Product not found");
        res.status(200).json(updatedProduct);
    }),

    deleteProduct: handleAsync(async (req, res) => {
        const { id } = req.params;
        const deletedProduct = await productData.findByIdAndDelete(id);
        if (!deletedProduct) throw createError(404, "Product not found");
        res.status(200).json({ message: "Product deleted successfully" });
    }),
};


// // For multiple db connection at a same time

// const createError = require("http-errors");

// const handleAsync = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         next(error);
//     }
// };

// module.exports = {
//     getAllProducts: handleAsync(async (req, res) => {
//         const connections = req.app.locals.dbConnections;

//         const results = await Promise.all(
//             connections.map(async (conn) => {
//                 const productData = conn.model("Product", require("../../models/AdminModel/productsData").schema);
//                 return await productData.find({}, { __v: 0 });
//             })
//         );

//         res.status(200).json(results);
//     }),

//     getProductById: handleAsync(async (req, res) => {
//         const { id } = req.params;
//         const connections = req.app.locals.dbConnections;

//         const results = await Promise.all(
//             connections.map(async (conn) => {
//                 const productData = conn.model("Product", require("../../models/AdminModel/productsData").schema);
//                 return await productData.findById(id);
//             })
//         );

//         const product = results.find((result) => result !== null);
//         if (!product) throw createError(404, "Product not found");
//         res.status(200).json(product);
//     }),

//     addProduct: handleAsync(async (req, res) => {
//         const connections = req.app.locals.dbConnections;
//         const productDetails = req.body;

//         const results = await Promise.all(
//             connections.map(async (conn) => {
//                 const productData = conn.model("Product", require("../../models/AdminModel/productsData").schema);
//                 const product = new productData(productDetails);
//                 return await product.save();
//             })
//         );

//         res.status(201).json(results);
//     }),

//     updateProduct: handleAsync(async (req, res) => {
//         const { id } = req.params;
//         const update = req.body;
//         const options = { new: true, runValidators: true };
//         const connections = req.app.locals.dbConnections;

//         const results = await Promise.all(
//             connections.map(async (conn) => {
//                 const productData = conn.model("Product", require("../../models/AdminModel/productsData").schema);
//                 return await productData.findByIdAndUpdate(id, update, options);
//             })
//         );

//         const updatedProduct = results.find((result) => result !== null);
//         if (!updatedProduct) throw createError(404, "Product not found");
//         res.status(200).json(updatedProduct);
//     }),

//     deleteProduct: handleAsync(async (req, res) => {
//         const { id } = req.params;
//         const connections = req.app.locals.dbConnections;

//         const results = await Promise.all(
//             connections.map(async (conn) => {
//                 const productData = conn.model("Product", require("../../models/AdminModel/productsData").schema);
//                 return await productData.findByIdAndDelete(id);
//             })
//         );

//         const deletedProduct = results.find((result) => result !== null);
//         if (!deletedProduct) throw createError(404, "Product not found");
//         res.status(200).json({ message: "Product deleted successfully" });
//     }),
// };
