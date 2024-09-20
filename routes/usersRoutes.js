const express = require("express");
const usersControllers = require("../Controllers/user-controller");
const routerUser = express.Router();
const { authenticateToken , verifyAdmin} = require("../routes/userAuth.js");

routerUser.post("/Signin", usersControllers.Signin);
routerUser.post("/Signup", usersControllers.Signup);
routerUser.get("/getUserInfo", authenticateToken, usersControllers.getUserInfo);

routerUser.post("/CreateUser", usersControllers.CreateUser);
routerUser.post(
  "/CreateDeliveryMan",verifyAdmin,authenticateToken,usersControllers.CreateUser
);


routerUser.put("/Users/:id", authenticateToken ,usersControllers.editUsers);

module.exports = routerUser;