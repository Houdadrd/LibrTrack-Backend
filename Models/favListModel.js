const mongoose = require("mongoose");

const favListSchema = mongoose.Schema(
  {
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const favorite = mongoose.model("favorite", favListSchema);
module.exports = favorite;