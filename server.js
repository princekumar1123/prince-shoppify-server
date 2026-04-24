require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
// const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
//     .split(",")
//     .map((o) => o.trim());

// app.use(
//     cors({
//         origin: (origin, callback) => {
//             // Allow requests with no origin (mobile apps, curl, Postman)
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error(`CORS policy: origin ${origin} not allowed`));
//             }
//         },
//         credentials: true,
//     })
// );

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}

// ── Rate limiting — auth routes only ─────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                   // 20 login/register attempts per IP per window
    message: { status: false, message: "Too many attempts, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── Database ──────────────────────────────────────────────────────────────────
require("./initDB")();

// ── Routes ────────────────────────────────────────────────────────────────────
const adminRouter = require("./routers/AdminRouter/adminRouts");
const userRouter = require("./routers/UserRouter/userRouts");
const paymentRouter = require("./routers/PaymentRouter/paymentRouts");
const reviewRouter = require("./routers/ReviewRouter/reviewRouts");

app.use("/ecommerce", adminRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);
app.use("/reviews", reviewRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({ status: true, message: "Server is running" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
