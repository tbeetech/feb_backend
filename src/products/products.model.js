const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String },  // Make sure this field exists
    description: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    image: String,
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Types.ObjectId, ref: "User", required: true }
});

const Products = mongoose.model("Product", ProductSchema);
module.exports = Products;