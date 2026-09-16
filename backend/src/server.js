const env = require("./config/env");
const logger = require("./config/logger");
const { connectDatabase } = require("./config/database");
const app = require("./app");

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    logger.info(`Cashlytics API listening on :${env.port}`);
  });
}

start().catch((err) => {
  logger.error(err.message, { stack: err.stack });
  process.exit(1);
});
