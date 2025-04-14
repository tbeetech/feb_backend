const express = require('express');
const router = express.Router();
const multer = require('multer');
const emailService = require('../utils/emailService');

// Setup multer storage for handling file uploads
const storage = multer.memoryStorage(); // Store files as Buffer objects
const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 1 // Max 1 file
  }
});

/**
 * @route POST /api/send-receipt-email
 * @desc Send a receipt email with PDF attachment
 * @access Public
 */
router.post('/send-receipt-email', upload.single('receipt'), async (req, res) => {
  try {
    // Ensure there's a file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Receipt file is required' });
    }

    // Check for required fields
    const { 
      receiptNumber, 
      customerName, 
      customerEmail, 
      orderDate, 
      deliveryDate, 
      totalAmount 
    } = req.body;

    if (!customerEmail || !receiptNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer email and receipt number are required' 
      });
    }

    // Get admin emails from request body if available
    let adminEmails = [];
    if (req.body.adminEmails) {
      try {
        adminEmails = JSON.parse(req.body.adminEmails);
      } catch (error) {
        console.warn('Failed to parse adminEmails, ignoring:', error);
      }
    }

    // Send the email with receipt
    const result = await emailService.sendReceiptEmail({
      to: customerEmail,
      subject: 'Your FEB Luxury Order Confirmation',
      receiptNumber,
      customerName: customerName || 'Valued Customer',
      orderDate: orderDate || new Date().toLocaleDateString(),
      deliveryDate: deliveryDate || 'To be confirmed',
      totalAmount: totalAmount || '0.00',
      attachment: req.file.buffer,
      attachmentName: `receipt-${receiptNumber}.pdf`,
      adminEmails
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Receipt email sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Error sending receipt email:', error);
    
    // Add diagnostic information to help with debugging
    console.log('Email diagnostic information:');
    console.log('- EMAIL_USER configured:', process.env.EMAIL_USER ? 'Yes' : 'No');
    console.log('- EMAIL_PASSWORD configured:', process.env.EMAIL_PASSWORD ? 'Yes' : 'No');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Error code:', error.code);
    console.log('- Error name:', error.name);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to send receipt email';
    let statusCode = 500;
    
    if (error.message && error.message.includes('Email service not properly configured')) {
      errorMessage = 'Email service configuration error. Please contact support.';
      console.error('Email config error:', error.message);
    } else if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check credentials or app password settings.';
      console.error('Email auth error:', error.message);
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      errorMessage = 'Email server connection failed. Please try again later.';
      console.error('Email connection error:', error.code, error.message);
    } else if (error.responseCode === 535) {
      errorMessage = 'Email authentication rejected. Check if "Less secure app access" is enabled or use an app password.';
      console.error('Gmail auth error:', error.message);
    }
    
    return res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      code: error.code || 'UNKNOWN',
      suggestion: 'If this is a persistent issue, please use the WhatsApp option to complete your order.'
    });
  }
});

module.exports = router; 