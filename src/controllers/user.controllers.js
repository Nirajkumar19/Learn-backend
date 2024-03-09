import { asyncHandler } from "../utils/aysncHandler.js";
import { errorHandler } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";
import { uploadonCLoudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import  jwt  from "jsonwebtoken";


// Method for generating access and refresh token
const generateAccessandRefresh = async (userId) => {
  // console.log(userId);
  try {
    
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Now here we have to store the refresh token in the database because it have long duration and after expiry of accesstoken, it will validate the user and again regenerate the accesstoken
    user.refreshToken = refreshToken;
    // Also we have to save it and also we have to pass a parameter because during saving anything it require password for validation but we don't want to give here.
    await user.save({validateBeforeSave: false});

    return {accessToken,refreshToken};
  } catch (error) {
    throw new errorHandler(500, "something went wrong while generating access and refresh token");
  }
}

// Registration of User
const registerUser = asyncHandler(async (req, res) => {
  // Things required while creating user.

  /**
   * Get user details from frontend (in the form of URL,form,raw)
   * Validation of details (like it shd not be empty)
   * Check if user already exist (with the help of either username or email)
   * Check for images, We mention that avatar is required so it shd not be empty.
   * upload the images on cloudinary.
   * Create user object and insert in the database.
   * We want to remove the password and refresh token from the response because this response will send to the frontend part so don't want to send these two confidential field.
   * check for user created or not.
   * Return response.
   */

  // Get user details from the body of req, along that we directly destructuring it.
  const { fullName, username, email, password } = req.body;

  if (fullName === "") {
    throw new errorHandler(400, "fullname is required");
  }
  if (email === "") {
    throw new errorHandler(400, "email is required");
  }
  if (username === "") {
    throw new errorHandler(400, "username is required");
  }

  // Check for user already exit or not.
  // for that first we import the user which are exported while creating the model of user.
  // Why we are doing that because this user is created by mongoose so it can directly talk to mongoose
  // So with the help of findOne() or find() method we can check user already exist or not

  const existedUSer = await User.findOne({
    // We are using or operator here because we want to check on either email or username 
    $or: [{email},{username}]
  });

  if(existedUSer){
    throw new errorHandler(409, "User with email or username already exist");
  }

  // Check for images.
  // While injecting the multer as middleware it will give so many access, Here we using the access of file.
  // We do it optionally because may be it won't give the access to the file.
  /*req.files?.avatar --> this avatar name same as the name given to the file name in the middleware*/

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // // We have to check for avatar found or not
  if(!avatarLocalPath){
    throw new errorHandler(400, "Avatar is required");
  }

  // Now upload this image on cloudinary.
    const avatar = await uploadonCLoudinary(avatarLocalPath);
    const coverImage = await uploadonCLoudinary(coverImageLocalPath);

    if(!avatar){
        throw new errorHandler(400, "Avatar is required");
    }

    // Now create user object and insert it.

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // if coverimage is not provided by the user then pass empty string to the database.
        email,
        password,
        username: username.toLowerCase() // we want to store name in lowercase

    })

    // Check for user created or not and along with that we will remove the password and refreshtoken from it.
    // We know mongoose give a unique id to each object when it will created.
    // So we use it for checking with the help of findBtId() method.
    // It will return true when it find and when it find it means object is been created.
    /*
    const createdUser = await User.findById(user._id);
    if(!createdUser){
        throw new errorHandler(500,"Something went wrong while creating user");
    }*/

    // Now remove the password and refreshtoken.
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createdUser){
        throw new errorHandler(500,"Something went wrong while creating user");
    }

    // Now send the response.
    res.status(201).json(
        new apiResponse(200,createdUser,"User register successful")
    )


});


// Login of user
const loginUser = asyncHandler(async (req,res)=>{
  // Things required while logginging user.

  /**
   * Get user email or username
   * Check user exist or not
   * check for the password
   * Generate access and refresh token.
   * send this token in the cookies
   * return the user as in the respons
   */
  // Here we get the username as well as email during the login time. But it's totally depends upon the need. Some website consider username for login and some consider email.
  const {email,username,password} = req.body;
  /*
  if(!email){
    throw new errorHandler(400,"Email is required");
  }
  if(!username){
    throw new errorHandler(400,"Username is required");
  }*/

  if(!email && !username){
    throw new errorHandler(400,"Username or email required");
  }

  const user = await User.findOne(
    {
      $or: [{username},{email}]
    }
  )

  if(!user){
    throw new errorHandler(404,"Username is not exist");
  }

  // Check for password
  // We already inserted one method for validating the password in the model file.
  // This method is not present in the capital U wala User because capital U wala User has those methods which are provided by the mongoose but we insert our own methods so these methods are present in the instances that is small u wala user.
  const isvalidPassword = await user.isPasswordCorrect(password);
  // console.log(isvalidPassword);
  if(!isvalidPassword){
    throw new errorHandler("401","User credential is invalid");
  }

  // Now we have to generate the tokens
  // So we are defining functions which will do that and then we will call Headers.
  console.log(user._id);
  const {accessToken,refreshToken} = await generateAccessandRefresh(user._id);

  // Now again we have to use the findOne() method for getting the user details because when previously we call this method then at that time we haven't the details of accesstoken and refreshtoken.

  const userloggedin = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  // Now send the token in the cookie.
  // So for sending the cookie we need to give option also in the argument of cookie

  const options = {
    httpOnly: true,
    secure: true
    // By doing this, this cookie will only modify by the server, frontend will not modify the cookie.
  }

  // Return and send the cookie as well.
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken", refreshToken,options)
  .json(
    new apiResponse(
      200,
      {
        user : userloggedin,accessToken,refreshToken
      },
      "User login successful"
    )
  )

})

