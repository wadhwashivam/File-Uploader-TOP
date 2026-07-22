import * as db from "../database/queries.js";
import bcrypt from "bcryptjs";
import passport from "passport";
import { body, validationResult } from "express-validator";

// Validation for Login Form

export const validateLogin = [
    body("username").trim().isEmail().notEmpty().withMessage("Username must be a valid email address.").escape(),
    body("password").isLength({ min: 6 }).withMessage("Password must be greater or equal to 6 characters.")
]

// Validation for Sign Up Form
export const validateSignUp = [
    body("firstname").trim().notEmpty().withMessage("First Name is required").escape(),
    body("lastname").trim().notEmpty().withMessage("Last Name is required").escape(),
    body("username").trim().isEmail().notEmpty().withMessage("Username must be a valid email address.").escape(),
    body("password").isLength({ min: 6 }).withMessage("Password must be greater or equal to 6 characters."),
    body("confirmPassword").custom((value, {req}) => {
        if (value !== req.body.password){
            throw new Error("Password do not match");
        }
        return true;
    })
];

async function getLoginPage(req,res,next){
    try{
        res.render("authentication/loginForm", {
            title: "Log-in Form"
        })
    }catch(error){
        next(error);
    }
}

async function postLoginPage(req,res,next){
    
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(401).render("authentication/loginForm", {
            title: "Login Form",
            errors: errors.array(),
            formData: req.body,
        });
    };

    passport.authenticate("local", (error, user, info)=> {
        if (error){
            return next(error);
        }

        if (!user){
            return res.status(401).render("authentication/loginForm", {
                title: "Login Form",
                errors: [{ msg: info.message || "Invalid credentials "}],
                formData: req.body
            });
        };

        req.logIn(user, (error) => {
            if (error){
                return next(error);
            }
            return res.redirect("/");
        });
    })(req,res,next);
}

async function postLogOut(req,res,next){
    req.logout((error) => {
        if (error){
            return next(error);
        }
        res.redirect("/");
    })
}

async function getSignupPage(req,res,next){
    try {
        res.render("authentication/signupForm", {
            title: "Sign-up Form"
        })
    } catch (error) {
        next(error);
    }
}

async function postSignupPage(req,res,next){
    // If there are errors then throw render them on the same page
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(401).render("authentication/signupForm", {
            title: "Sign Up Form",
            errors: errors.array(),
            formData: req.body,
        });
    };


    try {
        const { firstname, lastname, username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.signUpUser(firstname, lastname, username, hashedPassword);

        res.redirect("/login");
    } catch (error) {
        next(error);
    }
}



export { getLoginPage, postLoginPage, getSignupPage, postSignupPage, postLogOut };