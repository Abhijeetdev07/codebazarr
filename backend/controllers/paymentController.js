const Razorpay = require('razorpay');
const crypto = require('crypto');
const Project = require('../models/Project');
const Order = require('../models/Order');
const razorpay = require('../config/razorpay');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { projectId } = req.body;

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

    const options = {
      amount: Math.round(project.price * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        projectId: project._id.toString(),
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        currency: order.currency,
        amount: order.amount,
        keyId: process.env.RAZORPAY_KEY_ID,
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

    // Payment is valid, save order
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const order = await Order.create({
      userId: req.user._id,
      projectId: projectId,
      amount: project.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'completed'
    });

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
