// import { createClient } from 'redis';

// const client = createClient({
//     username: 'default',
//     password: 'IJDZmIAIbb5c7eWvTF68wT53MEkTyWKr',
//     socket: {
//         host: 'redis-19214.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 19214
//     }
// });

import { createClient } from "redis";

export const redisClient = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis Connected");
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.isOpen) {
    await redisClient.quit();
    console.log("Redis Disconnected");
  }
};

// For compatibility with existing services importing getRedis()
export const getRedis = () => redisClient;
