const mongoose = require("mongoose");
const FavListes = require("../Models/favListModel");

//add book to favorite
exports.CreateFavList = async (req, res) => {
  try {
    const { bookid, userid } = req.headers;

    const isBookFavorite = await FavListes.findOne({
      users: userid,
      books: bookid,
    });

    if (isBookFavorite) {
      return res.status(200).json({ message: "Book is already in favorites" });
    }

    await FavListes.findOneAndUpdate(
      { users: userid },
      { $push: { books: bookid } },
      { new: true, upsert: true }
    );

    return res.status(201).json({ message: "Book added to favorites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFavoriteBooks = async (req, res) => {
  try {
    const { userid } = req.headers;

    const userFavorites = await FavListes.findOne({ users: userid }).populate(
      "books"
    );

    const favoriteBooks = userFavorites.books;

    return res.json({ status: "sucess", data: favoriteBooks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Remove book from favorite
exports.deletelist = async (req, res) => {
  try {
    const { bookid, id } = req.headers;

    if (!id || !bookid) {
      return res
        .status(400)
        .json({ message: "Missing required fields: id or bookid" });
    }

    const userFavorites = await FavListes.findOne({ users: id });
    if (!userFavorites) {
      return res
        .status(404)
        .json({ message: "User's favorite list not found" });
    }

    const isBookFavorite = userFavorites.books.some(
      (book) => book.toString() === bookid.toString()
    );

    if (isBookFavorite) {
      await FavListes.findOneAndUpdate(
        { users: id },
        { $pull: { books: bookid } }
      );
    } else {
      return res
        .status(404)
        .json({ message: "Book not found in user's favorite list" });
    }

    return res.status(200).json({ message: "Book removed from favorites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
