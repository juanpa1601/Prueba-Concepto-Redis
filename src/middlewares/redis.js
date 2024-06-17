const { createClient } = require("redis");
const hash = require("object-hash");
require("dotenv").config();

let redisClient = undefined;

const iniRedisClient = async () => {
    const redisURL = process.env.REDIS_URL;
    if(redisURL){
        redisClient = createClient({url: redisURL}).on("error", (error) => {
            console.error('Failed to create the Redis Client with error: ' + error);
        }); 
        try {
            await redisClient.connect();
            console.log('Redis client connected');
        } catch (err) {
            console.error('Error: ' + err);
        }
    }
};

const requestToKey = (req) =>{
    //Creamos el objeto personalizado
    //(cualquier consulta o cuerpo de solicitud a traves de Express)
    const reqDataToHash = {
        query: req.query,
        body: req.body,
    };
    return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

const isRedisWorking = () => {
    //Verificar si hay una conexión activa con Redis
    return !!redisClient?.isOpen;;
};

const writeData = async (key, data, options) => {
    if(isRedisWorking()){
        try {
            await redisClient.set(key, JSON.stringify(data), options);
        } catch (error) {
            console.error('Failed to write data with error: ' + error);
        }
    }
};

const readData = async (key) => {
    let cachedValue = undefined;
    if(isRedisWorking()){
        try {
            cachedValue = await redisClient.get(key);
            if(cachedValue) { return cachedValue; }
        } catch (error) {
            console.error('Failed to read data with error: ' + error);
        }
    }
};

const redisCachingMiddleware = (
    options = {
        EX: 21600, //6 horas
    }
    ) => {
        return async (req, res, next) => {
            if(isRedisWorking()) {
                const key = requestToKey(req);
                //Verifica si la clave existe en el cache de Redis
                const cachedValue = await readData(key);
                if(cachedValue){
                    try{
                        //Devolvemos datos JSON almacenados en Redis
                        return res.json(JSON.parse(cachedValue));
                    } catch (error) {
                        //Devolvemos datos no JSON almacenados en Redis
                        return res.send(cachedValue);
                    }
                } else {
                    //Almacenamos en el cache de Redis
                    const oldSend = res.send;
                    res.send = data => {
                        res.send = oldSend;
                        //Almacenamos en el cache de Redis solo si tiene exito
                        if(res.statusCode.toString().startsWith('2')){
                            writeData(key, data, options);
                        }
                        return res.send(data);
                    };
                    next();
                }
            } else {
                next();
                console.log('There is no connection to Redis');
            }
        };
}

module.exports = { iniRedisClient, redisCachingMiddleware };