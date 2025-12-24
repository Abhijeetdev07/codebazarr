const Coupon = require('../models/Coupon');
const Project = require('../models/Project');
const crypto = require('crypto');

// --- Crypto Helpers ---
const SECRET = process.env.COUPON_SECRET;
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

if (!SECRET) {
  console.error("FATAL: COUPON_SECRET is not defined in environment variables.");
  // We don't crash here but functionality will fail if secret is missing
}

// 1. Deterministic Hash for Lookup (HMAC SHA-256)
// This allows us to find a coupon by code: findOne({ codeHash: hash(input) })
const hash = (text) => {
  return crypto.createHmac('sha256', SECRET)
    .update(text)
    .digest('hex');
};

// 2. Reversible Encryption for Admin Display (AES-256-CBC)
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Key must be 32 bytes for aes-256. We use the SECRET directly or hash it to ensure length.
  // Using sha256 of secret to get 32 bytes key
  const key = crypto.createHash('sha256').update(SECRET).digest();

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Store IV with the encrypted text, separated by colon
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');

    const key = crypto.createHash('sha256').update(SECRET).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return "ERROR_DECRYPTING";
  }
};


exports.createCoupon = async (req, res) => {
  try {
    const { code, percentOff, usageType } = req.body;

    const normalizedCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const normalizedPercentOff = Number(percentOff);
    const normalizedUsageType = typeof usageType === 'string' ? usageType.trim().toUpperCase() : undefined;

    const allowedPercentOff = [5, 10, 15, 50, 75, 90, 100];
    const allowedUsageTypes = ['UNLIMITED', 'ONCE_GLOBAL'];

    if (!normalizedCode || percentOff === undefined || percentOff === null || Number.isNaN(normalizedPercentOff)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coupon code and percentOff'
      });
    }

    if (!allowedPercentOff.includes(normalizedPercentOff)) {
      return res.status(400).json({
        success: false,
        message: `Invalid percentOff. Allowed: ${allowedPercentOff.join(', ')}`
      });
    }

    if (normalizedUsageType !== undefined && !allowedUsageTypes.includes(normalizedUsageType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid usageType. Allowed: ${allowedUsageTypes.join(', ')}`
      });
    }

    // Security: Hash and Encrypt
    const codeHash = hash(normalizedCode);
    const codeEncrypted = encrypt(normalizedCode);

    // Check for existing hash
    const existingCoupon = await Coupon.findOne({ codeHash });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create({
      codeHash,
      codeEncrypted,
      percentOff: normalizedPercentOff,
      ...(normalizedUsageType ? { usageType: normalizedUsageType } : {})
    });

    // Return the ORIGINAL code to the admin in the response so they can see it created
    const couponResponse = coupon.toObject();
    couponResponse.code = normalizedCode; // Inject literal code for immediate display
    delete couponResponse.codeHash;
    delete couponResponse.codeEncrypted;

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: couponResponse
    });
  } catch (error) {
    console.error('Error creating coupon:', error);

    return res.status(500).json({
      success: false,
      message: 'Error creating coupon',
      error: error.message
    });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, projectId } = req.body;

    if (!code || !projectId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide code and projectId'
      });
    }

    const couponCode = String(code).trim().toUpperCase();

    // Hash input to find match
    const hashedParams = hash(couponCode);

    // Lookup by Index (Hash)
    const coupon = await Coupon.findOne({ codeHash: hashedParams });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is inactive'
      });
    }

    if (coupon.usageType === 'ONCE_GLOBAL' && Number(coupon.usedCount || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has already been used'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!project.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This project is currently unavailable'
      });
    }

    const originalAmount = Number(project.price || 0);
    const percentOff = Number(coupon.percentOff || 0);
    const discountAmount = Math.round((originalAmount * percentOff) / 100);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return res.status(200).json({
      success: true,
      data: {
        percentOff,
        discountAmount,
        finalAmount,
        originalAmount,
        couponCode: couponCode // Return input code back
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error applying coupon',
      error: error.message
    });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    // Decrypt codes for admin display
    const decryptedCoupons = coupons.map(c => {
      const obj = c.toObject();
      obj.code = decrypt(c.codeEncrypted); // Decrypt on the fly
      // Clean up internal security fields
      // delete obj.codeHash; 
      // delete obj.codeEncrypted; 
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: decryptedCoupons.length,
      data: decryptedCoupons
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching coupons',
      error: error.message
    });
  }
};

exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save(); // Model has no pre-save hook now, so safe

    const obj = coupon.toObject();
    obj.code = decrypt(coupon.codeEncrypted);

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      data: obj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error toggling coupon status',
      error: error.message
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
};
