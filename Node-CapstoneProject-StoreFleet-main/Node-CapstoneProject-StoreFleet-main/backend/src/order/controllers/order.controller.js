// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => { 
    try{
      const userId=req.user. _id;
  console.log("this is req.user._id",req.user._id);
  const data=req.body;
   const orderdetails = await createNewOrderRepo(data,userId);

   res.status(201).send(orderdetails);
}catch(err){
    return next(new ErrorHandler(500, err.message || 'Internal Server Error'));
  }
}
  
