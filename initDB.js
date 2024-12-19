const mongoose = require("mongoose");

const dbUrl = "mongodb+srv://prince:TZiwzJ2R5oDhdVmA@prince-shoppify-cluster.gmyuu.mongodb.net/?retryWrites=true&w=majority&appName=prince-shoppify-cluster"

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

module.exports = () => {

  
  mongoose
    .connect(dbUrl, connectionParams)
    .then(() => {
      console.log("Mongodb database is connected...");
    })
    .catch((err) => {
      console.log(err.message);
    });

  // mongoose
  //   .connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME })
  //   .then(() => {
  //     console.log("Mongodb database is connected...");
  //   })
  //   .catch((err) => {
  //     console.log(err.message);
  //   });

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