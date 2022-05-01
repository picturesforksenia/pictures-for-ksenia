require('dotenv').config();
const express = require("express");
const mongodb = require('mongodb');
const cors = require("cors");
const dbConfig = require("./config/db");
const initRoutes = require("./routes");

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true}));

const port = process.env.PORT || 8080;
app.listen(process.env.PORT || port, () => {
    console.log(`App now running on port ${port}`);
});

let database;

mongodb.MongoClient.connect(dbConfig.uri, (err, client) => {
    console.log('Initialize database connection.');
    if (err) {
        console.log(err);
        process.exit(1);
    }
    database = client.db();
    console.log('Database connection ready.');

    initRoutes(app, database);
});


