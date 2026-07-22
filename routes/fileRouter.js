import Router from "router";
import * as fileController from "../controllers/fileController.js";
import upload from "../config/multer.js";
import ensureAuthenticated from "../middleware/ensureAuthenticated.js";

const fileRouter = Router();


fileRouter.get("/fileupload", ensureAuthenticated, fileController.getUploadPage);
fileRouter.post("/fileupload", ensureAuthenticated, upload.single("file"), fileController.postUploadPage);

fileRouter.get("/files/:id", ensureAuthenticated, fileController.getFilePage);
fileRouter.get("/files/:id/download", ensureAuthenticated, fileController.downloadFile);
export default fileRouter;