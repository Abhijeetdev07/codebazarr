const Razorpay = require('razorpay');
const crypto = require('crypto');
const Project = require('../models/Project');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const razorpay = require('../config/razorpay');

const SECRET = process.env.COUPON_SECRET;

const hash = (text) => {
  return crypto.createHmac('sha256', SECRET)
    .update(text)
    .digest('hex');
};

// Helper function to extract payment method from Razorpay payment details
const getPaymentMethod = async (paymentId) => {
  if (!paymentId) return 'other';

  try {
    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    // Map Razorpay method to our enum or return raw if it's new
    const method = payment.method?.toLowerCase();

    // List of known methods we explicitly handle (others will just fall through if within enum)
    const knownMethods = ['upi', 'card', 'netbanking', 'wallet', 'emi', 'bank_transfer', 'paylater'];

    if (method && knownMethods.includes(method)) {
      return method;
    }

    return method || 'other';
  } catch (error) {
    console.error('Error fetching payment method from Razorpay:', error.message);
    return 'other';
  }
};

async function consumeCouponAfterSuccess(couponIdOrDoc) {
  if (!couponIdOrDoc) return { success: true };

  const coupon = typeof couponIdOrDoc === 'object' && couponIdOrDoc._id
    ? couponIdOrDoc
    : await Coupon.findById(couponIdOrDoc);

  if (!coupon) return { success: true };

  if (coupon.usageType === 'ONCE_GLOBAL') {
    const updated = await Coupon.findOneAndUpdate(
      { _id: coupon._id, isActive: true, usedCount: 0 },
      { $set: { isActive: false, usedCount: 1, consumedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: 'Coupon has already been used' };
    }

    return { success: true };
  }

  await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  return { success: true };
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { projectId, couponCode } = req.body;

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

    // Check if user already bought it
    const alreadyPurchased = await Order.hasUserPurchased(req.user._id, projectId);
    if (alreadyPurchased) {
      return res.status(400).json({
        success: false,
        message: 'You have already purchased this project'
      });
    }

    const originalAmount = Number(project.price || 0);
    let appliedCoupon = null;
    let percentOff = 0;
    let discountAmount = 0;
    let finalAmount = originalAmount;
    let normalizedCode = null;

    if (couponCode) {
      normalizedCode = String(couponCode).trim().toUpperCase();
      const codeHash = hash(normalizedCode);

      // Find by HASH
      const coupon = await Coupon.findOne({ codeHash });

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

      appliedCoupon = coupon;
      percentOff = Number(coupon.percentOff || 0);
      discountAmount = Math.round((originalAmount * percentOff) / 100);
      finalAmount = Math.max(0, originalAmount - discountAmount);
    }

    if (finalAmount <= 0) {
      const freeOrder = await Order.create({
        userId: req.user._id,
        projectId: projectId,
        amount: 0,
        originalAmount,
        discountAmount,
        finalAmount: 0,
        couponId: appliedCoupon ? appliedCoupon._id : null,
        couponCode: appliedCoupon ? normalizedCode : null, // Use input code
        paymentProvider: 'razorpay',
        paymentMethod: 'free',
        status: 'completed'
      });

      if (appliedCoupon) {
        const consumeResult = await consumeCouponAfterSuccess(appliedCoupon);
        if (!consumeResult.success) {
          await Order.findByIdAndDelete(freeOrder._id);
          return res.status(400).json({
            success: false,
            message: consumeResult.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          freePurchase: true,
          dbOrderId: freeOrder._id,
          pricing: {
            originalAmount,
            discountAmount,
            finalAmount: 0,
            ...(appliedCoupon ? { couponCode: normalizedCode, percentOff } : {})
          },
          project: {
            title: project.title,
            description: project.description,
            image: project.images[0]
          }
        }
      });
    }

    const options = {
      amount: Math.round(finalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        projectId: project._id.toString(),
        userId: req.user._id.toString(),
        ...(appliedCoupon ? { couponCode: normalizedCode, percentOff: String(percentOff) } : {})
      }
    };

    const order = await razorpay.orders.create(options);

    // Create a pending order in DB so admin can see pending/failed payments
    // If the same Razorpay order is retried, avoid duplicate DB records.
    const existingDbOrder = await Order.findOne({ razorpayOrderId: order.id });
    const dbOrder = existingDbOrder
      ? existingDbOrder
      : await Order.create({
        userId: req.user._id,
        projectId: projectId,
        amount: finalAmount,
        originalAmount,
        discountAmount,
        finalAmount,
        couponId: appliedCoupon ? appliedCoupon._id : null,
        couponCode: appliedCoupon ? normalizedCode : null, // Use input code
        paymentProvider: 'razorpay',
        razorpayOrderId: order.id,
        status: 'pending'
      });

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        dbOrderId: dbOrder._id,
        currency: order.currency,
        amount: order.amount,
        keyId: process.env.RAZORPAY_KEY_ID,
        pricing: {
          originalAmount,
          discountAmount,
          finalAmount,
          ...(appliedCoupon ? { couponCode: normalizedCode, percentOff } : {})
        },
        project: {
          title: project.title,
          description: project.description,
          image: project.images[0]
        }
      }
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message
    });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      projectId
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update existing pending order (preferred) else create completed order
    let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (order && order.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: order
      });
    }

    if (order && order.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already marked as failed'
      });
    }

    if (!order) {
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      order = new Order({
        userId: req.user._id,
        projectId: projectId,
        amount: Number(project.price || 0),
        originalAmount: Number(project.price || 0),
        discountAmount: 0,
        finalAmount: Number(project.price || 0),
        paymentProvider: 'razorpay',
        razorpayOrderId: razorpay_order_id
      });
    }

    order.userId = req.user._id;
    order.projectId = projectId;
    // Preserve the discounted amount captured during create-order
    // (Do NOT overwrite with project's current price)
    order.amount = Number(order.finalAmount ?? order.amount ?? 0);
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.status = 'completed';

    // Fetch and store payment method
    const paymentMethod = await getPaymentMethod(razorpay_payment_id);
    order.paymentMethod = paymentMethod;

    await order.save();

    if (order.couponId) {
      const consumeResult = await consumeCouponAfterSuccess(order.couponId);
      if (!consumeResult.success) {
        order.status = 'failed';
        await order.save();
        return res.status(400).json({
          success: false,
          message: consumeResult.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
};

// @desc    Mark Razorpay payment as failed
// @route   POST /api/payment/failed
// @access  Private
exports.markPaymentFailed = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      projectId
    } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'razorpay_order_id is required'
      });
    }

    const update = {
      status: 'failed',
      ...(razorpay_payment_id ? { razorpayPaymentId: razorpay_payment_id } : {})
    };

    let order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    // If we somehow do not have a pending DB order, create a failed one.
    if (!order) {
      // Prefer provided projectId, otherwise leave it undefined (but schema requires it)
      // So only allow create when projectId exists.
      if (!projectId) {
        return res.status(404).json({
          success: false,
          message: 'Order not found for this razorpay_order_id'
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      // Fetch payment method if payment ID is available
      const paymentMethod = razorpay_payment_id ? await getPaymentMethod(razorpay_payment_id) : 'other';

      order = await Order.create({
        userId: req.user._id,
        projectId,
        amount: project.price,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod,
        status: 'failed'
      });
    } else {
      // Fetch payment method if payment ID is available
      if (razorpay_payment_id && !order.paymentMethod) {
        const paymentMethod = await getPaymentMethod(razorpay_payment_id);
        update.paymentMethod = paymentMethod;
      }

      order = await Order.findByIdAndUpdate(order._id, update, { new: true });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment marked as failed',
      data: order
    });
  } catch (error) {
    console.error('Mark payment failed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking payment as failed',
      error: error.message
    });
  }
};
