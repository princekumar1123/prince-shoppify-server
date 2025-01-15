// For single db connection

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



// // For multiple DB connection at a same time
// const createError = require("http-errors");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { generateToken } = require("../../services/jwtUtils");

// module.exports = {
//     getAlluserData: async (req, res, next) => {
//         try {
//             const connections = req.app.locals.dbConnections;
//             const results = await Promise.all(
//                 connections.map(async (conn) => {
//                     const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                     return await registerData.find({}, { __v: 0 });
//                 })
//             );

//             res.send({ status: true, data: results });
//         } catch (error) {
//             console.error(error.message);
//             next(createError(500, "Error fetching user data"));
//         }
//     },

//     createNewUser: async (req, res, next) => {
//         try {
//             const connections = req.app.locals.dbConnections;
//             let { password, ...userData } = req.body;
//             const saltRounds = 10;

//             bcrypt.hash(password, saltRounds, async function (err, hash) {
//                 if (err) {
//                     throw createError(500, "Error encrypting password");
//                 }

//                 userData.password = hash;

//                 const results = await Promise.all(
//                     connections.map(async (conn) => {
//                         const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                         const newUser = new registerData(userData);
//                         return await newUser.save();
//                     })
//                 );

//                 res.send({ status: true, results });
//             });
//         } catch (error) {
//             console.error("Error creating user:", error.message);
//             next(createError(500, "Error creating new user"));
//         }
//     },

//     loginCredential: async (req, res, next) => {
//         try {
//             const { email, password: payloadPassword } = req.body;
//             const connections = req.app.locals.dbConnections;

//             const loginPromises = connections.map(async (conn) => {
//                 const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                 const user = await registerData.findOne({ email });

//                 if (user) {
//                     const match = await bcrypt.compare(payloadPassword, user.password);
//                     if (match) {
//                         const token = generateToken({ email: user.email });
//                         const refreshToken = jwt.sign(
//                             { email: user.email },
//                             process.env.REFRESH_TOKEN_SECRET,
//                             { expiresIn: "1d" }
//                         );

//                         res.cookie("jwt", refreshToken, {
//                             httpOnly: true,
//                             sameSite: "None",
//                             secure: true,
//                             maxAge: 24 * 60 * 60 * 1000,
//                         });

//                         return {
//                             status: true,
//                             message: "Authentication successful",
//                             token,
//                             id: user._id,
//                             name: user.name,
//                         };
//                     }
//                 }
//                 return null;
//             });

//             const results = await Promise.all(loginPromises);

//             // Respond with the first successful login or an error
//             const validResult = results.find((result) => result !== null);
//             if (validResult) {
//                 res.send(validResult);
//             } else {
//                 res.send({ status: false, message: "Authentication failed" });
//             }
//         } catch (error) {
//             console.error("Error during login:", error.message);
//             next(createError(500, "Error during login"));
//         }
//     },

//     findUserById: async (req, res, next) => {
//         try {
//             const { id } = req.params;
//             const connections = req.app.locals.dbConnections;

//             const results = await Promise.all(
//                 connections.map(async (conn) => {
//                     const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                     return await registerData.findById(id);
//                 })
//             );

//             const user = results.find((result) => result !== null);
//             if (user) {
//                 res.send(user);
//             } else {
//                 throw createError(404, "User doesn't exist");
//             }
//         } catch (error) {
//             console.error(error.message);
//             if (error instanceof mongoose.CastError) {
//                 next(createError(400, "Invalid User ID"));
//             } else {
//                 next(error);
//             }
//         }
//     },

//     updateUserById: async (req, res, next) => {
//         try {
//             const { id } = req.params;
//             const update = req.body;
//             const connections = req.app.locals.dbConnections;

//             const results = await Promise.all(
//                 connections.map(async (conn) => {
//                     const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                     return await registerData.findByIdAndUpdate(id, update, { new: true });
//                 })
//             );

//             const updatedUser = results.find((result) => result !== null);
//             if (updatedUser) {
//                 res.send(updatedUser);
//             } else {
//                 throw createError(404, "User doesn't exist");
//             }
//         } catch (error) {
//             console.error(error.message);
//             if (error instanceof mongoose.CastError) {
//                 next(createError(400, "Invalid User ID"));
//             } else {
//                 next(error);
//             }
//         }
//     },

//     deleteUserById: async (req, res, next) => {
//         try {
//             const { id } = req.params;
//             const connections = req.app.locals.dbConnections;

//             const results = await Promise.all(
//                 connections.map(async (conn) => {
//                     const registerData = conn.model("UserRegister", require("../../models/UserModel/UserRegister").schema);
//                     return await registerData.findByIdAndDelete(id);
//                 })
//             );

//             const deletedUser = results.find((result) => result !== null);
//             if (deletedUser) {
//                 res.send(deletedUser);
//             } else {
//                 throw createError(404, "User doesn't exist");
//             }
//         } catch (error) {
//             console.error(error.message);
//             if (error instanceof mongoose.CastError) {
//                 next(createError(400, "Invalid User ID"));
//             } else {
//                 next(error);
//             }
//         }
//     },
// };
