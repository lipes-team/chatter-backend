import { app } from "./app";
import { logger } from "./src/utils/logger";

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  logger.info(`Running on http://localhost:${PORT}`)
})