// Logout of user
const logoutUser = asyncHandler(async (req,res) => {
  /**
   * Remove all the cookies
   * Refresh the refresh token which were in the database.
   */
  // During the logout of user first we have to check user is logged in or not and for that we need their email, username or other crendential,but this is not right way to do that because again for logout we have ask user to give their credential.
  // So for logout the user, we inject our own middleware.
  // If you remember, after adding the cookieparser() as a middleware then we can able to access the cookie with the help of res.cookie and req.cookie
  // as like that we can add our own middleware and access/use that middleware with the help of res and req.

  await User.findByIdAndUpdate(
    req.user._id, // First find by id and then update the value
    {
      $set:{
        refreshToken: undefined
      }
    },
    {
      new: true // Send total new
    }
  )

  // Now clear the cookies.
  const option = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken",option)
  .clearCookie("refreshToken",option)
  .json(new apiResponse(200,{},"Logged out successful"));
  
})


// Generate new access token after expiring of access token with the help of refresh token
const accessfromrefresh = asyncHandler( async ( req,res ) => {
  const incomingtoken = req.cookies?.refreshToken;
  if(!incomingtoken){
    throw new errorHandler(401,"Unauthorized token")
  }

  try {
    const decodedtoken = jwt.verify(incomingtoken,process.env.REFRESH_TOKEN_SECRET);
    // In decodedtoken we have the access to _id so now we can find the user with the help of that
    const user = User.findById(decodedtoken._id);
  
    if(!user){
      throw new errorHandler(400,"Invlaid user");
    }
  
    // In databse we store the refreshtoken during generation. So now after getting the user we can access to refreshtoken and match with the refreshtoken which are in the cookies.
  
    if(incomingtoken !== user.refreshToken){
      throw new errorHandler(401,"Refresh is expired or used");
    }
  
    // After verifying it now we have to send new accesstoken and refreshtoken to the user and store it in the cookies.
    const {newaccessToken,newrefreshToken} = generateAccessandRefresh(user._id);
  
    const options={
      httpOnly: true,
      secure: true
    }
  
    return res.status(200)
    .cookie("accessToken",newaccessToken,options)
    .cookie("refeshToken",newrefreshToken,options)
    .json(
      new apiResponse(
        200,
        {
          accessToken: newaccessToken,refreshToken: newrefreshToken
        },
        "Access token and refresh token refreshed"
      )
    )
  } catch (error) {
    throw new errorHandler(401,error?.message || "Ivalid refresh token");
  }



})


// Change the password
const changeCurrentPassword = asyncHandler( async ( req,res ) => {
  const {oldPassword,newPassword} = req.body;

  // Now we have to verify the oldpassword with the password which already exist.
  // For verification we need the user so that we can find out the exist password.
  // For getting the user we know that, we already add user in req during authentication middleware
  const user = await User.findById(req.user?._id);
  const checkPassword = await  user.isPasswordCorrect(oldPassword);

  if(!checkPassword){
    throw new errorHandler(400, "Invalid old password");
  }

  // Set the new password
  user.password = newPassword;
  await user.save({validateBeforeSave: false}); // Don't validate the things before save the new password.

  // Now send some message to the user.
  res.status(200).json(
    new apiResponse(200,{},"Password Change successfully")
  )

})

// Update the account details
const updateAccountDetails = asyncHandler( async ( req,res ) => {
  const { fullName,email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new apiResponse(200,user,"Account details updated successfully")
  )
})

// Update avatar and coverImage
const updateAvatar = asyncHandler( async ( req,res ) => {
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath){
    throw new errorHandler(400, "Avatar is missing");
  }

  const avatar = await uploadonCLoudinary(avatarLocalPath);

  if(!avatar.url){
    throw new errorHandler(400, "Avatar is missing");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new apiResponse(200,user,"Avatar updated successfully")
  )
})

const updateCoverImage = asyncHandler( async ( req,res ) => {
  const coverImageLocalPath = req.file?.path;

  if(!coverImageLocalPath){
    throw new errorHandler(400, "Cover Image is missing");
  }

  const coverImage = await uploadonCLoudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new errorHandler(400, "Cover Image is missing");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")

  return res.status(200).json(
    new apiResponse(200,user,"CoverImage updated successfully")
  )
})
export { registerUser,loginUser,logoutUser,accessfromrefresh,changeCurrentPassword,updateAccountDetails,updateAvatar,updateCoverImage };
