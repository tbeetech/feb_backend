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
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      // Add debug option for detailed SMTP logs in development
      ...(process.env.NODE_ENV === 'development' && { debug: true })
    });
  },

  // Create a more direct SMTP transporter as fallback
  createFallbackTransporter: () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Email service not properly configured. Missing credentials for fallback transport.');
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      // Add debug option for detailed SMTP logs in development
      ...(process.env.NODE_ENV === 'development' && { debug: true })
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
      console.log('Attempting to send receipt email to:', options.to);
      console.log('Email service configuration:');
      console.log('- EMAIL_USER configured:', process.env.EMAIL_USER ? 'Yes' : 'No');
      console.log('- EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      
      // Check if the attachment exists and is valid
      if (!options.attachment || options.attachment.length === 0) {
        console.warn('Warning: The attachment is empty or missing');
      } else {
        console.log('Attachment size:', options.attachment.length, 'bytes');
      }
      
      // First try primary transporter
      let transporter;
      try {
        transporter = emailService.createTransporter();
        console.log('Primary email transporter created successfully');
      } catch (transporterError) {
        console.error('Failed to create primary email transporter:', transporterError);
        throw new Error(`Email configuration error: ${transporterError.message}`);
      }
      
      // Create the HTML content for the email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #000; margin-bottom: 5px;">FEB LUXURY</h1>
            <p style="color: #666; font-size: 16px;">Order Confirmation</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear ${options.customerName},</p>
            <p>Thank you for your order! We have received your order details and it is now being processed.</p>
            <p>Please note that your order requires payment to be completed. <strong>Contact us via WhatsApp to complete your payment.</strong></p>
            <p>Here are your order details:</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Receipt Number:</strong> ${options.receiptNumber}</p>
            <p><strong>Order Date:</strong> ${options.orderDate}</p>
            <p><strong>Expected Delivery:</strong> ${options.deliveryDate}</p>
            <p><strong>Total Amount:</strong> ₦${options.totalAmount}</p>
          </div>
          
          <div style="margin-bottom: 25px; background-color: #fff8e1; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px;">
            <p style="font-weight: bold; margin-top: 0;">Important: Receipt and Payment Instructions</p>
            <p>A PDF receipt has been attached to this email. Please:</p>
            <ol style="margin-left: 20px; margin-bottom: 5px;">
              <li>Download the attached receipt</li>
              <li>Make payment via bank transfer using the account details on the receipt</li>
              <li>Forward the receipt to either of our WhatsApp numbers along with your payment confirmation:
                <br/>- Primary: +2348033825144
                <br/>- Secondary: +2348088690856
              </li>
            </ol>
            <p style="margin-bottom: 0;">Your order will be processed after we confirm your payment.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>To complete your order, please:</p>
            <ol style="margin-left: 20px;">
              <li>Make payment via bank transfer to the account details on your receipt</li>
              <li>Contact us via WhatsApp to confirm your payment</li>
            </ol>
            <p>Your order will be processed after payment confirmation.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <div style="margin-bottom: 10px;">
                <a href="https://wa.me/message/NP6XO5SXNXG5G1" style="display: inline-block; background-color: #25D366; color: white; font-weight: bold; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 5px;">
                  Contact Primary WhatsApp
                </a>
              </div>
              <div>
                <a href="https://wa.me/2348088690856" style="display: inline-block; background-color: #25D366; color: white; font-weight: bold; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 5px;">
                  Contact Secondary WhatsApp
                </a>
              </div>
            </div>
          </div>
          
          ${options.productImages && options.productImages.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <p style="font-weight: bold; margin-bottom: 10px;">Your Order Items:</p>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
              ${options.productImages.map(img => `
                <div style="border: 1px solid #e1e1e1; border-radius: 5px; padding: 5px; width: 100px; height: 100px; overflow: hidden;">
                  <img src="${img}" style="width: 100%; height: 100%; object-fit: cover;" alt="Product Image" />
                </div>
              `).join('')}
            </div>
          </div>` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; color: #666; font-size: 12px;">
            <p>FEB Luxury Closet</p>
            <p>Contact: +2348033825144 | +2348088690856 | Email: febluxurycloset@gmail.com</p>
            <p>
              <a href="https://wa.me/message/NP6XO5SXNXG5G1" style="color: #25D366; font-weight: bold; margin-right: 10px;">Primary WhatsApp</a> | 
              <a href="https://wa.me/2348088690856" style="color: #25D366; font-weight: bold; margin-left: 10px;">Secondary WhatsApp</a>
            </p>
            <p>
              <a href="https://www.instagram.com/f.e.b_luxuryclosetbackup1" style="color: #E4405F; font-weight: bold; margin-right: 10px;">@f.e.b_luxuryclosetbackup1</a> | 
              <a href="https://www.instagram.com/jumiescent_backup" style="color: #E4405F; font-weight: bold; margin-left: 10px;">@jumiescent_backup</a>
            </p>
          </div>
        </div>
      `;

      // Email options
      const mailOptions = {
        from: `"FEB Luxury" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject || 'Your FEB Luxury Order Confirmation',
        html: htmlContent,
        attachments: []
      };
      
      // Only add attachment if it exists and is valid
      if (options.attachment && options.attachment.length > 0) {
        mailOptions.attachments.push({
          filename: options.attachmentName || 'receipt.pdf',
          content: options.attachment,
          contentType: 'application/pdf'
        });
      } else {
        console.warn('No valid attachment provided for the email');
      }

      // Add CC if admin emails are provided
      if (options.adminEmails && options.adminEmails.length > 0) {
        mailOptions.cc = options.adminEmails.join(',');
        console.log('Adding CC recipients:', mailOptions.cc);
      }

      try {
        // Send the email with primary transporter
        console.log('Sending email with primary method...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (primaryError) {
        // Log detailed error information
        console.error('Primary email method failed:', primaryError);
        console.error('Error code:', primaryError.code);
        console.error('Error message:', primaryError.message);
        
        if (primaryError.response) {
          console.error('SMTP Response:', primaryError.response);
        }
        
        // Handle common Gmail auth errors
        if (primaryError.code === 'EAUTH' || 
            (primaryError.response && primaryError.response.includes('5.7.8'))) {
          console.error('Gmail authentication failed. This is likely due to:');
          console.error('1. The App Password may have expired or been revoked');
          console.error('2. 2FA might be required on the Gmail account');
          console.error('3. Less secure app access settings may need adjustment');
          console.error('To fix: Generate a new App Password in Google Account settings');
          
          // Try fallback without attachment if authentication failed
          console.log('Attempting to send email without attachment...');
          try {
            const simpleMailOptions = { ...mailOptions };
            simpleMailOptions.attachments = [];
            simpleMailOptions.html += '<p><strong>Note:</strong> We could not attach your receipt due to a technical issue. Please contact us to receive your receipt.</p>';
            
            const simpleInfo = await transporter.sendMail(simpleMailOptions);
            console.log('Simple email without attachment sent successfully:', simpleInfo.messageId);
            return { 
              success: true, 
              messageId: simpleInfo.messageId, 
              warning: 'Email sent without attachment due to technical limitations' 
            };
          } catch (simpleError) {
            console.error('Simple email also failed:', simpleError);
          }
          
          throw new Error('Email authentication failed. Please check credentials or app password settings.');
        }
        
        // Try fallback method
        console.log('Attempting fallback email method...');
        try {
          const fallbackTransporter = emailService.createFallbackTransporter();
          const fallbackInfo = await fallbackTransporter.sendMail(mailOptions);
          
          console.log('Email sent successfully with fallback method:', fallbackInfo.messageId);
          return { success: true, messageId: fallbackInfo.messageId, usedFallback: true };
        } catch (fallbackError) {
          console.error('Fallback email method also failed:', fallbackError);
          
          // Try one last attempt without attachment
          try {
            console.log('Last resort: Sending email without attachment...');
            const fallbackTransporter = emailService.createFallbackTransporter();
            const simpleMailOptions = { ...mailOptions };
            simpleMailOptions.attachments = [];
            simpleMailOptions.html += '<p><strong>Note:</strong> We could not attach your receipt due to a technical issue. Please contact us to receive your receipt.</p>';
            
            const finalInfo = await fallbackTransporter.sendMail(simpleMailOptions);
            console.log('Last resort email sent successfully:', finalInfo.messageId);
            return { 
              success: true, 
              messageId: finalInfo.messageId, 
              warning: 'Email sent without attachment due to technical limitations' 
            };
          } catch (finalError) {
            console.error('All email attempts failed:', finalError);
          }
          
          throw new Error(`Email delivery failed: ${fallbackError.message}`);
        }
      }
    } catch (error) {
      console.error('All email methods failed:', error);
      
      // Create a more specific error message based on the error type
      let errorMessage = 'Failed to send email. ';
      
      if (error.code === 'EAUTH') {
        errorMessage += 'Authentication failed - check email credentials or app password settings.';
      } else if (error.code === 'ESOCKET') {
        errorMessage += 'Connection error - check network and firewall settings.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage += 'Connection failed - check network settings.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += 'Connection timed out - check network settings.';
      } else if (error.message && error.message.includes('configuration')) {
        errorMessage += 'Configuration error - email service not properly set up.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      // Wrap the error with more context
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.code = error.code;
      throw enhancedError;
    }
  }
};

module.exports = emailService;