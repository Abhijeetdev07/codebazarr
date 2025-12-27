const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        codeHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        codeEncrypted: {
            type: String,
            required: true,
        },
        percentOff: {
            type: Number,
            required: true,
            min: 1,
            max: 100,
        },
        scope: {
            type: String,
            required: true,
            enum: ['ALL'],
            default: 'ALL',
        },
        usageType: {
            type: String,
            required: true,
            enum: ['UNLIMITED', 'ONCE_GLOBAL'],
            default: 'UNLIMITED',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        consumedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    }
);
// Removed pre-save hook as hashing/encryption is handled in controller

module.exports = mongoose.model('Coupon', couponSchema);
