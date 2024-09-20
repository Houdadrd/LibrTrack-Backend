const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: [true, "Please enter a username"],
      unique: true,
    },
    pwd: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: 8,
    },
    email: {
      type: String,
      required: false,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    adress: {
      type: String,
      required: true,
    },
    roles: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
      },
  },
  { timestamps: true }
);

// Create and export the user model
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
