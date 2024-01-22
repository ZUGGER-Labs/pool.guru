import { createClient } from "redis";

const getRedis = async () => {
  try {
    const client = createClient({ url: process.env.REDIS_URL! });
    await client.connect();
    return client;
  } catch (err) {
    console.error("connect redis server error:", err);
    throw err;
  }
  // .on('error', err => console.error('Redis Client Error', err))
  // .connect();
};

export default getRedis
