const createError = require("http-errors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const registerData = require("../../models/UserModel/UserRegister");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../../services/jwtUtils");



module.exports = {
    getAlluserData: async (req, res, next) => {
        // next(new Error("cannot get the userData.."))
        // res.send("getting the list of the all userData in the home page of the application...")
        try {
            const result = await registerData.find({}, { __v: 0 }); //find method takes two parameter i.e.,(query, projection)...

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
        try {
            let body = req.body;
            const bodyPassword = body.password;
            const saltRounds = 10;
            bcrypt.hash(bodyPassword, saltRounds, async function (err, hash) {
                body = { ...body, password: hash };
                console.log("body", body)
                const register = new registerData(body);
                console.log("register", register)
                const result = await register.save();
                console.log("result", result)
                res.send({ status: true, result });
            });
        } catch (error) {
            console.log("error", error)
        }
    },


    loginCredential: async (req, res, next) => {
        const { email, password: payloadPassword } = req.body;
        const { password: dbPassword } = await registerData.findOne({ email });
        const { _id:id, name:dbName } = await registerData.findOne({ email })

        console.log("id",id);
        console.log("dbName",dbName);
        
        
        bcrypt.compare(payloadPassword, dbPassword, function (err, result) {
            console.log("result", result);

            if (result) {
                const token = generateToken({ email: email, password: dbPassword });

                console.log("token", token);


                const refreshToken = jwt.sign(
                    {
                        email: email,
                        password: dbPassword,
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: "1d" }
                );

                console.log("refreshToken", refreshToken);
                res.cookie("jwt", refreshToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });

                res.send({
                    status: true,
                    message: "Authentication successfull",
                    token: token,
                    id,
                    name:dbName
                });
            } else {
                res.send({
                    status: false,
                    message: "Authentication failed",
                });
            }
        });
    },

    findUserById: async (req, res, next) => {
        // res.send("userData taken by the id.")
        const id = req.params.id;
        try {
            const userData = await registerData.findById(id); /// using the "findById" method

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
            const result = await registerData.findByIdAndUpdate(id, update, option); //*** this function takes three parameter */

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
            const result = await registerData.findByIdAndDelete(id);
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