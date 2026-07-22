import * as db from "../database/queries.js";
import supabase from "../lib/supabase.js";

async function getUploadPage(req,res,next){
    try{
        const folders = await db.getFoldersByUser(req.user.id);
        res.render("fileUpload", {
            title: "Upload a File",
            folders,
            selectedFolderId: req.query.folderId || "",
        });
    }catch(error){
        next(error);
    }
}

async function postUploadPage(req,res,next){
    try{
        if (!req.file){
            const folders = await db.getFoldersByUser(req.user.id);
            return res.status(400).render("fileupload", {
                title: "Upload a file",
                folders,
                selectedFolderId: req.body.folderId || "",
                errors: [{ msg: "Please select a file to upload." }],
            });
        }

        const { folderId } = req.body;

        if (folderId){
            const folder = await db.getFolderById(folderId);
            if (!folder || folder.userId !== req.user.id){
                return res.status(400).render("error", {
                    title: "Forbidden",
                    message: "That folder doesn't belong to you."
                });
            }
        }

        const filePath = `${req.user.id}/${Date.now()}-${req.file.originalname}`;
        const { data, error } = await supabase.storage.from('user-files').upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
        });

        if (error){
            return next(error);
        }

        await db.createFile({
            filename: req.file.originalname,
            path: data.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            userId: req.user.id,
            folderId: folderId || null,
        });

        res.redirect(folderId ? `/folders/${folderId}`: "/");
    }catch(error){
        next(error);
    }
}

async function getFilePage(req,res,next){
    try{
        const file = await db.getFileById(req.params.id);

        if (!file || file.userId !== req.user.id){
            return res.status(404).render("error", {
                title: "Not Found",
                message: "File Not Found",
            });
        }

        res.render("fileDetail", {
            title: file.filename,
            file,
        })
    }catch(error){
        next(error);
    }
}

async function downloadFile(req,res,next){
    try{
        const file = await db.getFileById(req.params.id);

        if (!file || file.userId !== req.user.id){
            return res.status(404).render("error", {
                title: "Not Found",
                message: "File Not Found",
            });
        }

        const { data, error } = await supabase.storage.from('user-files').createSignedUrl(file.path, 60);
        if (error){
            return next(error);
        }

        res.redirect(data.signedUrl);
    }catch(error){
        next(error);
    }
}

export { getUploadPage, postUploadPage, getFilePage, downloadFile }; 