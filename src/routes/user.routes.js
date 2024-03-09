// For creating the router we have to create the router.

// We creating as we creating the app using express.

import { Router } from "express";
import { accessfromrefresh, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Here we give the operation specification
router.route("/register").post(
    // multer middleware which will take two object (avatar and coverimage)
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyjwt,logoutUser);
router.route("/refresh-token").post(accessfromrefresh);

export default router
// This router we are using in the app.js file
// We do these things in mainly app.js File.