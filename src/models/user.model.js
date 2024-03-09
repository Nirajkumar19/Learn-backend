import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    email:{
        type:String,
        required: true,
        lowercase:true
    },
    fullName:{
        type: String,
        required: true
    },
    avatar:{
        type: String, // Come from the cloudnary.
        required: true
    },
    coverImage:{
        type: String
    },
    password:{
        type: String,
        required: true
    },
    watchHistory:[
        {
            type: mongoose.Types.ObjectId,
            ref: "Videos"
        }
    ],
    refreshToken:{
        type: String
    }
},{timestamps: true});

userSchema.pre("save",async function(next){

    /*this.password = bcrypt.hash(this.password,10); //this hash function will decrypt our password and it will take two argument hash(on_which_we_want_to_do_hashing,no_of_rounds_to_do_so);
    next(); // pass flag to next
    // But by writing this, password will keep changing whenever we perform save operation. It means even if we save our profile avatar then also password will change. So we have to wrap this logic into some condition.*/
    
    // if(this.isModified("password")){ // It will check password is changed or not.
    //     this.password = await bcrypt.hash(this.password,10);
    //     next();
    // }
    // next()
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// We also want to check the entered password is correct or not
// For that we add some custom methods to it
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);// it will return either true or false.
}

// Inject methods to genearte Access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// Inject method to generate refresh TOken
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            // It has less information because it will keep refreshing.
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);