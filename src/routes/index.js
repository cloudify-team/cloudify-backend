const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const setupRoutes = (router, basePath) => {
  fs.readdirSync(basePath).forEach((folder) => {
    const folderPath = path.join(basePath, folder);

    if (fs.statSync(folderPath).isDirectory()) {
      const endpoint = `/${folder}`;

      fs.readdirSync(folderPath).forEach((file) => {
        const filePath = path.join(folderPath, file);

        if (file.endsWith(".js")) {
          const route = require(filePath);
          router.use(endpoint, route);
        }
      });

      console.log(`Mounted routes for endpoint: ${endpoint}`);
    }
  });
};

setupRoutes(router, path.join(__dirname, "."));

module.exports = router;
