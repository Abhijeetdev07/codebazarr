# CodeBazar - Project Marketplace Implementation Plan

A personal e-commerce platform to showcase and sell coding projects. Users can browse projects publicly but must login to purchase. Integrated with Stripe for payments.

## Technology Stack

### Frontend (Client)

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Location**: `c:\Users\ugale\Desktop\codebazar\client`

### Admin Panel

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **Location**: `c:\Users\ugale\Desktop\codebazar\admin`

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Payment**: Stripe Integration
- **Location**: `c:\Users\ugale\Desktop\codebazar\backend`

---

## Phase 1: Backend Development

### Step 1.1: Project Setup & Configuration

- [ ] Initialize Node.js project in `backend` folder
- [ ] Install core dependencies (express, mongoose, dotenv, cors, etc.)
- [ ] Create folder structure:
  - `config/` - Database and environment configuration
  - `models/` - MongoDB schemas
  - `routes/` - API endpoints
  - `controllers/` - Business logic
  - `middleware/` - Authentication, validation, error handling
  - `utils/` - Helper functions
- [ ] Setup `.env` file with:
  - MongoDB Atlas connection string
  - JWT secret
  - Stripe API keys
  - Port configuration
  - Frontend URLs for CORS

### Step 1.2: Database Models

- [ ] **User Model** (`models/User.js`)
  - Fields: name, email, password (hashed), role (user/admin), createdAt
  - Methods: password comparison, JWT generation
- [ ] **Project Model** (`models/Project.js`)
  - Fields: title, description, category, price, images[], demoUrl, sourceCodeUrl, technologies[], features[], isActive, createdAt, updatedAt
- [ ] **Category Model** (`models/Category.js`)
  - Fields: name, slug, description, icon, isActive
- [ ] **Order Model** (`models/Order.js`)
  - Fields: userId, projectId, amount, stripePaymentId, status (pending/completed/failed), purchaseDate
- [ ] **Banner Model** (`models/Banner.js`)
  - Fields: title, subtitle, image, link, order, isActive

### Step 1.3: Authentication & Authorization

- [ ] Implement user registration endpoint (`POST /api/auth/register`)
  - Email validation
  - Password hashing (bcrypt)
  - JWT token generation
- [ ] Implement login endpoint (`POST /api/auth/login`)
  - Credential verification
  - JWT token return
- [ ] Create authentication middleware (`middleware/auth.js`)
  - Verify JWT tokens
  - Attach user to request object
- [ ] Create admin authorization middleware (`middleware/admin.js`)
  - Check if user role is admin

### Step 1.4: Project Management APIs

- [ ] **GET /api/projects** - Get all active projects (public)
  - Pagination support
  - Category filtering
  - Search functionality
- [ ] **GET /api/projects/:id** - Get single project details (public)
- [ ] **POST /api/projects** - Create new project (admin only)
  - Image upload handling (multer)
  - Validation
- [ ] **PUT /api/projects/:id** - Update project (admin only)
- [ ] **DELETE /api/projects/:id** - Delete project (admin only)

### Step 1.5: Category Management APIs

- [ ] **GET /api/categories** - Get all active categories (public)
- [ ] **POST /api/categories** - Create category (admin only)
- [ ] **PUT /api/categories/:id** - Update category (admin only)
- [ ] **DELETE /api/categories/:id** - Delete category (admin only)

### Step 1.6: Banner Management APIs

- [ ] **GET /api/banners** - Get all active banners (public)
- [ ] **POST /api/banners** - Create banner (admin only)
  - Image upload handling
- [ ] **PUT /api/banners/:id** - Update banner (admin only)
- [ ] **DELETE /api/banners/:id** - Delete banner (admin only)

### Step 1.7: Stripe Payment Integration

- [ ] Install Stripe SDK (`stripe`)
- [ ] Create Stripe configuration (`config/stripe.js`)
- [ ] **POST /api/payment/create-checkout-session** - Create Stripe checkout session
  - Requires authentication
  - Create session with project details
  - Return session ID
