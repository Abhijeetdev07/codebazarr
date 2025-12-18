# CodeBazar Backend

Backend API server for CodeBazar - A personal e-commerce platform to showcase and sell coding projects.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **File Upload**: Multer

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB Atlas connection string
   - JWT secret key
   - Stripe API keys
   - Frontend URLs

## Running the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Folder Structure

```
backend/
├── config/         # Database and configuration files
├── models/         # MongoDB schemas
├── routes/         # API endpoints
├── controllers/    # Business logic
├── middleware/     # Authentication, validation, error handling
├── utils/          # Helper functions
├── uploads/        # Uploaded files (gitignored)
├── .env            # Environment variables (gitignored)
├── .env.example    # Example environment file
├── server.js       # Main entry point
└── package.json    # Dependencies and scripts
```

## API Endpoints (To be implemented)

- `/api/auth` - Authentication (register, login)
- `/api/projects` - Project management
- `/api/categories` - Category management
- `/api/banners` - Banner management
- `/api/payment` - Stripe payment integration
- `/api/orders` - Order management

## Environment Variables

See `.env.example` for required environment variables.
