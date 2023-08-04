import { NextFunction, Request, Response } from "express";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    }
  }
}) 

function requestLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    if (res.statusCode >= 400 && res.statusCode <= 600) {
    logger.error(`${req.method} (status ${res.statusCode}) at ${req.path}`)
  } else {
    logger.info(`${req.method} (status ${res.statusCode}) at ${req.path}`)
  }
  })
  next()
}

export { logger, requestLogger };