- [ ] **POST /api/payment/webhook** - Handle Stripe webhooks
  - Verify webhook signature
  - Create order on successful payment
  - Update order status
- [ ] **GET /api/orders/my-orders** - Get user's purchased projects (authenticated)

### Step 1.8: File Upload Configuration

- [ ] Setup multer for image uploads
- [ ] Configure storage (local or cloud - AWS S3/Cloudinary)
- [ ] Create upload middleware
- [ ] Add image validation (file type, size)

### Step 1.9: Error Handling & Validation

- [ ] Create global error handler middleware
- [ ] Add request validation (express-validator)
- [ ] Setup proper HTTP status codes
- [ ] Create custom error classes

### Step 1.10: Testing & Documentation

- [ ] Test all API endpoints with Postman/Thunder Client
- [ ] Create API documentation
- [ ] Setup MongoDB Atlas database
- [ ] Deploy backend (optional: Render, Railway, or Vercel)

---

## Phase 2: Client Frontend Development

### Step 2.1: Project Setup

- [ ] Initialize Next.js project in `client` folder (`npx create-next-app@latest`)
- [ ] Install Tailwind CSS
- [ ] Install dependencies:
  - `axios` - API calls
  - `react-icons` - Icons
  - `swiper` - Banner slider
  - `@stripe/stripe-js` - Stripe integration
  - `next-auth` or custom auth - Authentication
  - `react-hot-toast` - Notifications

### Step 2.2: Project Structure

- [ ] Create folder structure:
  - `app/` - Next.js 13+ app directory
  - `components/` - Reusable components
  - `lib/` - Utilities and API functions
  - `context/` - React context (auth, cart)
  - `public/` - Static assets
  - `styles/` - Global styles

### Step 2.3: API Integration Setup

- [ ] Create axios instance (`lib/axios.js`)
  - Base URL configuration
  - Request/response interceptors
  - Token attachment
- [ ] Create API service functions (`lib/api.js`)
  - Auth APIs (login, register, logout)
  - Project APIs (getAll, getById)
  - Category APIs
  - Payment APIs

### Step 2.4: Authentication Context

- [ ] Create AuthContext (`context/AuthContext.js`)
  - User state management
  - Login/logout functions
  - Token storage (localStorage)
  - Protected route wrapper
- [ ] Create login page (`app/login/page.js`)
  - Form with email and password
  - Validation
  - Error handling
- [ ] Create register page (`app/register/page.js`)
  - Form with name, email, password
  - Validation

### Step 2.5: Layout Components

#### Top Navbar (`components/Navbar.js`)

- [ ] Logo/Brand name
- [ ] Navigation links (Home, Projects, Categories)
- [ ] Search bar (optional)
- [ ] User menu (Login/Register or Profile/Logout)
- [ ] Responsive mobile menu
- [ ] Sticky navbar with scroll effect

#### Footer (`components/Footer.js`)

- [ ] About section
- [ ] Quick links
- [ ] Social media icons
- [ ] Copyright information
- [ ] Contact information

### Step 2.6: Home Page Components

#### Hero Section with Auto Slider (`components/HeroSlider.js`)

- [ ] Integrate Swiper.js
- [ ] Auto-play configuration
- [ ] Fetch banners from API
- [ ] Responsive images
- [ ] Navigation dots/arrows
- [ ] Smooth transitions

#### Project Categories Section (`components/CategorySection.js`)

- [ ] Fetch categories from API
- [ ] Grid layout with category cards
- [ ] Category icons/images
- [ ] Click to filter projects by category
- [ ] Hover effects

#### Project Cards Section (`components/ProjectCard.js`)

- [ ] Grid layout (responsive: 1, 2, 3, 4 columns)
- [ ] Project image
- [ ] Title and short description
- [ ] Price display
- [ ] Technologies used (badges)
- [ ] "View Details" button
- [ ] Hover effects and animations

### Step 2.7: Home Page Assembly (`app/page.js`)

