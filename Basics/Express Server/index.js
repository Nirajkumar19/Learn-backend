// Creating a simple server
import express from "express";
const app=express();
const port=3000;

app.listen(port,()=>{
    console.log("Server running");
})
// listen()--> It will take two argument, one is port number and another one is callback function. This callback function trigger when everything done on port no 3000

/* Send request and get response from the server */
// This is going to be done by get() method of Express
// Get will take two argument first is path and second is callback function in which response and request is going to PaymentResponse.

app.get("/",(req,res)=>{
    res.send("Hello from Home");
})

app.get("/aboutUs",(req,res)=>{
    res.send("Hello from about us");
})

app.get("/aboutUs/contact",(req,res)=>{
    res.send("Hello from contact us");
})

/* **************Mean of all path *************
"/"--> Home page
"/About-us"--> Either response or request by going to about us page
"/About-us/contact-us"--> Either response or request by going to contact us page through about us page.*/

/* One more issue is their, if we change in the code then for reflect the change we have to stop the server and to do restart. 
So to overcome this problem we are using nodemon cmd instead of node --> "nodemon file_name" */