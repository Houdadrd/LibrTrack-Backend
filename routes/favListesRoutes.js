const express = require('express');
const favListModel = require("../Controllers/favList-controller");
const { authenticateToken } = require("../routes/userAuth.js");

const routerFavList = express.Router();

routerFavList.put("/AddBookToFavorite", authenticateToken , favListModel.CreateFavList);

routerFavList.get("/FavoritesBooks", authenticateToken , favListModel.getFavoriteBooks);


routerFavList.put("/RemoveBook", authenticateToken, favListModel.deletelist);

module.exports = routerFavList;