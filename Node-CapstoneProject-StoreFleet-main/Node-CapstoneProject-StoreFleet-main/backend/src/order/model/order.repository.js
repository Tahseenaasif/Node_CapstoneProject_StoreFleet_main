import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data, userId) => {
  try {
    let {
      shippingInfo,
      orderedItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt,
      orderStatus,
    } = data;
    const currentDate = new Date();
    const fullDateTimeString = currentDate.toLocaleString();
    paidAt=fullDateTimeString;
    console.log("this is userId",userId)
    const order = new OrderModel({
      shippingInfo,
      orderedItems,
      user: userId,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt,
      orderStatus,
      deliveredAt: null, 
    });

    const savedOrder = await order.save();

    return savedOrder;
  } catch (error) {
    throw error;
  }
};
