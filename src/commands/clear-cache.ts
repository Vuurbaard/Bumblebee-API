import App from "../app";

import cacheService from "../services/cache.service";

App.boot().then(async () => {
  await cacheService.clear("all-fragments");
  console.log("Cache cleared!");
  process.exit();
});
