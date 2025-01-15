// For sigle db connection

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


// // For multiple db connection at a same time
// const express = require("express");
// const router = express.Router();
// const adminController = require('../../controllers/AdminController/ProductsController');

// // Middleware to validate database connections
// router.use((req, res, next) => {
//     if (!req.app.locals.dbConnections || req.app.locals.dbConnections.length === 0) {
//         return res.status(500).json({ message: "Database connections are not initialized" });
//     }
//     next();
// });

// router.post("/addproduct", adminController.addProduct);

// router.get("/getproducts", adminController.getAllProducts);

// router.get("/getproductbyid/:id", adminController.getProductById);

// router.put("/updateproduct/:id", adminController.updateProduct);

// router.delete("/deleteproduct/:id", adminController.deleteProduct);

// module.exports = router;
