import { createClient } from 'redis';

import config from '.';

export const redisClient = createClient({
    username: config.username,
    password: config.password,
    socket: {
        host: config.redis.host,
        port: Number(config.redis.port),
    }
});


export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log(" Redis Connected");

    }
}