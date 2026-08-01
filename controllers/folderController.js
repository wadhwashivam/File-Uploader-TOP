import * as db from "../database/queries.js";

async function getFoldersPage(req,res,next){
    try{
        const folders = await db.getFoldersByUser(req.user.id);
        res.render("folders/folderList",{
            title: "My Folders", folders
        })
    }catch(error){
        next(error);
    }
}

async function getNewFoldersPage(req,res,next){
    try{
        res.render("folders/newFolder",{
            title: "New Folder"
        })
    }catch(error){
        next(error);
    }
}

async function postCreateFolder(req,res,next){
    try{
        const { name } = req.body;

        if(!name || !name.trim()){
            return res.status(400).render("folders/newFolder", {
                title: "New Folder",
                errors: [{ msg: "Folder Name is required." }],
            });
        }
        await db.createFolder(name.trim(), req.user.id);
        res.redirect("/folders");
    }catch(error){
        next(error);
    }
}

async function getFolderPage(req,res,next){
    try{
        const folder = await db.getFolderById(req.params.id);

        if(!folder || folder.userId !== req.user.id){
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Folder Not Found"
            });
        }
        res.render("folders/folderDetail", {
            title: folder.name, folder
        })
    }catch(error){
        next(error);
    }
}

async function getEditFolderPage(req,res,next){
    try{
        const folder = await db.getFolderById(req.params.id);

        if (!folder || folder.userId !== req.user.id){
            return res.status(404).render("error", {
                title: "Not Found",
                message: "Folder Not Found"
            });
        }
        res.render("folders/editFolder", {
            title: "Edit folder",
            folder
        })
    }catch(error){
        next(error);
    }
}

async function postUpdateFolder(req,res,next) {
    try {
        const folder = await db.getFolderById(req.params.id);

        if (!folder || folder.user.id !== req.user.id){
            return res.status(400).render("error", {
                title: "Not Found",
                message: "Folder Not Found"
            });
        }

        const { name } = req.body;
        if (!name || !name.trim()){
            return res.status(400).render("folders/editFolder", {
                title: "Edit Folder",
                folder,
                errors: [{ msg: "Folder Name is required." }]
            })
        };

        await db.updateFolderName(req.params.id, name.trim());
        res.redirect(`/folders/${req.params.id}`);
    } catch (error) {
        next(error);
    }
}

async function postDeleteFolder(req,res,next){
    try{
        const folder = await db.getFolderById(req.params.id);

        if (!folder || folder.userId !== req.user.id){
            return res.status(400).render("error", {
                title: "Not Found",
                message: "Folder Not Found"
            })
        }

        await db.deleteFolder(req.params.id);
        res.redirect("/folders");
    }catch(error){
        next(error);
    }
}

export { getFoldersPage, getNewFoldersPage, postCreateFolder, getFolderPage, getEditFolderPage, postUpdateFolder, postDeleteFolder}