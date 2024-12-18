const mongoose = require("mongoose");

module.exports = () => {
  mongoose
    .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
    .then(() => {
      console.log("Mongodb database is connected...");
    })
    .catch((err) => {
      console.log(err.message);
    });

  ///***mongoose events */
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to database");
  });

  mongoose.connection.on("error", (error) => {
    console.log(error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose connection is disconnected...");
  });
};