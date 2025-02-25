const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        lowercase: true,
        enum: ['accessories', 'fragrance', 'bags', 'clothes', 'jewerly', 'all']
    },
    subcategory: { 
        type: String, 
        lowercase: true,
        validate: {
            validator: function(v) {
                const validSubcategories = {
                    accessories: ['sunglasses', 'wrist watches', 'belts', 'bangles-bracelet', 'earrings', 'necklace', 'pearls'],
                    fragrance: ['designer-niche', 'unboxed', 'testers', 'arabian', 'diffuser', 'mist'],
                    bags: [],
                    clothes: [],
                    jewerly: []
                };
                if (!v) return true; // subcategory is optional
                return !this.category || !validSubcategories[this.category] || validSubcategories[this.category].includes(v);
            },
            message: props => `${props.value} is not a valid subcategory for the selected category`
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

// Compound index for better query performance
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 }); // Add index for price queries

const Products = mongoose.model("Product", ProductSchema);
module.exports = Products;