const express = require("express");
const mongosse = require ("mongoose");
const path = require("path");

const app = express();
require("dotenv").config();


const routerBook = require("./routes/booksRoutes");
const routerRoles = require("./routes/rolesRoutes");
const routerUsers = require("./routes/usersRoutes");
const routerOrders = require('./routes/ordersRoutes');
const routerFavList = require('./routes/favListesRoutes');

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api",routerBook);
app.use("/api", routerRoles);
app.use("/api", routerUsers);
app.use("/api", routerOrders);
app.use('/api', routerFavList);

mongosse.connect(
  "mongodb+srv://houdadardaoui:2HzCLONzNr0yvMpF@cluster0.8xdgs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(()=>{
    app.listen(5000, () => {
       console.log("Connected succesfully");
    });
}).catch((error)=>{
         console.log(error);
})
