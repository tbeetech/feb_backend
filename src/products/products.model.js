const mongoose = require('mongoose');
const { CATEGORY_NAMES, SUBCATEGORIES } = require('../constants/categoryConstants');

const ProductSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    category: { 
        type: String, 
        required: true, 
        lowercase: true,
        trim: true,
        enum: [...CATEGORY_NAMES, 'all'],
        set: val => val.toLowerCase()
    },
    subcategory: { 
        type: String, 
        lowercase: true,
        trim: true,
        set: val => val ? val.toLowerCase().replace(/\s+/g, '-') : val,
        validate: {
            validator: function(v) {
                if (!v) return true; // subcategory is optional
                if (!this.category || this.category === 'all') return false;
                return SUBCATEGORIES[this.category]?.includes(v);
            },
            message: props => `${props.value} is not a valid subcategory for ${this.category}`
        }
    },
    description: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    image: String,
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, {
    timestamps: true
});

// Compound indexes for better query performance
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text' }); // Add text index for search

// Pre-save middleware to normalize category and subcategory
ProductSchema.pre('save', function(next) {
    if (this.category) {
        this.category = this.category.toLowerCase();
    }
    if (this.subcategory) {
        this.subcategory = this.subcategory.toLowerCase().replace(/\s+/g, '-');
    }
    next();
});

const Products = mongoose.model("Product", ProductSchema);
module.exports = Products;