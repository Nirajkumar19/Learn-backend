import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/aysncHandler.js";
import { errorHandler } from "../utils/errorHandler.js";
import  jwt  from "jsonwebtoken";
// For verifying the user is logged in or not, we need access token and we can get this access token with the help of cookie which we send the token in the cookie during login.
const verifyjwt = asyncHandler(async( req,_,next ) => {
    // Here instead of res we give "_" because there is no use of req here so when we don't have use then we can use "_"
    try {
        const token = req.cookies?.accessToken; // Here we use cookies don't use cookie (please take care of that).
        if(!token){
            throw new errorHandler(401,"Invalid token");
        }
        // Some time we get the token from the header so we can give in or condition as well
    
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        // After verifying it will return the object which we pass during the creation of access token.
    
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new errorHandler(401,"Invalid token");
        }
    
        // Now add this user in the req as like cookieparser
        req.user = user;
        next(); //Pass the control to next refrence.
    } catch (error) {
        throw new errorHandler(400,"Access token invalid");
    }
})

export { verifyjwt }