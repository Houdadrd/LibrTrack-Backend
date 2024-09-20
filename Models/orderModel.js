const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    dateOrder: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Order placed", "Out of delivery", "Delivered"],
      default: "Order placed",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    users: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: false,
    },
    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Books",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const Orders = mongoose.model("Orders", orderSchema);

module.exports = Orders;
