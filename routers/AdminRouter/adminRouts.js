const express = require("express");
const router = express.Router();
const adminController = require('../../controllers/AdminController/ProductsController')

router.post("/addproduct",adminController.addProduct)

router.get("/getproducts",adminController.getAllProduct)

router.get("/abc",adminController.sample)

router.get("/getproductbyid/:id",adminController.getProductById)

module.exports = router;