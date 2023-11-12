// Please don't change the pre-written code
// Import the necessary modules here

import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addNewProductRepo,
  deleProductRepo,
  findProductRepo,
  getAllProductsRepo,
  getProductDetailsRepo,
  getTotalCountsOfProduct,
  updateProductRepo,
  filterproductkeycatrepo,
  filterproductkeyprice,
  filterproductsrating
} from "../model/product.repository.js";
import ProductModel from "../model/product.schema.js";

export const addNewProduct = async (req, res, next) => {
  try {
    const product = await addNewProductRepo({
      ...req.body,
      createdBy: req.user._id,
    });
    if (product) {
      res.status(201).json({ success: true, product });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    let products;
    const page = req.query.page || 1;
    const { keyword, category, price, rating } = req.query;
    console.log("this is req.query", req.query);

    if (keyword && category) {
       products = await filterproductkeycatrepo(keyword,category,page);
       console.log("this is the product in  the first condiction ",products)

    } else if (keyword && price) {

         console.log("this controller price part hits second else if part");
        products = await filterproductkeyprice(keyword,price);
    } else if (rating) {

      console.log("this controller ratings part hits");
        products = await filterproductsrating(rating);
    } else {

        products = await getAllProductsRepo(page);
      //console.log("this controller else part hits");
      res.status(200).json(products);
      return;  
    }

      console.log("this is the page no", page);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    const updatedProduct = await updateProductRepo(req.params.id, req.body);
    if (updatedProduct) {
      res.status(200).json({ success: true, updatedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await deleProductRepo(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ success: true, deletedProduct });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const productDetails = await getProductDetailsRepo(req.params.id);
    if (productDetails) {
      res.status(200).json({ success: true, productDetails });
    } else {
      return next(new ErrorHandler(400, "Product not found!"));
    }
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const rateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const user = req.user._id;
    const name = req.user.name;
    const review = {
      user,
      name,
      rating: Number(rating),
      comment,
    };
    if (!rating) {
      return next(new ErrorHandler(400, "rating can't be empty"));
    }
    const product = await findProductRepo(productId);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    const findRevieweIndex = product.reviews.findIndex((rev) => {
      return rev.user.toString() === user.toString();
    });
    if (findRevieweIndex >= 0) {
      product.reviews.splice(findRevieweIndex, 1, review);
    } else {
      product.reviews.push(review);
    }
    let avgRating = 0;
    product.reviews.forEach((rev) => {
      avgRating += rev.rating;
    });
    const updatedRatingOfProduct = avgRating / product.reviews.length;
    product.rating = updatedRatingOfProduct;
    await product.save({ validateBeforeSave: false });
    res
      .status(201)
      .json({ success: true, msg: "thx for rating the product", product });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getAllReviewsOfAProduct = async (req, res, next) => {
  try {
    const product = await findProductRepo(req.params.id);
    if (!product) {
      return next(new ErrorHandler(400, "Product not found!"));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

//import ErrorHandler from 'path-to-your-error-handler'; 

export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.query;
      console.log("productId",productId,"reviewId",reviewId);
    // Check if the user is logged in
    if (! req.user._id) {
      return next(new ErrorHandler(401, 'Unauthorized: User not logged in'));
    }

    console.log("this is req.user", req.user._id);

    if (!productId || !reviewId) {
      return next(new ErrorHandler(400, 'Please provide productId and reviewId as query params'));
    }

    const product = await findProductRepo(productId);
     console.log("this is the product",product);
    if (!product) {
      return next(new ErrorHandler(404, 'Product not found'));
    }

    // Find the index of the review to be deleted
    const reviewIndex = product.reviews.findIndex((rev) => rev._id.toString() === reviewId.toString());

    if (reviewIndex === -1) {
      return next(new ErrorHandler(404, 'Review not found'));
    }

    const reviewToBeDeleted = product.reviews[reviewIndex];

    // Check if the logged-in user is the owner of the review
    if (reviewToBeDeleted.user.toString() !==  req.user._id) {
      return next(new ErrorHandler(403, 'Forbidden: You are not allowed to delete this review'));
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      msg: 'Review deleted successfully',
      deletedReview: reviewToBeDeleted,
      product,
    });
  } catch (error) {
    return next(new ErrorHandler(500, error.message || 'Internal Server Error'));
  }
};


export const filterproduct=(req,res)=>{
  const data=req.query;
  console.log("this is the data in filter product",data);
  
}