- [ ] Import and arrange all components:
  1. Navbar (sticky)
  2. Hero Slider
  3. Category Section
  4. Projects Grid
  5. Footer
- [ ] Fetch initial data (projects, categories, banners)
- [ ] Loading states
- [ ] Error handling

### Step 2.8: Project Details Page (`app/projects/[id]/page.js`)

- [ ] Fetch project by ID
- [ ] Image gallery/carousel
- [ ] Full description
- [ ] Features list
- [ ] Technologies used
- [ ] Demo link (if available)
- [ ] Price and "Buy Now" button
- [ ] Redirect to login if not authenticated

### Step 2.9: Projects Listing Page (`app/projects/page.js`)

- [ ] Display all projects
- [ ] Category filter sidebar/dropdown
- [ ] Search functionality
- [ ] Pagination or infinite scroll
- [ ] Sort options (price, date, name)

### Step 2.10: Stripe Checkout Integration

- [ ] Create checkout page (`app/checkout/page.js`)
- [ ] Call backend to create Stripe session
- [ ] Redirect to Stripe hosted checkout
- [ ] Success page (`app/checkout/success/page.js`)
- [ ] Cancel page (`app/checkout/cancel/page.js`)

### Step 2.11: User Dashboard (`app/dashboard/page.js`)

- [ ] Protected route (requires authentication)
- [ ] Display purchased projects
- [ ] Download links for source code
- [ ] Order history
- [ ] Profile information

### Step 2.12: Styling & Responsiveness

- [ ] Configure Tailwind theme (colors, fonts)
- [ ] Create custom utility classes
- [ ] Ensure mobile responsiveness for all pages
- [ ] Add loading skeletons
- [ ] Add animations and transitions
- [ ] Dark mode support (optional)

### Step 2.13: Testing & Optimization

- [ ] Test all user flows
- [ ] Test authentication
- [ ] Test payment flow (Stripe test mode)
- [ ] Optimize images (Next.js Image component)
- [ ] SEO optimization (metadata, titles)
- [ ] Performance optimization

---

## Phase 3: Admin Panel Development

### Step 3.1: Project Setup

- [ ] Initialize Next.js project in `admin` folder
- [ ] Install Tailwind CSS
- [ ] Install dependencies:
  - `axios` - API calls
  - `react-icons` - Icons
  - `react-hot-toast` - Notifications
  - `recharts` or `chart.js` - Analytics charts

### Step 3.2: Admin Authentication

- [ ] Create admin login page (`app/login/page.js`)
  - Only admin users can access
  - JWT token storage
- [ ] Create AuthContext for admin
- [ ] Protected route wrapper for all admin pages

### Step 3.3: Admin Layout (`components/AdminLayout.js`)

- [ ] Sidebar navigation
  - Dashboard
  - Projects
  - Categories
  - Banners
  - Orders
  - Users (optional)
  - Settings
- [ ] Top header with admin info and logout
- [ ] Responsive sidebar (collapsible on mobile)

### Step 3.4: Dashboard Page (`app/dashboard/page.js`)

- [ ] Statistics cards:
  - Total projects
  - Total orders
  - Total revenue
  - Active users
- [ ] Recent orders table
- [ ] Revenue chart (monthly/weekly)
- [ ] Popular projects list

### Step 3.5: Projects Management

#### Projects List (`app/projects/page.js`)

- [ ] Table view of all projects
- [ ] Search and filter
- [ ] Edit and delete actions
- [ ] Toggle active/inactive status
- [ ] "Add New Project" button

#### Add Project (`app/projects/add/page.js`)

- [ ] Form with fields:
  - Title
  - Description (rich text editor optional)
  - Category (dropdown)
  - Price
  - Images (multiple upload)
  - Demo URL
  - Source code URL
  - Technologies (tags input)
  - Features (dynamic list)
- [ ] Form validation
- [ ] Image preview
- [ ] Submit to backend API

