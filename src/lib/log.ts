import pino from "pino";
import { env } from "process";

export const logger = pino({
  browser: {
    write: (o) => console.log(JSON.stringify(o)),
  },
  level: env.NODE_ENV === "production" ? "info" : "debug",
  name: "app",
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    error: pino.stdSerializers.errWithCause,
  },
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});
