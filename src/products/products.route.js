const express = require('express');
const Products = require("./products.model");
const { CATEGORIES } = require('../constants/categoryConstants');
const router = express.Router();
const Reviews = require('../reviews/reviews.model');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

router.post("/create-product", async (req, res) => {
    try {
        // Prepare the product data with all required fields and proper formats
        const productData = {
            ...req.body,
            // Set a default author ID only if not provided in the request
            author: req.body.author || '000000000000000000000000',
            // Ensure deliveryTimeFrame is properly structured
            deliveryTimeFrame: {
                startDate: req.body.deliveryTimeFrame?.startDate || new Date(),
                endDate: req.body.deliveryTimeFrame?.endDate || new Date(new Date().setDate(new Date().getDate() + 7))
            }
        };

        console.log("Creating product with data:", JSON.stringify(productData, null, 2));
        
        // Create product instance for validation
        const newProduct = new Products(productData);
        
        // Validate the product before saving
        const validationError = newProduct.validateSync();
        if (validationError) {
            console.error("Validation error:", validationError);
            return res.status(400).send({
                message: "Product validation failed",
                error: validationError.message,
                details: validationError.errors
            });
        }
        
        // Save the product
        const savedProduct = await newProduct.save();
        
        const reviews = await Reviews.find({ productId: savedProduct._id });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
            const averageRating = totalRating / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }
        res.status(201).send(savedProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        
        // Prepare a detailed error response
        let errorResponse = { 
            message: "Error creating product"
        };
        
        // Add validation error details if available
        if (error.name === 'ValidationError') {
            errorResponse.error = "Validation failed";
            errorResponse.details = {};
            
            // Format validation errors for each field
            Object.keys(error.errors || {}).forEach(field => {
                errorResponse.details[field] = error.errors[field].message;
            });
        } else {
            // For other types of errors
            errorResponse.error = error.message;
        }
        
        res.status(error.name === 'ValidationError' ? 400 : 500).send(errorResponse);
    }
})

// router.get('/example', (req, res) => {
//     res.send('Product route example');
// });
router.get('/', async (req, res) => {
    try {
        const { 
            category, 
            subcategory, 
            minPrice, 
            maxPrice, 
            page = 1, 
            limit = 10, 
            sort = '-createdAt',
            q = '' // Search query parameter
        } = req.query;
        
        let filter = {};
        
        // Add search functionality
        if (q && q.trim() !== '') {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } },
                { subcategory: { $regex: q, $options: 'i' } }
            ];
        }
        
        // Build filter object
        if (category && category !== 'all') {
            filter.category = category.toLowerCase().trim();
        }
        
        if (subcategory) {
            filter.subcategory = subcategory.toLowerCase().trim();
        }

        // Properly handle price filters
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            
            // Handle minPrice
            if (minPrice !== undefined && minPrice !== '') {
                const parsedMinPrice = parseFloat(minPrice);
                if (!isNaN(parsedMinPrice)) {
                    filter.price.$gte = parsedMinPrice;
                }
            }
            
            // Handle maxPrice
            if (maxPrice !== undefined && maxPrice !== '') {
                const parsedMaxPrice = parseFloat(maxPrice);
                if (!isNaN(parsedMaxPrice)) {
                    filter.price.$lte = parsedMaxPrice;
                }
            }
            
            // Remove price filter if no valid prices
            if (Object.keys(filter.price).length === 0) {
                delete filter.price;
            }
        }

        // Debug log
        console.log('Query params:', { 
            filter, 
            sort, 
            page, 
            limit,
            rawMinPrice: minPrice,
            rawMaxPrice: maxPrice,
            searchQuery: q
        });

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));
        
        // Add proper sorting
        const sortObj = {};
        if (sort.startsWith('-')) {
            sortObj[sort.substring(1)] = -1;
        } else {
            sortObj[sort] = 1;
        }

        const products = await Products.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .populate("author", "email username")
            .sort(sortObj);
            
        res.status(200).json({ 
            success: true,
            products, 
            totalPages, 
            totalProducts,
            currentPage: parseInt(page),
            filter // Include filter in response for debugging
        });
    } catch (error) {
        console.error("Error getting products:", error);
        // Log the full error stack trace in development
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
        res.status(500).json({ 
            success: false,
            message: "Error getting products",
            error: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : undefined 
        });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        let filter = {};

        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { subcategory: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const products = await Products.find(filter)
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            products,
            totalProducts: products.length
        });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({
            success: false,
            message: "Error searching products",
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
});

router.get("/single/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Products.findById(productId).populate("author", "email username");

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "Product not found" 
            });
        }

        const reviews = await Reviews.find({ productId }).populate("userId", "username email");
        res.status(200).json({ 
            success: true,
            product, 
            reviews 
        });
    } catch (error) {
        console.error("Error getting product:", error);
        res.status(500).json({ 
            success: false,
            message: "Error getting product",
            error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
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
router.patch("/update-product/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Prepare update data with all required fields and proper formats
        const updateData = { 
            ...req.body,
            // Set a default author ID only if not provided in the request
            author: req.body.author || '000000000000000000000000',
            // Ensure deliveryTimeFrame is properly structured
            deliveryTimeFrame: {
                startDate: req.body.deliveryTimeFrame?.startDate || new Date(),
                endDate: req.body.deliveryTimeFrame?.endDate || new Date(new Date().setDate(new Date().getDate() + 7))
            }
        };
        
        console.log("Updating product with data:", JSON.stringify(updateData, null, 2));
        
        // First, check if the product exists
        const existingProduct = await Products.findById(productId);
        if (!existingProduct) {
            return res.status(404).send({ message: "Product not found" });
        }
        
        // Validate the update data before applying
        const tempProduct = new Products({
            ...existingProduct.toObject(),
            ...updateData
        });
        
        const validationError = tempProduct.validateSync();
        if (validationError) {
            console.error("Validation error:", validationError);
            return res.status(400).send({
                message: "Product validation failed",
                error: validationError.message,
                details: validationError.errors
            });
        }
        
        // Apply the update
        const updatedProduct = await Products.findByIdAndUpdate(
            productId, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).send({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating the product:", error);
        
        // Prepare a detailed error response
        let errorResponse = { 
            message: "Failed to update the product"
        };
        
        // Add validation error details if available
        if (error.name === 'ValidationError') {
            errorResponse.error = "Validation failed";
            errorResponse.details = {};
            
            // Format validation errors for each field
            Object.keys(error.errors || {}).forEach(field => {
                errorResponse.details[field] = error.errors[field].message;
            });
        } else {
            // For other types of errors
            errorResponse.error = error.message;
        }
        
        res.status(error.name === 'ValidationError' ? 400 : 500).send(errorResponse);
    }
});

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