#### Edit Project (`app/projects/edit/[id]/page.js`)

- [ ] Pre-fill form with existing data
- [ ] Update functionality
- [ ] Image replacement

### Step 3.6: Category Management

#### Categories List (`app/categories/page.js`)

- [ ] Table view of all categories
- [ ] Add, edit, delete actions
- [ ] Toggle active/inactive

#### Add/Edit Category Modal or Page

- [ ] Form with name, slug, description, icon
- [ ] Validation

### Step 3.7: Banner Management

#### Banners List (`app/banners/page.js`)

- [ ] List of all banners
- [ ] Reorder banners (drag-drop optional)
- [ ] Add, edit, delete actions

#### Add/Edit Banner

- [ ] Form with title, subtitle, image, link
- [ ] Image upload and preview
- [ ] Order number

### Step 3.8: Orders Management (`app/orders/page.js`)

- [ ] Table view of all orders
- [ ] Filter by status, date
- [ ] View order details
- [ ] Export to CSV (optional)

### Step 3.9: Styling & Responsiveness

- [ ] Professional admin theme
- [ ] Consistent color scheme
- [ ] Responsive tables
- [ ] Loading states
- [ ] Success/error notifications

### Step 3.10: Testing

- [ ] Test all CRUD operations
- [ ] Test file uploads
- [ ] Test authentication and authorization
- [ ] Verify API integration

---

## Phase 4: Integration & Deployment

### Step 4.1: Environment Configuration

- [ ] Setup `.env` files for all three folders
- [ ] Configure CORS properly
- [ ] Setup environment-specific URLs (dev/prod)

### Step 4.2: End-to-End Testing

- [ ] Test complete user journey (browse → login → purchase)
- [ ] Test admin operations
- [ ] Test Stripe payment flow (test mode)
- [ ] Test error scenarios

### Step 4.3: Deployment Preparation

- [ ] Build production bundles
- [ ] Optimize assets
- [ ] Setup MongoDB Atlas production database
- [ ] Configure Stripe production keys

### Step 4.4: Deployment

- [ ] Deploy backend (Render, Railway, Vercel, etc.)
- [ ] Deploy client frontend (Vercel, Netlify)
- [ ] Deploy admin panel (Vercel, Netlify)
- [ ] Configure custom domains (optional)
- [ ] Setup SSL certificates

### Step 4.5: Post-Deployment

- [ ] Monitor error logs
- [ ] Test production environment
- [ ] Setup analytics (Google Analytics optional)
- [ ] Create backup strategy for database

---

## Additional Features (Optional Enhancements)

- [ ] Email notifications (order confirmation, welcome email)
- [ ] Reviews and ratings for projects
- [ ] Wishlist functionality
- [ ] Discount codes/coupons
- [ ] Blog section for tutorials
- [ ] Newsletter subscription
- [ ] Social sharing buttons
- [ ] Advanced search with filters
- [ ] Project recommendations
- [ ] Admin analytics dashboard with detailed insights

---

## Security Considerations

- [ ] Input validation on all forms
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting on APIs
- [ ] Secure password storage (bcrypt)
- [ ] JWT token expiration
- [ ] HTTPS enforcement
- [ ] Environment variables security
- [ ] File upload validation

---

## Notes

> [!IMPORTANT]
>
> - Start with backend development to establish API contracts
> - Use Stripe test mode during development
> - Keep API keys and secrets secure in `.env` files
> - Test payment flow thoroughly before going live
> - Ensure proper error handling throughout the application

> [!TIP]
>
> - Use MongoDB Compass for database visualization during development
> - Use Postman/Thunder Client to test APIs before frontend integration
> - Implement loading states and error boundaries for better UX
> - Use Next.js Image component for automatic image optimization
> - Consider using React Hook Form for complex forms in admin panel

