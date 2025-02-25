const express = require('express');
const Products = require("./products.model");
const router = express.Router();
const Reviews = require('../reviews/reviews.model');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post("/create-product", async (req, res) => {
    try {
        const newProduct = new Products({
            ...req.body
        })
        const savedProduct = await newProduct.save()
        const reviews = await Reviews.find({ productId: savedProduct._id });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }
        res.status(201).send(savedProduct);
    } catch (error) {
        console.error("error creating product", error);
        res.status(500).send({ message: "Error creating product" })

    }
})

// router.get('/example', (req, res) => {
//     res.send('Product route example');
// });
router.get('/', async (req, res) => {
    try {
        const { category, subcategory, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
        let filter = {};
        
        // Build filter based on category and subcategory
        if (category && category !== 'all') {
            filter.category = category.toLowerCase();
            
            // Only add subcategory filter if it exists and category is specified
            if (subcategory) {
                filter.subcategory = subcategory.toLowerCase().replace(/-/g, ' ');
            }
        }

        // Add price filter if provided
        if (minPrice !== undefined && maxPrice !== undefined) {
            filter.price = { 
                $gte: parseFloat(minPrice) || 0,
                $lte: parseFloat(maxPrice) || Number.MAX_VALUE 
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        
        const products = await Products.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author", "email username")
            .sort({ createdAt: -1 });
            
        res.status(200).send({ 
            products, 
            totalPages, 
            totalProducts,
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error("Error getting products:", error);
        res.status(500).send({ 
            message: "Error getting products",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined 
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Products.findById(productId).populate("author", "email username");

        if (!product) {
            return res.status(404).send({ message: "Product not found" })
        }
        const reviews = await Reviews.find({ productId }).populate("userId", "username email");
        res.status(200).send({ product, reviews });
    } catch (error) {
        console.error("error getting product", error);
        res.status(500).send({ message: "Error getting product" })
    }
})
router.patch("/update-product/:id", verifyToken,verifyAdmin, async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await Products.findByIdAndUpdate(productId, { ...req.body }, {
            new: true
        })

        if (!updatedProduct) {
            return res.status(404).send({ message: "Product not found" });
        }
        res.status(200).send({
            message: "Product updated successfully",
            product: updatedProduct
        })

    } catch (error) {
        console.error("Error updating the product", error);
        res.status(500).send({ message: "Failed to update the product" });



    }

})

router.delete('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Products.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).send({ message: "Product not found" });

        }

        // delete reviews related to the product
        await Reviews.deleteMany({ productId: productId })

        res.status(200).send({
            message: "Product deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting the product", error);
        res.status(500).send({ message: "Failed to delete the product" });
    }
})

router.get("/related/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({ message: "Product ID is required" });
        }
        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).send({ message: "Product not found" });
        }
        const titleRegex = new RegExp(product.name
            .split(" ")
            .filter((word)=> word.length > 1)
            .join("|"),
            "i");
            const relatedProducts = await Products.find({
                _id: {$ne: id},
                $or: [
                    {name: {$regex: titleRegex}},
                    {category: product.category},
                ],
            });
            res.status(200).send(relatedProducts)
    } catch (error) {
        console.error("Error fetching the related products", error);
        res.status(500).send({ message: "Failed to fetch related products" });
    }

})

module.exports = router;
