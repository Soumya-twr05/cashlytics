const env = require("./config/env");
const { connectDatabase } = require("./config/database");
const app = require("./app");

async function start() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`Cashlytics API v2 listening on :${env.port}`);
  });
}

start().catch((err) => {
  console.error(err.message, { stack: err.stack });
  process.exit(1);
});
