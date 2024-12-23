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
