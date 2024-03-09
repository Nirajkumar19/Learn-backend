import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
// //  connectDB();--> After successful connection of database we have to start the server. So we know async function will return the promise so we can use the try catch block.
// import app from "http";
// const app = require("http");

dotenv.config({
    path: './.env'
});

connectDB()
.then(()=>{
    // Start the server.
    app.listen((process.env.PORT || 8000), ()=>{
        console.log(`Server running at port ${process.env.PORT}`);
    })
})
.catch(
    (error)=>{
        console.log("MongoDB connection failed",error);
    }
)

/* This is the first approach to connect the database. We are writting the code inside index.js file.
(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}`/`${DB_NAME}`);
    }catch (error) {
        console.error("Error:", error);
        throw error;
    }
})();
Second approach is write the code in db and import it here.
*/

