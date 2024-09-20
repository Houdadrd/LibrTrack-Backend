const mongoose = require("mongoose");
const Users = require("../Models/userModel");
const Roles = require("../Models/roleModel.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const Role = require("../Models/roleModel.js");

// Create user for admin
exports.CreateUser = async (req, res) => {
  const { firstName, lastName, userName, pwd, phoneNumber, email, adress } =
    req.body;
  if (!userName || !pwd) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (userName.length < 3 || pwd.length < 8) {
    return res.status(400).json({
      error:
        "Username must be at least 3 characters and password must be at least 8 characters long",
    });
  }

  try {
    const existingUser = await Users.findOne({ userName });
    if (existingUser) {
      return res
        .status(400)
        .json({
          error: "User already exists, please log in instead",
          field: "userName",
        });
    }

    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Email already exists.", field: "email" });
    }
    const hashedPassword = await bcrypt.hash(pwd, saltRounds);

    const admRole = await Roles.findOne({ name: "admin" });
    
    const newUser = new Users({
      firstName,
      lastName,
      userName,
      pwd: hashedPassword,
      email,
      phoneNumber,
      adress,
      roles: admRole,
    });

    const user = await newUser.save();

    // Exclude the password from the response
    const { pwd: _, ...userWithoutPassword } = user.toObject();
    return res.status(201).json({ message: "Signup admin successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({
      error:
        "An error occurred while creating the user. Please try again later.",
    });
  }
};

//  Sign up __client
exports.Signup = async (req, res) => {
  const { firstName, lastName, userName, pwd, phoneNumber, email, adress } =
    req.body;

  //  firstName
  const firstNameRegex = /^[A-Z][a-zA-Z]*$/;
  if (!firstNameRegex.test(firstName)) {
    return res.status(402).json({
      message:
        "First name must start with a capital letter and contain no spaces",
      field: "firstName",
    });
  }

  //  lastName
  const lastNameRegex = /^[A-Z][a-zA-Z]*$/;
  if (!lastNameRegex.test(lastName)) {
    return res.status(402).json({
      message:
        "Last name must start with a capital letter and contain no spaces",
      field: "lastName",
    });
  }

  // email
  const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z]+\.[A-Za-z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(402)
      .json({ message: "Invalid email format", field: "email" });
  }

  // phoneNumber
  const phoneRegex = /^0\d{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(402).json({
      message: "Phone number must be 10 digits",
      field: "phoneNumber",
    });
  }

  //  username
  const userNRegex = /^[a-zA-Z]{3,}$/;
  if (!userNRegex.test(userName)) {
    return res.status(402).json({
      message:
        "Username must be at least 3 characters and cannot contain spaces",
      field: "userName",
    });
  }
  // password
  if (pwd.length < 8 ) {
    return res.status(402).json({
      message:
        "Password must be at least 8 characters long and cannot contain spaces",
      field: "pwd",
    });
  }
  const pwdRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
  if (!pwdRegex.test(pwd)) {
    return res.status(402).json({
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      field: "pwd",
    });
  }

  const adressRegex = /^(?! )[A-Za-z0-9-_\. ]+(?<! ).{4,}$/;
  if (!adressRegex.test(adress)) {
    return res.status(402).json({
      message: "Please verify your adress",
      field: "adress",
    });
  }
  try {
    const existingUser = await Users.findOne({ userName });
    if (existingUser) {
      return res.status(402).json({
        error: "User already exists, please log in instead",
        field: "userName",
      });
    }

    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
      return res.json({ error: "Email already exists.", field: "email" });
    }
    const hashedPassword = await bcrypt.hash(pwd, saltRounds);

    const cltRole = await Roles.findOne({ name: "client" });

    const newUser = new Users({
      firstName,
      lastName,
      userName,
      pwd: hashedPassword,
      email,
      phoneNumber,
      adress,
      roles: cltRole,
    });


    const user = await newUser.save();

    // Exclude the password from the response
    const { pwd: _, ...userWithoutPassword } = user.toObject();
    return res.json({ message: "Signup successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error:
        "An error occurred while creating the user. Please try again later.",
    });
  }
};

//Sign In
exports.Signin = async (req, res) => {
  const { userName, pwd } = req.body;
  try {
    const existingUser = await Users.findOne({ userName }).populate("roles");

    if(userName.length === 0){
      return res.status(400).json({message: "Verify your userName.", field: "userName"})
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "UserName does not exist", field: "userName" });
    }

    const match = await bcrypt.compare(pwd, existingUser.pwd);
    if (!match) {
      return res
        .status(402)
        .json({ message: "Verify your password", field: "pwd" });
    }

    const roleName = existingUser.roles.name;

    const authClaims = [{ name: existingUser.userName }, { role: roleName }];

    const token = jwt.sign({ authClaims }, "bookStore2024", {
      expiresIn: "24h",
      algorithm: "HS256",
    });

    return res.status(200).json({
      id: existingUser.id,
      role: roleName,
      token: token,
      message: "Welcome",
    });
  } catch (error) {
    console.error("Error sign in user:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get user info
exports.getUserInfo = async (req, res) => {
  try {
    const { id } = req.headers;
    if (!id) {
      return res.status(400).json({ message: "ID header is required" });
    }

    const data = await Users.findById(id).select("-pwd");
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Edit user
exports.editUsers = async (req, res) => {
  try {
    const { id } = req.headers;
    const { adresse } = req.body;
    const user = await Users.findByIdAndUpdate(id, { adresse: adresse });
    return res.status(200).json({ message: "Address updates successfully" });
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await Users.find().populate("roles").exec();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id).populate();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: `Cannot find user with ID ${id}` });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};
