const express = require("express");
const booksControllers = require("../Controllers/book-controller");
const { authenticateToken , verifyAdmin} = require("../routes/userAuth.js");

const multer = require('multer');
const routerBook = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

routerBook.post('/addBooks', upload.single('image'), authenticateToken, verifyAdmin, booksControllers.Createbook);


routerBook.put("/EditeBooks/:id", upload.single("image"), authenticateToken,verifyAdmin,
booksControllers.editBook);
routerBook.delete("/DeleteBook/:id",authenticateToken,verifyAdmin,booksControllers.deleteBook);

routerBook.get("/GetBookById/:id", booksControllers.getBookId);
routerBook.get("/AllBooks", booksControllers.getBooks);
routerBook.get("/RecentBooks", booksControllers.getRecentBook);
routerBook.get(
  "/FilterByCategory/:category",
  booksControllers.getBookByCategory
);


module.exports = routerBook;
