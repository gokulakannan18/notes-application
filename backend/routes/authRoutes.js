const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const transporter = require("../config/mailer");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Registration failed"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        req.session.userId = user._id;

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Login failed"
        });
    }
});

router.get("/check", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    res.json({
        loggedIn: true,
        userId: req.session.userId
    });
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logout successful"
        });
    });
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.json({
                message: "If the account exists, a reset link has been sent to your email."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = `http://localhost:5000/reset-password.html?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Notes App" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Reset Your Notes App Password",
            text: `Hello ${user.name},

You requested to reset your password.

Click the link below to reset your password:
${resetLink}

This link expires in 15 minutes.

If you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested to reset your Notes App password.</p>
                    <p>Click the button below to create a new password.</p>

                    <a href="${resetLink}"
                       style="display:inline-block;padding:12px 20px;
                       background:#4f46e5;color:white;text-decoration:none;
                       border-radius:6px;">
                       Reset Password
                    </a>

                    <p>This link expires in 15 minutes.</p>
                    <p>If you did not request this, you can ignore this email.</p>
                </div>
            `
        });

        res.json({
            message: "If the account exists, a reset link has been sent to your email."
        });

    } catch (error) {
        console.log("Forgot password error:", error.message);

        res.status(500).json({
            message: "Unable to send reset email. Please try again later."
        });
    }
});
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset link"
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({
            message: "Password reset successful. Please login with your new password."
        });

    } catch (error) {
        res.status(500).json({
            message: "Password reset failed"
        });
    }
});

module.exports = router;
