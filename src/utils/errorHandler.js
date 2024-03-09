// This utility is for sending the error in a proper format. 
// Node.js gives us a error class in which we can override the constructor.

class errorHandler extends Error{
    constructor(
        statuscode,
        message = "something went wrong",//Default message if message is not sent by the developer.
        error = [], // error array
        stack = "" // error stack
    ){
        // Override them
        super(message) //Whenever we override we have to call the super and pass the message
        this.statusCode=statuscode;
        this.message=message;
    }
}

export {errorHandler}