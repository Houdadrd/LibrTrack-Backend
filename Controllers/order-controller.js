const mongoose = require("mongoose");
const Orders = require("../Models/orderModel");
const Users = require("../Models/userModel");

// Put book to a cart
exports.AddToCart = async (req, res) => {
  try {
    const bookid = req.headers.bookid;
    const userid = req.headers.userid;

    if (!userid) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    let order = await Orders.findOne({
      users: userid,
      confirmed: false,
      status: "Order placed",
    });

    if (!order) {
      order = new Orders({
        users: userid,
        books: [
          {
            bookId: bookid,
          },
        ],
        confirmed: false,
        status: "Order placed",
      });

      await order.save();

      return res
        .status(200)
        .json({ message: "Book added to cart", data: order });
    } else {

      const checkBookExist = order.books.find(
        (singleBook) => singleBook.bookId == bookid
      );

      if (!checkBookExist) {
        order.books.push({ bookId: bookid, quantity: 1 });

      } else {
        checkBookExist.quantity = checkBookExist.quantity + 1;
      }

      await order.save();
      return res
        .status(200)
        .json({ message: "Book added to cart", data: order });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.RemoveFromCart = async (req, res) => {
  try {
    const { bookid } = req.params;
    const userId = req.headers.id;

    const order = await Orders.findOneAndUpdate(
      { users: userId, confirmed: false, status: "Order placed" },
      { $pull: { books: { bookId: bookid } } },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or cart is empty" });
    }

    return res
      .status(200)
      .json({ message: "Book removed from cart", data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Get user's cart
exports.getUserCart = async (req, res) => {
  try {
    const { id } = req.headers;

    const orders = await Orders.findOne({
      users: id,
      status: "Order placed",
      confirmed: false,
    }).populate("books.bookId");

    res.status(200).json({ data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update the quantity of a book in the cart
exports.updateQuantity = async (req, res) => {
  try {
    const { bookId } = req.params; 
    const { quantity } = req.body; 
    const userId = req.headers.id; 

    if (!userId || !bookId || quantity === undefined) {
      return res.status(400).json({ error: "Missing user ID, book ID, or quantity" });
    }

    const order = await Orders.findOneAndUpdate(
      { users: userId, confirmed: false, status: "Order placed", "books.bookId": bookId },
      { $set: { "books.$.quantity": quantity } }, 
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found or book not in cart" });
    }

    return res.status(200).json({ message: "Quantity updated successfully", data: order });
  } catch (error) {
    console.error("Error updating quantity:", error);
    return res.status(500).json({ message: error.message });
  }
};

//place order
exports.PlaceOrder = async (req, res) => {
  try {
    const userid = req.headers.id;

    if (!userid) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const order = await Orders.findOneAndUpdate(
      { users: userid, confirmed: false, status: "Order placed" },
      { $set: { confirmed: true, status: "Out of delivery" } },
      { new: true }
    ).populate("books.bookId");

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or already confirmed" });
    }

    for (let item of order.books) {
      const book = item.bookId;
      if (book) {
        if (isNaN(book.stock) || typeof book.stock !== "number") {
          return res
            .status(500)
            .json({ message: `Invalid stock value for book ${book.title}` });
        }

        book.stock -= item.quantity;

        if (book.stock < 0) {
          await Orders.findByIdAndUpdate(order._id, {
            $set: { confirmed: false, status: "Order placed" },
          });
          return res
            .status(400)
            .json({
              message: `Insufficient stock for book ${book.title}`,
            });
        }
        if (isNaN(book.stock) || book.stock < 0) {
          return res
            .status(500)
            .json({
              message: `Invalid stock after deduction for book ${book.title}`,
            });
        }

        await book.save();
      }
    }

    await Users.findByIdAndUpdate(userid, {
      $push: { Orders: order._id },
    });

    return res
      .status(200)
      .json({
        status: "Success",
        message: "Order placed successfully",
        data: order,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};


// Get confirmed order history - order/history page
exports.getOrderHistory = async (req, res) => {
  try {
    const { id } = req.headers;
   
    const orders = await Orders.find({ users: id, confirmed: true }).populate({path: 'books.bookId',  select: 'title  price', }).exec();

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No confirmed orders found for this user" });
    }

    const orderHistory = orders.map((order) => {
      return {
        orderId: order._id,
        date: order.createdAt,
        status: order.status,
        books: order.books.map((bookItem) => {
          if (bookItem.bookId) {
            return {
              bookId: bookItem.bookId._id,
              title: bookItem.bookId.title ,
              price: bookItem.bookId.price || 0,
              quantity: bookItem.quantity || 0,
            };
          } else {
            return {
              bookId: null,
              title: "No Title Available",
              price:  0,
              quantity: bookItem.quantity || 0,
            };
          }
        }),
      };
    });

    return res.json({ data: orderHistory });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return res.status(500).json({ message: error.message });
  }
};


//get all orders --admin
exports.getAllOrders = async (req, res) => {
  try {

    const orderData = await Orders.find({})
      .populate("users", "firstName lastName userName")
      .populate({
        path: "books.bookId",
        select: "title",
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orderData.map((order) => {
        return {
      ...order._doc,
        books: order.books.map((bookEntry) => {
           return {
            title: bookEntry.bookId ? bookEntry.bookId.title : 'Unknown Title',
            quantity: bookEntry.quantity,
          };
      }),
    };
  });

 return res.json({ data: formattedOrders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//update status order --admin
exports.updateStatusOrder = async (req, res) => {
  try {
    const userId = req.headers["userid"];

    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "Out of delivery",
      "Delivered",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await Orders.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res
      .status(200)
      .json({ message: "Status updated successfully", data: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};