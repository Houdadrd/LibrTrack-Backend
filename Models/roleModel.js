const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
  name: {
    type: String,
    enum: ["admin", "client", "deliveryMan"],
    required: [true, "Please enter a role name!"],
  },
});

const Role = mongoose.model("Role", roleSchema);

module.exports = Role;
