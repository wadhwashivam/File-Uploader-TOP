import { Router } from "express";
import * as authenticationController from "../controllers/authenticationController.js";
const authenticationRouter = Router();

authenticationRouter.get("/login", authenticationController.getLoginPage);
authenticationRouter.post("/login", authenticationController.validateLogin,authenticationController.postLoginPage);
authenticationRouter.post("/logout", authenticationController.postLogOut);

authenticationRouter.get("/signup", authenticationController.getSignupPage);
authenticationRouter.post("/signup", authenticationController.validateSignUp,authenticationController.postSignupPage);


export default authenticationRouter;