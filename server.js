const express = require("express")
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
exports.dotenv = require('dotenv').config();

const port = process.env.PORT;
const hostname = process.env.HOST_NAME;
const dbname = process.env.MYSQL_DATABASE;


app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use('/static', express.static(path.join(__dirname, './uploads')));

app.use(cors());


const allRoutes = require('./routes/allRoutes');

app.use("/", allRoutes)


app.listen(port,hostname,()=>{
    console.log("Server is running", hostname + ':' + port);
    console.log("Connected DataBase", dbname);
})