Phase 2: Client Frontend Development
Step 2.1: Project Setup
Initialize Next.js project in client folder (npx create-next-app@latest . --typescript)
Install Tailwind CSS
Install dependencies:
axios - API calls
react-icons - Icons
swiper - Banner slider
react-razorpay or use window.Razorpay - Razorpay integration
next-auth or custom auth - Authentication
react-hot-toast - Notifications
Step 2.2: Project Structure
Create folder structure:
app/ - Next.js 13+ app directory
components/ - Reusable components
lib/ - Utilities and API functions
context/ - React context (auth, cart)
public/ - Static assets
styles/ - Global styles
Step 2.3: API Integration Setup
Create axios instance (lib/axios.ts)
Base URL configuration
Request/response interceptors
Token attachment
Create API service functions (lib/api.ts)
Auth APIs (login, register, logout)
Project APIs (getAll, getById)
Category APIs
Payment APIs (createOrder, verifyPayment)
Step 2.4: Authentication Context
Create AuthContext (context/AuthContext.tsx)
User state management
Login/logout functions
Token storage (localStorage)
Protected route wrapper
Create login page (app/login/page.tsx)
Form with email and password
Validation
Error handling
Create register page (app/register/page.tsx)
Form with name, email, password
Validation
Step 2.5: Layout Components
Top Navbar (components/Navbar.tsx)
Logo/Brand name
Navigation links (Home, Projects, Categories)
Search bar (optional)
User menu (Login/Register or Profile/Logout)
Responsive mobile menu
Sticky navbar with scroll effect
Footer (components/Footer.tsx)
About section
Quick links
Social media icons
Copyright information
Contact information
Step 2.6: Home Page Components
Hero Section with Auto Slider (components/HeroSlider.tsx)
Integrate Swiper.js
Auto-play configuration
Fetch banners from API
Responsive images
Navigation dots/arrows
Smooth transitions
Project Categories Section (components/CategorySection.tsx)
Fetch categories from API
Grid layout with category cards
Category icons/images
Click to filter projects by category
Hover effects
Project Cards Section (components/ProjectCard.tsx)
Grid layout (responsive: 1, 2, 3, 4 columns)
Project image
Title and short description
Price display
Technologies used (badges)
"View Details" button
Hover effects and animations
Step 2.7: Home Page Assembly (app/page.tsx)
Import and arrange all components:
Navbar (sticky)
Hero Slider
Category Section
Projects Grid
Footer
Fetch initial data (projects, categories, banners)
Loading states
Error handling
Step 2.8: Project Details Page (app/projects/[id]/page.tsx)
Fetch project by ID
Image gallery/carousel
Full description
Features list
Technologies used
Demo link (if available)
Price and "Buy Now" button
Redirect to login if not authenticated
Step 2.9: Projects Listing Page (app/projects/page.tsx)
Display all projects
Category filter sidebar/dropdown
Search functionality
Pagination or infinite scroll
Sort options (price, date, name)
Step 2.10: Razorpay Payment Integration
Create payment handler component
Load Razorpay script
Implement handlePayment function:
Call backend to create order
Open Razorpay modal options
Handle handler callback on success
Call backend to verify payment
Success/Error notifications
Step 2.11: User Dashboard (app/dashboard/page.tsx)
Protected route (requires authentication)
Display purchased projects
Download links for source code
Order history
Profile information
Step 2.12: Styling & Responsiveness
Configure Tailwind theme (colors, fonts)
Create custom utility classes
Ensure mobile responsiveness for all pages
Add loading skeletons
Add animations and transitions
Dark mode support (optional)
Step 2.13: Testing & Optimization
Test all user flows
Test authentication
Test payment flow (Razorpay Test Mode)
Optimize images (Next.js Image component)
SEO optimization (metadata, titles)
Performance optimization
Phase 3: Admin Panel Development
Step 3.1: Project Setup
Initialize Next.js project in admin folder (--typescript)
Install Tailwind CSS
Install dependencies:
axios - API calls
react-icons - Icons
react-hot-toast - Notifications
recharts or chart.js - Analytics charts
Step 3.2: Admin Authentication
Create admin login page (app/login/page.tsx)
Only admin users can access
JWT token storage
Create AuthContext for admin
Protected route wrapper for all admin pages
Step 3.3: Admin Layout (components/AdminLayout.tsx)
Sidebar navigation
Dashboard
Projects
Categories
Banners
Orders
Users (optional)
Settings
Top header with admin info and logout
Responsive sidebar (collapsible on mobile)
Step 3.4: Dashboard Page (app/dashboard/page.tsx)
Statistics cards:
Total projects
Total orders
Total revenue
Active users
Recent orders table
Revenue chart (monthly/weekly)
Popular projects list
Step 3.5: Projects Management
Projects List (app/projects/page.tsx)
Table view of all projects
Search and filter
Edit and delete actions
Toggle active/inactive status
"Add New Project" button
Add Project (app/projects/add/page.tsx)
Form with fields:
Title
Description (rich text editor optional)
Category (dropdown)
Price
Images (multiple upload)
Demo URL
Source code URL
Technologies (tags input)
Features (dynamic list)
Form validation
Image preview
Submit to backend API
Edit Project (app/projects/edit/[id]/page.tsx)
Pre-fill form with existing data
Update functionality
Image replacement
Step 3.6: Category Management
Categories List (app/categories/page.tsx)
Table view of all categories
Add, edit, delete actions
Toggle active/inactive
Add/Edit Category Modal or Page
Form with name, slug, description, icon
Validation
Step 3.7: Banner Management
Banners List (app/banners/page.tsx)
List of all banners
Reorder banners (drag-drop optional)
Add, edit, delete actions
Add/Edit Banner
Form with title, subtitle, image, link
Image upload and preview
Order number
Step 3.8: Orders Management (app/orders/page.tsx)
Table view of all orders
Filter by status, date
View order details
Export to CSV (optional)
Step 3.9: Styling & Responsiveness
Professional admin theme
Consistent color scheme
Responsive tables
Loading states
Success/error notifications
Step 3.10: Testing
Test all CRUD operations
Test file uploads
Test authentication and authorization
Verify API integration
Phase 4: Integration & Deployment
Step 4.1: Environment Configuration
Setup .env files for all three folders
Configure CORS properly
Setup environment-specific URLs (dev/prod)
Step 4.2: End-to-End Testing
Test complete user journey (browse → login → purchase)
Test admin operations
Test Razorpay payment flow (test mode)
Test error scenarios
Step 4.3: Deployment Preparation
Build production bundles
Optimize assets
Setup MongoDB Atlas production database
Configure Razorpay production keys
Step 4.4: Deployment
Deploy backend (Render, Railway, Vercel, etc.)
Deploy client frontend (Vercel, Netlify)
Deploy admin panel (Vercel, Netlify)
Configure custom domains (optional)
Setup SSL certificates
Step 4.5: Post-Deployment
Monitor error logs
Test production environment
Setup analytics (Google Analytics optional)
Create backup strategy for database
Additional Features (Optional Enhancements)
Email notifications (order confirmation, welcome email)
Reviews and ratings for projects
Wishlist functionality
Discount codes/coupons
Blog section for tutorials
Newsletter subscription
Social sharing buttons
Advanced search with filters
Project recommendations
Admin analytics dashboard with detailed insights
Security Considerations
Input validation on all forms
SQL injection prevention (using Mongoose)
XSS protection
CSRF protection
Rate limiting on APIs
Secure password storage (bcrypt)
JWT token expiration
HTTPS enforcement
Environment variables security
File upload validation
Notes
IMPORTANT

Start with backend development to establish API contracts
Use Razorpay test mode during development
Keep API keys and secrets secure in .env files
Test payment flow thoroughly before going live
Ensure proper error handling throughout the application
TIP

Use MongoDB Compass for database visualization during development
Use Postman/Thunder Client to test APIs before frontend integration
Implement loading states and error boundaries for better UX
Use Next.js Image component for automatic image optimization
Consider using React Hook Form for complex forms in admin panel
