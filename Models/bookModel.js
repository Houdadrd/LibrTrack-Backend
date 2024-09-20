const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "please enter a book name"],
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    desc: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Crime', 'Romantic', 'Dramatic', 'Adventure', 'Horror', 'Philosophical', 'Science fiction', 'Historical', 'Political'],
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Books = mongoose.model("Books", bookSchema);

module.exports = Books;
