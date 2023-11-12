import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

export const getAllProductsRepo = async (page) => {
  const limit=2;
  return await ProductModel.find({}).
       limit(limit*1).
         skip((page-1)*limit).
          exec();

};

export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
};

export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

export const getTotalCountsOfProduct = async () => {
  return await ProductModel.countDocuments();
};

export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};


export const filterproductkeycatrepo=async(keyword,category,page)=>{
    console.log("this function filterproductkeycatrepo hits");
    const limit =2
    const nameRegex = new RegExp(keyword, 'i');
    const product= await ProductModel.find({name:nameRegex,category:category}).
       limit(limit*1).
         skip((page-1)*limit).
          exec();
       return product;
}

    
export const filterproductkeyprice=async(keyword,price)=>{
  console.log("this function filterproductkeyprice hits");
 // const limit =2
    const nameRegex = new RegExp(keyword, 'i');
    const product= await ProductModel.find({name:nameRegex,price:{$lte:price.lte,$gte:price.gte}});
      
       return product;

}

export const filterproductsrating = async (rating) => {
  try {
    const { gte, lte } = rating;
    console.log("gte",gte,"lte",lte);
    const products = await ProductModel.find({
      "reviews.rating": {
        $gte: parseInt(gte),
        $lte: parseInt(lte),
      },
    });

    return products;
  } catch (error) {
    console.error("Error in filterproductsrating:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

