// for Single db connection 

const express = require("express");
const router = express.Router();
const userRegisterController =  require('../../controllers/UserController/userRegisterController')

// to get all user details
router.get("/getAllUsers",userRegisterController.getAlluserData );

//to create a new user 
router.post("/register",userRegisterController.createNewUser)

router.post("/login",userRegisterController.loginCredential)


//to get a user details by id
router.get("/getAUserById/:id",userRegisterController.findUserById)

//to update a user by id
router.put("/updateAUserById/:id",userRegisterController.updateUserById)

//to delete a user by id
router.delete("/deleteAUserById/:id",userRegisterController.deleteUserById)

module.exports = router; // need to export the router module


// For multiple db connection
// const express = require("express");
// const router = express.Router();
// const userRegisterController = require('../../controllers/UserController/userRegisterController');

// // Middleware to validate database connections
// router.use((req, res, next) => {
//     if (!req.app.locals.dbConnections || req.app.locals.dbConnections.length === 0) {
//         return res.status(500).json({ message: "Database connections are not initialized" });
//     }
//     next();
// });

// // To get all user details
// router.get("/getAllUsers", userRegisterController.getAlluserData);

// // To create a new user
// router.post("/register", userRegisterController.createNewUser);

// // To log in a user
// router.post("/login", userRegisterController.loginCredential);

// // To get a user detail by ID
// router.get("/getAUserById/:id", userRegisterController.findUserById);

// // To update a user by ID
// router.put("/updateAUserById/:id", userRegisterController.updateUserById);

// // To delete a user by ID
// router.delete("/deleteAUserById/:id", userRegisterController.deleteUserById);

// module.exports = router;
