const nodemailer = require('nodemailer');

/**
 * Email Service for sending transactional emails
 */
const emailService = {
  // Create reusable transporter object using SMTP transport
  createTransporter: () => {
    // Validate that required email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email service not properly configured. Missing EMAIL_USER or EMAIL_PASSWORD environment variables.');
    }
    
    // Use environment variables for sensitive information
    // For Gmail, we're using the App Password method which is more secure
    // This password should be generated from Google Account > Security > App Passwords
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  },

  // Fallback transporter using direct SMTP (as an alternative if primary fails)
  createFallbackTransporter: () => {
    // For fallback, we'll use a more direct SMTP connection
    return nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  },

  /**
   * Send a receipt email with attachment
   * 
   * @param {Object} options - Email options
   * @param {String} options.to - Recipient email address
   * @param {String} options.subject - Email subject
   * @param {String} options.receiptNumber - Order receipt number
   * @param {String} options.customerName - Customer full name
   * @param {String} options.orderDate - Order date
   * @param {String} options.deliveryDate - Expected delivery date
   * @param {String} options.totalAmount - Order total amount
   * @param {Buffer} options.attachment - PDF receipt as buffer
   * @param {String} options.attachmentName - Filename for the attachment
   * @returns {Promise} - Resolves with info about sent email
   */
  sendReceiptEmail: async (options) => {
    try {
      console.log('Attempting to send email with primary transporter...');
      const transporter = emailService.createTransporter();
      
      // Create the HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #000; margin-bottom: 5px;">FEB LUXURY</h1>
            <p style="color: #666; font-size: 16px;">Order Confirmation</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear ${options.customerName},</p>
            <p>Thank you for your order! Your payment has been received, and your order is being processed.</p>
            <p>Here are your order details:</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Receipt Number:</strong> ${options.receiptNumber}</p>
            <p><strong>Order Date:</strong> ${options.orderDate}</p>
            <p><strong>Expected Delivery:</strong> ${options.deliveryDate}</p>
            <p><strong>Total Amount:</strong> ₦${options.totalAmount}</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Your receipt is attached to this email. If you have any questions about your order, please contact us.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #666; font-size: 12px;">
            <p>FEB Luxury Closet</p>
            <p>Contact: +2348033825144 | Email: febluxurycloset@gmail.com</p>
            <p>Follow us on <a href="https://www.instagram.com/f.e.b_luxuryclosetbackup1" style="color: #000;">Instagram</a> and 
               <a href="https://t.me/febluxury" style="color: #000;">Telegram</a></p>
          </div>
        </div>
      `;

      // Email options
      const mailOptions = {
        from: `"FEB Luxury" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject || 'Your FEB Luxury Order Confirmation',
        html: htmlContent,
        attachments: [{
          filename: options.attachmentName,
          content: options.attachment,
          contentType: 'application/pdf'
        }]
      };

      // Add CC if admin emails are provided
      if (options.adminEmails && options.adminEmails.length > 0) {
        mailOptions.cc = options.adminEmails.join(',');
      }

      try {
        // Send the email with primary transporter
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (primaryError) {
        // If primary method fails, try fallback
        console.error('Primary email method failed:', primaryError.message);
        console.log('Attempting fallback email method...');
        
        const fallbackTransporter = emailService.createFallbackTransporter();
        const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
        
        console.log('Email sent successfully with fallback method:', fallbackInfo.messageId);
        return { success: true, messageId: fallbackInfo.messageId, usedFallback: true };
      }
    } catch (error) {
      console.error('All email methods failed:', error);
      
      // Add more specific error information to help with debugging
      if (error.code === 'EAUTH') {
        console.error('Authentication failed - check email/password or app password settings');
      } else if (error.code === 'ESOCKET') {
        console.error('Socket connection failed - check network settings and firewall');
      } else if (error.code === 'ECONNECTION') {
        console.error('Connection failed - check network settings');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out - check network settings');
      }
      
      throw error;
    }
  }
};

module.exports = emailService; 