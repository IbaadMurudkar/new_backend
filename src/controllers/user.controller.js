import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {

   const { username, email, fullName, password } = req.body
   console.log("email: ", email);
   console.log(req.body);                       

   if ([email, username, fullName, password].some
      ((filed) => filed?.trim() === "")) {
      throw new ApiError(400, "All fields are required")
   }

   const existedUser = await User.findOne({
      $or: [{ username }, { email }]
   })

   if (existedUser) {
      throw new ApiError(409, "Username or Email already exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverIamgeLocalPath = req.files?.coverImage[0]?.path;

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required")
   }

   const avatar = uploadOnCloudinary(avatarLocalPath);
   const coverImage = uploadOnCloudinary(coverIamgeLocalPath);

   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if (!createdUser) {
      throw new ApiError(500, "Something went wrong while creating user")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, "User Registered Successfully")
   )
})

export { registerUser }