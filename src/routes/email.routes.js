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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format. Please provide a valid email address.'
      });
    }

    // Get admin emails from request body if available
    let adminEmails = [];
    if (req.body.adminEmails) {
      try {
        adminEmails = JSON.parse(req.body.adminEmails);
        
        // Validate admin emails
        if (Array.isArray(adminEmails)) {
          adminEmails = adminEmails.filter(email => emailRegex.test(email));
        }
      } catch (error) {
        console.warn('Failed to parse adminEmails, ignoring:', error);
        adminEmails = [];
      }
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Receipt file is too large. Maximum size is 5MB.'
      });
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
    
    // Add comprehensive diagnostic information to help with debugging
    console.log('Email diagnostic information:');
    console.log('- EMAIL_USER configured:', process.env.EMAIL_USER ? 'Yes' : 'No');
    console.log('- EMAIL_PASSWORD configured:', process.env.EMAIL_PASSWORD ? 'Yes (but might be invalid)' : 'No');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Error code:', error.code);
    console.log('- Error name:', error.name);
    console.log('- Error message:', error.message);
    
    // Provide highly specific error messages based on the error type
    let errorMessage = 'Failed to send receipt email';
    let statusCode = 500;
    let troubleshooting = 'Please try again later or contact support.';
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      errorMessage = 'Email service not properly configured.';
      troubleshooting = 'Missing email credentials. Please contact the administrator.';
      console.error('Email configuration error: Missing credentials');
    } else if (error.message && error.message.includes('Email service not properly configured')) {
      errorMessage = 'Email service configuration error.';
      troubleshooting = 'The email service is not properly set up. Please contact support.';
      console.error('Email config error:', error.message);
    } else if (error.code === 'EAUTH' || (error.message && error.message.includes('authentication'))) {
      errorMessage = 'Email authentication failed.';
      troubleshooting = 'The system cannot authenticate with the email server. This might be due to an invalid app password or security settings.';
      console.error('Email auth error:', error.message);
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION' || error.code === 'ECONNREFUSED') {
      errorMessage = 'Cannot connect to email server.';
      troubleshooting = 'There was a problem connecting to the email server. This could be due to network issues or server unavailability.';
      console.error('Email connection error:', error.code, error.message);
    } else if (error.responseCode === 535) {
      errorMessage = 'Email credentials rejected.';
      troubleshooting = 'The email server rejected the credentials. This may happen if the app password has expired or been revoked.';
      console.error('Gmail auth error:', error.message);
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email server request timed out.';
      troubleshooting = 'The connection to the email server timed out. Please try again when network conditions improve.';
      console.error('Email timeout error:', error.message);
    } else if (error.code === 'EMFILE') {
      errorMessage = 'Server resource limit reached.';
      troubleshooting = 'The server has reached its resource limit. Please try again later.';
      console.error('Server resource error:', error.message);
    }
    
    return res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      troubleshooting: troubleshooting,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      code: error.code || 'UNKNOWN',
      alternativeContact: 'If the issue persists, please contact us via WhatsApp at +2348033825144 to confirm your order.',
      suggestion: 'You can still download your receipt from the checkout page.'
    });
  }
});

module.exports = router; 