const mongoose = require("mongoose");
const Role = require("../Models/roleModel");
const { ObjectId } = require("mongodb");

exports.CreateRole = async (req , res) =>{
    const newRole = new Role (req.body);
    try{
        const role = await newRole.save();
        return res.status(201).json({ 'role': role });    
    }catch (error){
      console.log(error);
    return res
        .status(400)
        .json({ error: "Something went wrong creating a role" });

    }
};

exports.getRoles = async (req, res) => {
  try {
    const roleFind = await Role.find({});
    return res.status(200).json(roleFind);
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const roleFindId = await Role.findById(id);
    console.log(roleFindId);
    return res.status(200).json(roleFindId);
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};