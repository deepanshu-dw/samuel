// config/email.config.js
const nodemailer = require("nodemailer");

let transporter;

try {
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.zoho.eu", // or your correct SMTP host
    //   port: 465,
    //   secure: true, // true for port 465, false for 587
    //   auth: {
    //     user: "designoweb@lifestyleservices.eu",
    //     pass: "D3signow@b", // or app password
    //   },
    // });

    //Remove below credentials. These are used from Cathy project for testing.
    transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: "info@goldskyer.com", // your email
            pass: "C8ekOcnUHS6*N8Ax",   // your password or app password
        },
        tls: {
            ciphers: "TLSv1.2",
            rejectUnauthorized: false,
        },
    });

    // Verify transporter connection on startup
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ Email transporter verification failed:", error);
        } else {
            // console.log("✅ Email transporter ready to send messages.");
        }
    });
} catch (err) {
    console.error("❌ Error creating transporter:", err);
}

/**
 * Send email helper
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"LifeStyle Services" <info@goldskyer.com>',
            to,
            subject,
            html,
        });

        // console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};

module.exports = { sendEmail };
