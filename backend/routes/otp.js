import express from 'express';
import Otp from '../../database/models/Otp.js';

const router = express.Router();

// Generate and "send" OTP
router.post('/send', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number required' });

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        // Invalidate old OTPs for this phone
        await Otp.deleteMany({ phone });

        await Otp.create({ phone, otp, expiresAt });

        // In a real app, use Twilio/Fast2SMS here.
        console.log(`\n🔑 [OTP] Sent ${otp} to ${phone}\n`);

        res.json({ message: 'OTP sent successfully', dev_hint: 'Check server console' });
    } catch (error) {
        console.error('OTP Send Error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/verify', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const record = await Otp.findOne({
            phone,
            otp,
            verified: false,
            expiresAt: { $gt: new Date() }
        });

        if (!record) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        record.verified = true;
        await record.save();

        res.json({ success: true, message: 'Phone verified' });
    } catch (error) {
        console.error('OTP Verify Error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

export default router;
