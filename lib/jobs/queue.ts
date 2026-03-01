import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
};

export const claimsQueue =
  process.env.REDIS_URL || process.env.REDIS_HOST
    ? new Queue("claim-verification", { connection: process.env.REDIS_URL ? { url: process.env.REDIS_URL } : connection })
    : null;
