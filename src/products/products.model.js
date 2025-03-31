const mongoose = require('mongoose');
const { CATEGORY_NAMES, SUBCATEGORIES } = require('../constants/categoryConstants');
const { getImageUrl, normalizeImageUrl } = require('../utils/imageUrl');

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
                if (!this.category || this.category === 'all') return true; // Skip validation if category is not set
                
                // Get valid subcategories for this category
                const validSubcategories = SUBCATEGORIES[this.category] || [];
                
                // In backend, subcategories are strings, so directly check for inclusion
                return validSubcategories.includes(v);
            },
            message: props => `${props.value} is not a valid subcategory for the selected category (${this.category})`
        }
    },
    description: String,
    price: { type: Number, required: true },
    oldPrice: Number,
    image: {
        type: String,
        set: normalizeImageUrl,
        get: getImageUrl
    },
    gallery: {
        type: [String],
        default: [],
        set: function(images) {
            return images.map(normalizeImageUrl).filter(Boolean);
        },
        get: function(images) {
            return images.map(getImageUrl).filter(Boolean);
        }
    },
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Types.ObjectId, ref: "User", required: false },
    orderType: {
        type: String,
        enum: ['regular', 'contact-to-order'],
        default: 'regular'
    },
    sizeType: {
        type: String,
        enum: ['roman', 'numeric', 'none', 'footwear'],
        default: 'none'
    },
    sizes: {
        type: [String],
        default: []
    },
    stockStatus: {
        type: String,
        enum: ['In Stock', 'Out of Stock', 'Pre Order'],
        default: 'In Stock'
    },
    stockQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    colors: [{
        name: String,
        hexCode: String,
        imageUrl: {
            type: String,
            set: normalizeImageUrl,
            get: getImageUrl
        }
    }],
    deliveryTimeFrame: {
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true,
            default: function() {
                // Default to 7 days from now
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date;
            },
            validate: {
                validator: function(v) {
                    // Skip validation if either field is missing
                    if (!this.deliveryTimeFrame || !this.deliveryTimeFrame.startDate) return true;
                    return v >= this.deliveryTimeFrame.startDate;
                },
                message: 'End date must be after start date'
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
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