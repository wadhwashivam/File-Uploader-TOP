import * as db from "../database/queries.js";


async function getHomePage(req,res,next){
    try{
        res.render("index", {
            title: "HomePage"
        })
    }catch(error){
        next(error);
    }
}

export { getHomePage };