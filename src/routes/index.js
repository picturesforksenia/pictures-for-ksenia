const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const uploadController = require("../controllers/upload");
const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '')
    }
})

let routes = (app, database) => {
    router.get("/", uploadController.getRandomFile(database));
    router.get("/upload", uploadController.showUploadSite);
    router.post("/upload", upload.any({storage}), uploadController.uploadFile(database));
    router.get("/files", uploadController.getListFiles(database));
    return app.use("/", router);
};
module.exports = routes;
