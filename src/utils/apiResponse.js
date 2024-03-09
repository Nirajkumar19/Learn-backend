class apiResponse{
    constructor(statuscode,data,message="Success"){
        this.statusCode=statuscode;
        this.data=data;
        this.message=message;
    }
}

export {apiResponse}