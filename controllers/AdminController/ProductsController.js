// const createError = require("http-errors");
// const mongoose = require("mongoose");

// const productData = require('../../models/AdminModel/productsData')

// module.exports = ({
//     getAllProduct: async (req, res, next) => {
//         const data = await productData.find({}, { _v: 0 })

//         console.log(data);

//         res.send(data)


//     },
//     getProductById: async (req, res, next) => {
//         const paramsID = req.params.id;
//         const particularData = await productData.findById(paramsID)
//         res.send(particularData)
//     },

//     addProduct: async (req, res, next) => {

//         const products = new productData(req.body)

//         const result = await products.save()

//         console.log(result)

//         res.send(result)

//     },
//     updateProduct: async (req, res, next) => {

//         const id = req.params.id
//         const update = req.body
//         const option = { new: true }
//         const result = await productData.findByIdAndUpdate(id, update, option)

//         res.send(result)

//     },

//     deleteProduct: async (req, res, next) => {
//         const id = req.params.id

//         const result = await productData.findByIdAndDelete

//         res.send(result)
//     },

//     sample: async (req, res, next) => {
//         console.log("ugfuug");

//         res.send({ data: "Hi prince" })

//     }
// });




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