const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, lowercase: true },
    subcategory: { type: String, lowercase: true },  // Added lowercase true
    description: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    image: String,
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
});

// Add index for better query performance
ProductSchema.index({ category: 1, subcategory: 1 });

const Products = mongoose.model("Product", ProductSchema);
module.exports = Products;