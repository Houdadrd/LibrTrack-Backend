const mongoose = require("mongoose");
const Books = require("../Models/BookModel");
const Users = require("../Models/userModel");

//add book --admin
exports.Createbook = async (req, res) => {
  const { title, author, price, desc, category, language, stock } = req.body;
  const image = req.file.filename 

  try {
   
    // Create book
    const newBook = new Books({
      title,
      author,
      price: parseFloat(price),
      desc,
      category,
      language,
      image,
      stock: parseInt(stock, 10),
    });
    

    const book = await newBook.save();    

    return res.status(201).json({ book, message: "Book added successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};


//filter by category
exports.getBookByCategory = async(req, res) =>{
      try {
     const books = await Books.find({ category: req.params.category });
     res.status(200).json({
      data:books
    });
   } catch (error) {
     res.status(500).json({ message: "Error fetching books", error });
   }
}

//get book by id
exports.getBookId= async(req,res)=>{
    try{
        const {id} = req.params;

        const bookFind = await Books.findById(id);
        return res.json({
          status: "Success",
          data: bookFind,
        });
    }catch(error){
         return res
           .status(500)
           .json({ message: error.message });

    }
};

//get recently added books limit 4
exports.getRecentBook = async (req, res) => {
  try {
    const bookFind = await Books.find().sort({ createdAt: -1 }).limit(4);
    return res.status(200).json({
      status: "Success",
      data: bookFind,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

//get all books
exports.getBooks = async (req, res) => {
  try {
    const bookFind = await Books.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      status: "Success",
      data: bookFind,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

//update book --admin
exports.editBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Books.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const updateData = {
      title: req.body.title || book.title,
      author: req.body.author || book.author,
      price: req.body.price || book.price,
      desc: req.body.desc || book.desc,
      category: req.body.category || book.category,
      language: req.body.language || book.language,
      stock: req.body.stock || book.stock,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedBook = await Books.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({ message: "Book updated successfully!", book: updatedBook });
  } catch (error) {
    console.log(JSON.stringify(error));
    return res.status(500).json({ message: error.message });
  }
};

//delete book --admin
exports.deleteBook = async (req, res) =>{
    try{
         const { id } = req.params;
         const book = await Books.findByIdAndDelete(id);
         if (!book) {
           return res
             .status(404)
             .json({ message: "Cannot find this book" });
         }
         return res.status(200).json({ message: "Book deleted successfully!" });

        }catch (error){
        console.log(JSON.stringify(error));
        return res.status(500).json({message: error.message});
    }
};