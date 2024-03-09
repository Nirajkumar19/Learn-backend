// Since we have written the code of server listining so now we can start the write the code in app.

// For using the middleware or configuration, we mostly use the app.use().

/* We are using cookies, CORS(
    About CORS:- CORS is cross origin.
    Basically we restrict some url. We are not allowing all the url who can send the request to our server. Because if any url send request to our server then there will so many loads on our server. That's why we usig CORS.)

These two are package so we have to install those packages.
*/

import  express  from "express";
import cookieParser from "cookie-parser";
// cookieParser will help to access the cookie and set the cookie in browser
import cors from "cors"

const app = express();

// Now use the cors for allowing only specific URL.
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));


// Now we are preparing for taking the data in any form
// Beacuse data can come to server in the any form like in json form,from URL, Some from body, some from form etc...
// And also we set limit to data like 16KB, 20KB etc..

// 1. For accepting the json data.
app.use(express.json({limit:"16kb"}));
// 2. For Getting from URL.
app.use(express.urlencoded({limit:"16kb"}));
// 3. Here we want that if any image,pdf data come then we want to store it in own(like in public folder) for that we use static
app.use(express.static("public"));
// 4. set the cookie and use the cookie
app.use(cookieParser());


// Importing the router
import userRouter from "./routes/user.routes.js";
import bodyParser from "body-parser";

// Declaration of Router
// Earlier we are using the app.get(), But this will work when we are doing the the controller, router part in the same file or same place. But we implement the controller part seperately as well routing part seperately.
// That's why we are using app.use() for implementation of router

app.use("/users",userRouter) // --> By writing this we specify that after giving the url as "/users" we give the control to userRouter. So it will go to user.routes.js file and do the operation over there. 

export default app;



