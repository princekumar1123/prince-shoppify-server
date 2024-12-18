const express = require("express");
const router = express.Router();
const userControllers =  require('../../controllers/UserController/userController')

// to get all user details
router.get("/getAllUsers",userControllers.getAlluserData );

//to create a new user 
router.post("/postAUser",userControllers.createNewUser)

//to get a user details by id
router.get("/getAUserById/:id",userControllers.findUserById)

//to update a user by id
router.put("/updateAUserById/:id",userControllers.updateUserById)

//to delete a user by id
router.delete("/deleteAUserById/:id",userControllers.deleteUserById)

module.exports = router; // need to export the router module
