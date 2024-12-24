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