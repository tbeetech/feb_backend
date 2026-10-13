const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken');
const Product = require('../models/Product');

// Create new order
router.post('/create', verifyToken, async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name image price stockStatus'
            })
            .sort({ createdAt: -1 });
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single order details
router.get('/:orderId', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            userId: req.user._id
        }).populate({
            path: 'items.product',
            select: 'name image price stockStatus'
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel order (only if pending)
router.patch('/:orderId/cancel', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            userId: req.user._id,
            status: 'pending'
        });

        if (!order) {
            return res.status(404).json({ 
                message: 'Order not found or cannot be cancelled' 
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;