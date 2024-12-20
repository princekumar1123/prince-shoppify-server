const express = require("express");
const router = express.Router();
const adminController = require('../../controllers/AdminController/ProductsController')

router.post("/addproduct", adminController.addProduct)

router.get("/getproducts", adminController.getAllProducts)

// router.get("/abc", adminController.sample)

router.get("/getproductbyid/:id", adminController.getProductById)

router.put("/updateproduct/:id", adminController.updateProduct)

router.delete("/deleteproduct/:id", adminController.deleteProduct)

module.exports = router;