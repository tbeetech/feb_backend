const express = require('express');
const router = express.Router();
const Reviews = require('./reviews.model');
const Products = require('../products/products.model');
const verifyToken = require('../middleware/verifyToken');

// total reviews count

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Reviews.find({ 
            productId,
            status: 'active'
        })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch reviews" 
        });
    }
});

// Post a new review
router.post("/post-review", verifyToken, async (req, res) => {
    try {
        console.log("Received review submission:", req.body);
        console.log("User from token:", req.user);
        
        const { comment, rating, productId } = req.body;
        const userId = req.user._id || req.user.userId; // Handle both formats
        
        // Validate input
        if (!comment || !rating || !productId) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User authentication failed. Please login again."
            });
        }

        // Validate product exists
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        console.log(`Checking for existing review - ProductID: ${productId}, UserID: ${userId}`);
        const existingReview = await Reviews.findOne({ productId, userId });

        if (existingReview) {
            console.log("Updating existing review:", existingReview._id);
            // Update existing review
            existingReview.comment = comment;
            existingReview.rating = rating;
            existingReview.isEdited = true;
            existingReview.editedAt = new Date();
            await existingReview.save();
            console.log("Review successfully updated");
        } else {
            console.log("Creating new review");
            // Create new review
            const newReview = new Reviews({
                comment,
                rating,
                productId,
                userId,
                status: 'active'
            });
            await newReview.save();
            console.log("New review created with ID:", newReview._id);

            // Increment review count only for new reviews
            await Products.findByIdAndUpdate(productId, {
                $inc: { reviewCount: 1 }
            });
            console.log("Product review count incremented");
        }

        // Update product rating
        const reviews = await Reviews.find({ 
            productId,
            status: 'active'
        });
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            
            await Products.findByIdAndUpdate(productId, {
                rating: averageRating
            });
            console.log(`Product rating updated to ${averageRating}`);
        }

        // Return updated reviews
        const updatedReviews = await Reviews.find({ 
            productId,
            status: 'active'
        })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

        console.log(`Returning ${updatedReviews.length} reviews`);
        res.status(200).json({
            success: true,
            message: 'Review processed successfully',
            reviews: updatedReviews
        });
    } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to post review",
            error: error.message
        });
    }
});

// Like/Unlike a review
router.post("/:reviewId/like", verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Reviews.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        const likeIndex = review.likes.indexOf(userId);
        if (likeIndex === -1) {
            review.likes.push(userId);
        } else {
            review.likes.splice(likeIndex, 1);
        }

        await review.save();
        res.status(200).json({
            success: true,
            likes: review.likes
        });
    } catch (error) {
        console.error("Error processing like:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process like"
        });
    }
});

// Get user's review activity
router.get("/user/:userId/activity", verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const reviews = await Reviews.find({ 
            userId,
            status: 'active'
        })
        .populate('productId', 'name image price')
        .sort({ createdAt: -1 });

        const likedReviews = await Reviews.find({
            likes: userId,
            status: 'active'
        })
        .populate('productId', 'name image price')
        .populate('userId', 'username')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            reviews,
            likedReviews
        });
    } catch (error) {
        console.error("Error fetching user activity:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user activity"
        });
    }
});

// Delete a review
router.delete("/:reviewId", verifyToken, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Reviews.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or unauthorized"
            });
        }

        review.status = 'deleted';
        await review.save();

        // Update product rating
        const reviews = await Reviews.find({ 
            productId: review.productId,
            status: 'active'
        });
        
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            
            await Products.findByIdAndUpdate(review.productId, {
                rating: averageRating,
                $inc: { reviewCount: -1 }
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review"
        });
    }
});

router.get("/total-reviews", async (req, res) => {
    try {
        const totalReviews = await Reviews.countDocuments({});
        res.status(200).send({ totalReviews })
    } catch (error) {
        console.error("Error getting total review", error);
        res.status(500).send({ message: "Failed to get review count" });
    }
});

// get reviews by userid
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }
    try {
        const reviews = await Reviews.find({ userId: userId }).sort({ createdAt: -1 });
        if (reviews.length === 0) {
            return res.status(404).send({message: "no reviews found"});
            }
            res.status(200).send(reviews);

} catch (error) {
            console.error("Error fetching reviews by user", error);
            res.status(500).send({ message: "Failed to fetch reviews by user" });

        }
    })
module.exports = router;