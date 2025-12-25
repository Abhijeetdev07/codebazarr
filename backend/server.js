const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
// Connect to MongoDB
connectDB();

// Middleware (CORS)
const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    // In production, check against allowed origins
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Regular middleware for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "CodeBazar API Server",
    version: "1.0.0",
    status: "running",
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin/coupons', require('./routes/adminCoupons'));
app.use('/api/coupons', require('./routes/coupons'));

// Error handling middleware
app.use(require('./middleware/error'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});


// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const connectDB = require("./config/db");

// // Load environment variables
// dotenv.config();

// // Initialize express app
// const app = express();

// // Connect to MongoDB
// connectDB();

// // ======================
// // ✅ CORS CONFIG (FIXED)
// // ======================
// const allowedOrigins = [
//   process.env.CLIENT_URL,
//   process.env.ADMIN_URL,
//   'http://localhost:3000',
//   'http://10.44.143.251:3000'
// ].filter(Boolean);

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (Postman, curl, mobile apps)
//     if (!origin) return callback(null, true);

//     // Allow localhost & LAN IPs in development
//     if (process.env.NODE_ENV === 'development') {
//       if (
//         origin.includes('localhost') ||
//         origin.includes('10.44.143.251')
//       ) {
//         return callback(null, true);
//       }
//     }

//     // Allow production origins
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     console.error('❌ Blocked by CORS:', origin);
//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true
// }));

// // ======================
// // BODY PARSERS
// // ======================
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ======================
// // BASIC HEALTH ROUTE
// // ======================
// app.get("/", (req, res) => {
//   res.json({
//     message: "CodeBazar API Server",
//     version: "1.0.0",
//     status: "running",
//   });
// });

// // ======================
// // ROUTES
// // ======================
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/projects', require('./routes/projects'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/banners', require('./routes/banners'));
// app.use('/api/payment', require('./routes/payment'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/reviews', require('./routes/reviews'));
// app.use('/api/admin/coupons', require('./routes/adminCoupons'));
// app.use('/api/coupons', require('./routes/coupons'));

// // ======================
// // ERROR HANDLER
// // ======================
// app.use(require('./middleware/error'));

// // ======================
// // 404 HANDLER
// // ======================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   });
// });

// // ======================
// // SERVER START (FIXED)
// // ======================
// const PORT = process.env.PORT || 8080;

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(
//     `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
//   );
// });
