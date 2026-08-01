import prisma from "./prisma.js";

async function getUsersByUsername(username){
    return prisma.user.findUnique({ where: { username }});
};

async function getUserById(id){
    return prisma.user.findUnique({ where: { id }});
}

async function signUpUser(firstname, lastname, username, hashedPassword){
    return prisma.user.create({
            data: {
                firstname: firstname,
                lastname: lastname,
                username: username,
                password: hashedPassword,
            },
    });
}

async function createFile({ filename, path, size, mimeType, userId, folderId }){
    return prisma.file.create({
        data: { filename, path, size, mimeType, userId, folderId: folderId || null}
    });
}

async function createFolder(name, userId){
    return prisma.folder.create({
        data: { name, userId}
    });
}

async function getFoldersByUser(userId){
    return prisma.folder.findMany({
        where: { userId },
    });
}

async function getFolderById(id){
    return prisma.folder.findUnique({
        where: { id },
        include: { files: true, user: true },
    });
}

async function updateFolderName(id, name){
    return prisma.folder.update({
        where: {id},
        data: {name},
    });
}

async function deleteFolder(id){
    return prisma.folder.delete({
        where: { id },
    });
}

async function getFileById(id){
    return prisma.file.findUnique({
        where: { id },
        include: {user: true, folder: true},
    });
}

export { getUserById, getUsersByUsername, signUpUser, createFile, createFolder, getFoldersByUser, getFolderById, updateFolderName, deleteFolder, getFileById }