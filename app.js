import "dotenv/config";

import path from "node:path";
import express from "express";
import expressSession from "express-session";
import { fileURLToPath } from "node:url";

// Passport Imports
import "./config/passport.js";
import passport from "passport";

// Prisma Imports
import prisma from "./database/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

// Router Imports
import authenticationRouter from "./routes/authenticationRouter.js";
import indexRouter from "./routes/indexRouter.js";
import fileRouter from "./routes/fileRouter.js";
import folderRouter from "./routes/folderRouter.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressSession({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 //ms
    },
    secret: 'a santa at nasa',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
        prisma, 
        {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded( { extended: false}));

app.use("/", indexRouter);
app.use("/", authenticationRouter);
app.use("/", fileRouter);
app.use("/", folderRouter);

app.listen(process.env.NODE_PORT, (error) => {
    if (error){
        throw error;
    }
    console.log("App listening on port: ", process.env.NODE_PORT);
})