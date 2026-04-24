const mongoose = require("mongoose");

module.exports = () => {
    const dbUrl = process.env.MONGODB_URI;

    if (!dbUrl) {
        console.error("MONGODB_URI is not defined in .env");
        process.exit(1);
    }

    mongoose
        .connect(dbUrl, { dbName: process.env.DB_NAME })
        .then(() => {
            console.log("MongoDB database is connected...");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err.message);
            process.exit(1);
        });

    mongoose.connection.on("connected", () => {
        console.log("Mongoose connected to database");
    });

    mongoose.connection.on("error", (error) => {
        console.error("Mongoose error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
        console.log("Mongoose connection disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("Mongoose connection closed on app termination");
        process.exit(0);
    });
};
