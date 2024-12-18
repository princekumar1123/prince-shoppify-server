const createError = require("http-errors");
const mongoose = require("mongoose");

const productData = require('../../models/AdminModel/productsData')

module.exports = ({
    getAllProduct: async (req, res, next) => {
        const data = await productData.find({}, { _v: 0 })

        console.log(data);

        res.send(data)


    },
    addProduct: async (req, res, next) => {

        const products = new productData(req.body)

        const result = await products.save()

        console.log(result)

        res.send(result)

    },

    sample: async (req, res, next) => {
        console.log("ugfuug");
        
        res.send({data:"Hi prince"})

    }
});