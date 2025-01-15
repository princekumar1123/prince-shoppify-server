// single db connection at a time

require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')


const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors(
    // {
    //     credentials: true, // Allow cookies
    // }
))
app.use(express.urlencoded({ extended: true }))

require('./initDB')()

const adminRouter = require('./routers/AdminRouter/adminRouts')

const userRouter = require('./routers/UserRouter/userRouts')
app.use('/ecommerce', adminRouter)
app.use('/user', userRouter)
///http://localhost:9000/users

const PORT = 9000 || process.env.PORT
app.listen((PORT), () => {
    console.log(`Server is running in the PORT of ${PORT}`)
})




// // multiple db connection at a same time

// require("dotenv").config();
// const express = require("express");
// const morgan = require("morgan");
// const cors = require("cors");
// const initDB = require("./initDB");

// const app = express();
// app.use(express.json({ limit: "50mb" }));
// app.use(morgan("dev"));
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// (async () => {
//   try {
//     const dbConnections = await initDB();
//     app.locals.dbConnections = dbConnections;
//     console.log("Databases initialized successfully.");
//   } catch (error) {
//     console.error("Failed to initialize databases:", error.message);
//     process.exit(1);
//   }
// })();

// const adminRouter = require("./routers/AdminRouter/adminRouts");
// const userRouter = require("./routers/UserRouter/userRouts");
// app.use("/ecommerce", adminRouter);
// app.use("/user", userRouter);

// const PORT = 9000 || process.env.PORT;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
