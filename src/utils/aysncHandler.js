// Here we create a method which will take a function as argument and do the async operation on that.
// Why we are doing that because we will use so many aysnc function so we are creating a wrap for aysnc.

/*Prototype of wrapper
const asyncHandler = (fun) =>{

}

export {asyncHandler};
*/

// Using Async await.
/*const asyncHandler = (fun) =>{
    async (req,res,next) =>{
        try {
            await fun(req,res,next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}*/

// using Promise.
const asyncHandler = (fun) =>{
    return (req,res,next) => {
        Promise
        .resolve(fun(req,res,next))
        .catch((error) => next(error))
    }
}

export {asyncHandler}