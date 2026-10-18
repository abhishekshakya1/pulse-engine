import pino from "pino";
import pretty from "pino-pretty";

const isDev = process.env.NODE_ENV === "development";

// Next.js synchronous pretty stream (100% compatible with Turbopack & Webpack)
const stream = isDev
  ? pretty({
      colorize: true,
      translateTime: "SYS:HH:MM:ss",  // SYStem Local Time use karo!
      ignore: "pid,hostname",
    })
  : undefined;

export const logger = pino(
  {
    level: isDev ? "debug" : "info",
    base: isDev ? undefined : { env: process.env.NODE_ENV },
  },
  stream
);
