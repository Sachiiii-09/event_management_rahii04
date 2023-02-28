const mongoose = require('mongoose');

//avoiding error for strict query
mongoose.set('strictQuery', true);

//importing connection
mongoose.connect(process.env.MONGO_URL)

//checking wheteher it' connected or Not
const connection = mongoose.connection;
connection.on('connected',()=>{
    console.log("MongoDB is Connection is Successfull!");
});

//it will shw if the connection string error then

connection.on('error',(error)=>{
    console.log("Error in MongoDB",error);
});

module.exports = mongoose;