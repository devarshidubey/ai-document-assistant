import jwt from "jsonwebtoken";
import HTTPError from "../utils/HTTPError.js";

export const requireAuth = async (req, res , next)=> {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if(authHeader && authHeader.startsWith("Bearer")) token = authHeader.split(" ")[1];
        else throw new HTTPError(401, "No Access Token"); 

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.user = decoded;
        } catch(err) {
            throw new HTTPError(401, "Invalid Access Token");
        }        
        
        next();
    } catch(err) {
        next(err);
    }
}