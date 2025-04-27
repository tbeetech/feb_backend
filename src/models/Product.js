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
  stockStatus: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Pre Order'],
    default: 'In Stock'
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  deliveryTimeFrame: {
    startDate: Date,
    endDate: Date
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
}, { timestamps: true });

// Add a virtual field for estimated delivery date
productSchema.virtual('estimatedDeliveryDate').get(function() {
  const addBusinessDays = (date, days) => {
    let currentDate = new Date(date);
    let addedDays = 0;
    while (addedDays < days) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        addedDays++;
      }
    }
    return currentDate;
  };

  const today = new Date();
  if (this.stockStatus === 'Pre Order') {
    return addBusinessDays(today, 14);
  } else if (this.stockStatus === 'In Stock') {
    return addBusinessDays(today, 3);
  } else if (this.deliveryTimeFrame?.startDate && this.deliveryTimeFrame?.endDate) {
    return this.deliveryTimeFrame.endDate;
  }
  return null;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
