const express = require("express");
const app = express();

//.end package install and import the below package for usage for the .env
require('dotenv').config()

const cors = require('cors')

// //dbConfig just need to import for connection because already staments are written in dbConfig
const dbConfig = require('./config/dbConfig')

// //de structure the json from front end
app.use(cors({
    origin: 'https://event-management-rahii04.netlify.app'
  }));

app.use(express.json());

// //created end point connecting
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const organizerRoute = require('./routes/organizerRoute')
const path = require('path')


// //it will take the date from /api/user

app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/organizer', organizerRoute);


const port = process.env.PORT || 5000;

//testing purpose for the below
app.get('/',(req,res)=>{
    res.header('Access-Control-Allow-Origin', 'https://event-management-rahii04.netlify.app');
    res.status(201).json("server start")
});


app.listen(port, () => console.log(`DB Server started at port ${port}`));