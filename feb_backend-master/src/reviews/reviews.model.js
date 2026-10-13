const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
   comment: {type: String, required: true},
   rating: {type: Number, required: true},
   userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
   productId: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
   likes: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
   isEdited: {type: Boolean, default: false},
   editedAt: Date,
   status: {
      type: String,
      enum: ['active', 'hidden', 'deleted'],
      default: 'active'
   }
}, {timestamps: true});

// Indexes for better query performance
ReviewSchema.index({userId: 1, productId: 1}, {unique: true});
ReviewSchema.index({productId: 1, createdAt: -1});
ReviewSchema.index({userId: 1, createdAt: -1});

const Reviews = mongoose.model("Review", ReviewSchema);
module.exports = Reviews;