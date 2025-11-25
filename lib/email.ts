import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_APP_PASS?.replace(/\s+/g, ''),
    },
});

export const sendContactEmail = async (name: string, email: string, subject: string, message: string) => {
    const receiver = process.env.NEXT_PUBLIC_EMAIL_RECEIVER;

    // Email to the owner (Receiver)
    const mailOptionsOwner = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
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
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
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

    await Promise.all([
        transporter.sendMail(mailOptionsOwner),
        transporter.sendMail(mailOptionsUser),
    ]);
};

export const sendOrderConfirmationEmail = async (order: any) => {
    const receiver = process.env.NEXT_PUBLIC_EMAIL_RECEIVER;
    const userEmail = order.delivery_address.email || order.user_email; // Fallback if needed

    const itemsHtml = order.items.map((item: any) => `
    <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
      <p><strong>${item.name}</strong></p>
      <p>Quantity: ${item.quantity}</p>
      <p>Price: ₹${item.price}</p>
      ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100px; height: auto;" />` : ''}
    </div>
  `).join('');

    const orderDetailsHtml = `
    <h2>Order Confirmation</h2>
    <p><strong>Order ID:</strong> ${order.order_number || order.id}</p>
    <p><strong>Total Amount:</strong> ₹${order.total}</p>
    <p><strong>Shipping Address:</strong></p>
    <p>
      ${order.delivery_address.name}<br>
      ${order.delivery_address.line1}<br>
      ${order.delivery_address.line2 ? order.delivery_address.line2 + '<br>' : ''}
      ${order.delivery_address.city}, ${order.delivery_address.state} - ${order.delivery_address.pincode}<br>
      Phone: ${order.delivery_address.phone}
    </p>
    <h3>Items:</h3>
    ${itemsHtml}
  `;

    // Email to the owner
    const mailOptionsOwner = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to: receiver,
        subject: `New Order Received: ${order.order_number || order.id}`,
        html: `
      <h3>New Order Received!</h3>
      ${orderDetailsHtml}
    `,
    };

    // Email to the user
    const mailOptionsUser = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to: userEmail,
        subject: `Order Confirmation: ${order.order_number || order.id}`,
        html: `
      <h3>Thank you for your order!</h3>
      <p>We have received your order and it is being processed.</p>
      ${orderDetailsHtml}
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
        console.log('Order confirmation emails sent successfully');
    } catch (error) {
        console.error('Error sending order confirmation emails:', error);
        // Don't throw error to prevent blocking the order process
    }
};
