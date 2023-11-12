// Please don't change the pre-written code
// Import the necessary modules here
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import jwtAuth from "../../../utils/forgetpassword_token.js"
import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo(req.body);
    await sendToken(newUser, res, 200);

    // Implement sendWelcomeEmail function to send welcome message
    await sendWelcomeEmail(newUser);
  } catch (err) {
    //  handle error for duplicate email
    if (err.name === 'MongoServerError' && err.code === 11000){
      res.status(400).send({
        "success":false,
         "error":"email already registered"
    })
    }else{
      return next(new ErrorHandler(400, err));
    }
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    console.log("this is user",user);
    const passwordMatch =await bcrypt.compare(password,user.password)
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }
    await sendToken(user, res, 200);

  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {  
   try{ 

    const email=req.body.email;
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }

      const token = jwt.sign(
      {
        email: email,
      },
       'AIb6d35fvJM4O9pXqXQNla2jBCH9kuLz',
      {
        expiresIn: '10m', 
      }
    );
   console.log("this is token",token);
   console.log("this is user.name",user.name);
    await  sendPasswordResetEmail(user,token);

      res.status(200).send({
        "sucess":true,
         "message":"token send to your mail sucessfully"                     
    })   

    }catch(err){
      return next(new ErrorHandler(400, err));
    }
};

export const resetUserPassword = async (req, res, next) => {
      const token=req.params.token;
      try {
        console.log("this is token",token);
        const isverified=jwtAuth(token);
        console.log("isverified",isverified);
        if(isverified.success==true){
          const email=isverified.email;
           const {password,confirmPassword}=req.body;
           const user = await findUserRepo({ email }, true);
           if (!user) {
            return next(
              new ErrorHandler(401, "user not found! register yourself now!!")
            );
          }
          const passwordMatch =await bcrypt.compare(password,user.password)

          if (!passwordMatch) {
            return next(new ErrorHandler(401, "Invalid  passswor!"));
          }
           const hashedPassword = await bcrypt.hash(confirmPassword, 12);
           user.password=hashedPassword;
           await user.save();

           res.status(200).send("paswaod reset sucessfull");
        }else{
          res.status(200).send("please enter the valid token or your token has been expired");
        }
      }catch(err){
        return next(new ErrorHandler(400, err));
      }
      
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {  
     console.log("updateUserProfileAndRole part hits")
      try{
       const userId=req.params.id;
       const  {name,email,role}=req.body;
       console.log("name",name,"email",email,"role",role);
       let toupdate={};
       if(name){
        toupdate.name=name;
       }
       if(email){
        toupdate.email=email;
       }
       if(role){
        toupdate.role=role;
       }
       console.log("this is toupdate in controller",toupdate)
      const user= await updateUserRoleAndProfileRepo(userId,toupdate)

      res.status(200).send(user);

       }catch(err){
        return next(new ErrorHandler(400, err));
      }

};
