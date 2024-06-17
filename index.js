const express = require("express");
const { connectDB } = require('./db');
const { iniRedisClient } = require('./src/middlewares/redis');
require("dotenv").config();

const iniExpressServer = async () => {
    try {
        //Inicializando la aplicación express
        const app = express();
        app.use(express.json());
        //Conección Redis
        await iniRedisClient();
        //Activate Routes
        app.use('/api/v1', require('./src/Routes/index'));
        //Start Server Express
        const port = 3000;
        connectDB().then(() => {
            console.log('DB Connected');
            app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
            });
        }).catch((err) => {
            console.log("ERROR TO CONNECTED BD!");
            console.error(err);
        });
    } catch (error) {
        console.error('Failed to create the Express Server with error: ' + error);
    }
};

iniExpressServer()
    .then()
    .catch((e) => {
        console.error(e);
    });


