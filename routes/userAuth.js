const jwt = require("jsonwebtoken");
const Users = require("../Models/userModel");
const Role = require("../Models/roleModel");
const mongoose = require("mongoose");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  jwt.verify(token, "bookStore2024", (err, user) => {
    if(!token){
        return res.status(403).send({
            message: "No token provided"
        });
    };

    if (err) {
      return res
        .status(403)
        .json({ message: "Token expired. Please sign in again" });
    }
    req.user = user;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  authenticateToken(req, res, async () => {
    try {
      const { authClaims } = req.user;
      const roleName = authClaims[1]?.role; 

      if (!roleName) {
        return res.status(403).json({ message: "Role not found" });
      }

      if (roleName === "admin") {
        next(); 
      } else {
        res.status(403).json({ message: "You are not authorized!" });
      }
    } catch (err) {
      console.error("Error details:", err);
      res
        .status(500)
        .json({
          message: "Server error",
          details: err.message,
        });
    }
  });
};


module.exports = { authenticateToken, verifyAdmin };