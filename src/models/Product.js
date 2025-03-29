const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['bags', 'belts', 'bangles-bracelet', 'sunglasses']
  },
  subcategory: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  colors: [{
    name: String,
    hexCode: String,
    imageUrl: String
  }],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  features: [String],
  specifications: {
    type: Map,
    of: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
