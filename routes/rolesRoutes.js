const express = require("express");
const rolesControllers = require ("../Controllers/role-controller");

const routerRoles = express.Router();

routerRoles.post("/Roles", rolesControllers.CreateRole);
routerRoles.get("/Roles", rolesControllers.getRoles);
routerRoles.get("/Roles/:id", rolesControllers.getRoleById);

module.exports = routerRoles;