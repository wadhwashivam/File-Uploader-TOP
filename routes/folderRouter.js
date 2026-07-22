import Router from "router";
import ensureAuthenticated from "../middleware/ensureAuthenticated.js";
import * as folderController from "../controllers/folderController.js"

const folderRouter = Router();

folderRouter.get("/folders", ensureAuthenticated, folderController.getFoldersPage);
folderRouter.get("/folders/new", ensureAuthenticated, folderController.getNewFoldersPage);
folderRouter.post("/folders", ensureAuthenticated, folderController.postCreateFolder);

folderRouter.get("/folders/:id", ensureAuthenticated, folderController.getFolderPage);
folderRouter.get("/folders/:id/edit", ensureAuthenticated, folderController.getEditFolderPage);
folderRouter.post("/folders/:id", ensureAuthenticated, folderController.postUpdateFolder);
folderRouter.post("/folders/:id/delete", ensureAuthenticated, folderController.postDeleteFolder);

export default folderRouter;