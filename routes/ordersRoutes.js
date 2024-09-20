const express = require('express');
const ordersControllers = require('../Controllers/order-controller');
const { authenticateToken, verifyAdmin } = require("../routes/userAuth.js");


const routerOrder = express.Router();


routerOrder.post("/AddToCart",authenticateToken,ordersControllers.AddToCart);
routerOrder.get("/GetUserCart", authenticateToken, ordersControllers.getUserCart);

routerOrder.put("/UpdateQuantity/:bookId",authenticateToken,ordersControllers.updateQuantity);
routerOrder.put("/RemoveFromCart/:bookid",authenticateToken,ordersControllers.RemoveFromCart );
routerOrder.post("/PlaceOrders", authenticateToken, ordersControllers.PlaceOrder);
routerOrder.get("/getOrderHistory", authenticateToken, ordersControllers.getOrderHistory);

//for admin
routerOrder.get("/getAllOrders", authenticateToken, ordersControllers.getAllOrders);
routerOrder.put("/updateStatus/:id", authenticateToken, verifyAdmin, ordersControllers.updateStatusOrder);


module.exports = routerOrder;