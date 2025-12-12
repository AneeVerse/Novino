import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || process.env.EMAIL_APP_PASS)?.replace(/\s+/g, ''),
    },
});

// Test transporter configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email transporter configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send emails');
    }
});

export const sendContactEmail = async (name: string, email: string, subject: string, message: string) => {
    const receiver = process.env.EMAIL_RECEIVER || process.env.EMAIL_USER;

    console.log('📧 Sending contact form emails:', {
        from: process.env.EMAIL_USER,
        to: receiver,
        userEmail: email
    });

    // Email to the owner (Receiver)
    const mailOptionsOwner = {
        from: process.env.EMAIL_USER,
        to: receiver,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
      <h3>New Message from Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
    };

    // Email to the user (Sender)
    const mailOptionsUser = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Thank you for contacting Novino`,
        html: `
      <h3>Thank you for reaching out, ${name}!</h3>
      <p>We have received your message regarding "<strong>${subject}</strong>".</p>
      <p>Our team will get back to you shortly.</p>
      <br>
      <p>Best regards,</p>
      <p>The Novino Team</p>
    `,
    };

    try {
        await Promise.all([
            transporter.sendMail(mailOptionsOwner),
            transporter.sendMail(mailOptionsUser),
        ]);
        console.log('✅ Contact form emails sent successfully');
    } catch (error: any) {
        console.error('❌ Error sending contact form emails:', error);
        throw error;
    }
};

export const sendOrderConfirmationEmail = async (order: any) => {
    const receiver = process.env.EMAIL_RECEIVER || process.env.EMAIL_USER; // Fallback to sender email if receiver not set
    const userEmail = order.delivery_address?.email || order.user_email; // Fallback if needed

    console.log('📧 Attempting to send order confirmation emails:', {
        orderNumber: order.order_number || order.id,
        ownerEmail: receiver,
        customerEmail: userEmail,
        emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS
    });

    if (!userEmail) {
        console.error('❌ No customer email found for order:', order.order_number || order.id);
        return;
    }

    if (!receiver) {
        console.error('❌ No receiver email configured (EMAIL_RECEIVER or EMAIL_USER)');
        return;
    }

    // Calculate totals
    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    const total = order.total || subtotal;

    // Build items HTML for owner email (detailed)
    const itemsHtmlOwner = order.items?.map((item: any) => `
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
                ${item.image ? `<img src="${item.image}" alt="${item.name || 'Product'}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" />` : '<div style="width: 80px; height: 80px; background: #f0f0f0; border-radius: 8px;"></div>'}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
                <strong style="font-size: 16px; color: #333;">${item.name || 'Product'}</strong>
                ${item.sku ? `<br><span style="font-size: 12px; color: #888;">SKU: ${item.sku}</span>` : ''}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                <strong>₹${item.price?.toLocaleString('en-IN') || 0}</strong>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                <strong>₹${((item.price * item.quantity) || 0).toLocaleString('en-IN')}</strong>
            </td>
        </tr>
    `).join('') || '';

    // Build items HTML for customer email (simplified)
    const itemsHtmlCustomer = order.items?.map((item: any) => `
        <tr>
            <td style="padding: 15px; border-bottom: 1px solid #eee;">
                ${item.image ? `<img src="${item.image}" alt="${item.name || 'Product'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />` : '<div style="width: 100px; height: 100px; background: #f0f0f0; border-radius: 8px;"></div>'}
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: left;">
                <strong style="font-size: 16px; color: #333;">${item.name || 'Product'}</strong>
                <div style="color: #666; margin-top: 5px;">Quantity: ${item.quantity}</div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right;">
                <strong style="font-size: 18px; color: #2D2D2D;">₹${((item.price * item.quantity) || 0).toLocaleString('en-IN')}</strong>
            </td>
        </tr>
    `).join('') || '';

    // Email to the owner (NOVINO)
    const mailOptionsOwner = {
        from: process.env.EMAIL_USER,
        to: receiver,
        subject: `🎉 New Order Received - ${order.order_number || order.id}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2D2D2D 0%, #1a1a1a 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Order #${order.order_number || order.id}</p>
        </div>

        <!-- Order Details -->
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">Order Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;">Order Number:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${order.order_number || order.id}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Status:</td>
                    <td style="padding: 8px 0;"><span style="background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${order.payment_status || 'PAID'}</span></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #2D2D2D;"><strong style="font-size: 24px;">₹${total.toLocaleString('en-IN')}</strong></td>
                </tr>
            </table>
        </div>

        <!-- Customer Details -->
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;">Name:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${order.delivery_address?.name || 'N/A'}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${userEmail}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Phone:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${order.delivery_address?.phone || 'N/A'}</strong></td>
                </tr>
            </table>
        </div>

        <!-- Shipping Address -->
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">📍 Shipping Address</h2>
            <div style="color: #333; line-height: 1.8;">
                <strong>${order.delivery_address?.name || 'N/A'}</strong><br>
                ${order.delivery_address?.line1 || ''}<br>
                ${order.delivery_address?.line2 ? order.delivery_address.line2 + '<br>' : ''}
                ${order.delivery_address?.city || ''}, ${order.delivery_address?.state || ''} - ${order.delivery_address?.pincode || ''}<br>
                <strong>Phone:</strong> ${order.delivery_address?.phone || 'N/A'}
            </div>
        </div>

        <!-- Products -->
        <div style="margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">📦 Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: #2D2D2D; color: white;">
                        <th style="padding: 12px 15px; text-align: left;">Image</th>
                        <th style="padding: 12px 15px; text-align: left;">Product</th>
                        <th style="padding: 12px 15px; text-align: center;">Qty</th>
                        <th style="padding: 12px 15px; text-align: right;">Price</th>
                        <th style="padding: 12px 15px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtmlOwner}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="padding: 15px; text-align: right; border-top: 2px solid #2D2D2D;"><strong>Total Amount:</strong></td>
                        <td style="padding: 15px; text-align: right; border-top: 2px solid #2D2D2D;"><strong style="font-size: 20px; color: #10B981;">₹${total.toLocaleString('en-IN')}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="margin: 5px 0;">Process this order in your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/orders" style="color: #2D2D2D; text-decoration: none; font-weight: bold;">Dashboard</a></p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} Novino. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `,
    };

    // Email to the customer
    const mailOptionsUser = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `✅ Order Placed Successfully - ${order.order_number || order.id}`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">✅ Order Placed Successfully!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your order, ${order.delivery_address?.name || 'Customer'}!</p>
        </div>

        <!-- Success Message -->
        <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
            <p style="margin: 0; color: #065f46; font-size: 15px;">
                <strong>🎉 Your order has been confirmed!</strong><br>
                We're preparing your items and will ship them soon. You'll receive tracking details once your order is dispatched.
            </p>
        </div>

        <!-- Order Summary -->
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666; width: 40%;">Order Number:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${order.order_number || order.id}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; color: #333;"><strong>${new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                    })}</strong></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Delivery Address:</td>
                    <td style="padding: 8px 0; color: #333;">
                        ${order.delivery_address?.line1 || ''}, ${order.delivery_address?.city || ''}<br>
                        ${order.delivery_address?.state || ''} - ${order.delivery_address?.pincode || ''}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Products -->
        <div style="margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #2D2D2D; font-size: 20px;">Your Items</h2>
            <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tbody>
                    ${itemsHtmlCustomer}
                </tbody>
                <tfoot>
                    <tr style="background: #f8f8f8;">
                        <td colspan="2" style="padding: 15px; text-align: right; border-top: 2px solid #2D2D2D;"><strong style="font-size: 18px;">Total Amount:</strong></td>
                        <td style="padding: 15px; text-align: right; border-top: 2px solid #2D2D2D;"><strong style="font-size: 22px; color: #10B981;">₹${total.toLocaleString('en-IN')}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <!-- Track Order Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders" 
               style="display: inline-block; background: #2D2D2D; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Track Your Order
            </a>
        </div>

        <!-- Help Section -->
        <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <p style="margin: 0 0 10px 0; color: #666;">Need help with your order?</p>
            <p style="margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/contact" style="color: #2D2D2D; text-decoration: none; font-weight: bold;">Contact Support</a>
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="margin: 5px 0;"><strong>Thank you for shopping with Novino!</strong></p>
            <p style="margin: 5px 0;">We appreciate your business and hope you enjoy your purchase.</p>
            <p style="margin: 15px 0 5px 0;">© ${new Date().getFullYear()} Novino. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `,
    };

    try {
        console.log('📤 Sending email to owner:', receiver);
        await transporter.sendMail(mailOptionsOwner);
        console.log('✅ Owner email sent successfully');

        console.log('📤 Sending email to customer:', userEmail);
        await transporter.sendMail(mailOptionsUser);
        console.log('✅ Customer email sent successfully');

        console.log('✅ All order confirmation emails sent successfully');
    } catch (error: any) {
        console.error('❌ Error sending order confirmation emails:', {
            error: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        // Don't throw error to prevent blocking the order process
    }
};
