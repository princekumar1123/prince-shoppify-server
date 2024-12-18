const createError = require("http-errors");
const mongoose = require("mongoose");

const userData = require("../../models/UserModel/userData");

module.exports = {
    getAlluserData: async (req, res, next) => {
        // next(new Error("cannot get the userData.."))
        // res.send("getting the list of the all userData in the home page of the application...")
        try {
            const result = await userData.find({}, { __v: 0 }); //find method takes two parameter i.e.,(query, projection)...

            //******to pass the required field as 1 and not required as 0 */
            // const result = await userData.find({}, { name:1,price:1, _id:0 }); //find method takes two parameter i.e.,(query, projection)...

            // const result = await userData.find({price:90000}, {}); // to pass in query of the exact match value in the response data of an arrary of object.
            console.log("result", result);
            res.send(result);
        } catch (error) {
            console.log(error.message);
        }
    },

    createNewUser: async (req, res, next) => {
        //*** userData saving using async & await... */
        // console.log("req",req.body)
        try {
            const userData = new userData(req.body);
            const result = await userData.save();
            res.send(result);
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError") {
                next(createError(422, error.message));
                return;
            }
            next(error);
        }
    },
    findUserById: async (req, res, next) => {
        // res.send("userData taken by the id.")
        const id = req.params.id;
        try {
            const userData = await userData.findById(id); /// using the "findById" method

            // const userData = await userData.findOne({ _id: id });   ////**** using the "findOne" method */
            if (!userData) {
                throw createError(404, "User doesn't  exist!!!");
            }

            res.send(userData);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid User ID"));
                return;
            }
            next(error); //nested router optional
        }
    },

    updateUserById: async (req, res, next) => {
        // res.send("userData details are updated successfully by the id.")
        try {
            const id = req.params.id;
            const update = req.body;

            const option = { new: true }; //**optional paramter for below function to get the updated value. */
            const result = await userData.findByIdAndUpdate(id, update, option); //*** this function takes three parameter */

            if (!result) {
                throw createError(404, "User doesn't exist");
            }
            res.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) {
                return next(createError(400, "Invalid User ID"));
            }
            next(error);
        }
    },

    deleteUserById: async (req, res, next) => {
        // res.send("User was deleted successfully.")
        const id = req.params.id;
        try {
            const result = await userData.findByIdAndDelete(id);
            if (!result) {
                throw createError(404, "User doesn't  exist!!!");
            }
            console.log(result);
            res.send(result);
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid User ID"));
                return;
            }
            next(error);
        }
    },
};