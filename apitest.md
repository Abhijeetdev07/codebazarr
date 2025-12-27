# API Testing Guide - Order Export Endpoints

This guide provides step-by-step instructions for testing the Order Export API endpoints using Postman.

## Prerequisites

1. **Backend Server Running**: Ensure your backend server is running on `http://localhost:8080`
2. **Admin Account**: You need admin credentials to test these endpoints
3. **Authentication Token**: You'll need a valid JWT token from an admin user

---

## Step 1: Get Admin Authentication Token

### Login as Admin

**Endpoint**: `POST http://localhost:8080/api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "email": "your-admin-email@example.com",
  "password": "your-admin-password"
}
```

**Expected Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Action**: Copy the `token` value from the response. You'll use this in all subsequent requests.

---

## Step 2: Test Export API Endpoints

For all export endpoints below, use these common headers:

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

Replace `YOUR_TOKEN_HERE` with the token you copied from Step 1.

---

### Test Case 1: Export All Orders (No Filters)

**Endpoint**: `GET http://localhost:8080/api/orders/export`

**Query Parameters**: None (or `status=all`)

**Expected Response**:
```json
{
  "success": true,
  "filters": {
    "filterType": null,
    "year": null,
    "month": null,
    "startDate": null,
    "endDate": null,
    "status": null
  },
  "summary": {
    "totalOrders": 25,
    "totalAmount": 125000,
    "completedOrders": 20,
    "pendingOrders": 3,
    "failedOrders": 2,
    "completedAmount": 100000
  },
  "count": 25,
  "data": [
    {
      "orderId": "65f1234567890abcdef12345",
      "orderIdShort": "ef12345",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "projectName": "E-commerce Website",
      "amount": 5000,
      "paymentMethod": "upi",
      "date": "2025-01-15T10:30:00.000Z",
      "status": "completed",
      "razorpayPaymentId": "pay_abc123",
      "razorpayOrderId": "order_xyz789"
    }
    // ... more orders
  ]
}
```

---

### Test Case 2: Export Yearly Orders (2025)

**Endpoint**: `GET http://localhost:8080/api/orders/export?filterType=yearly&year=2025&status=all`

**Query Parameters**:
- `filterType`: `yearly`
- `year`: `2025`
- `status`: `all`

**Expected Response**:
```json
{
  "success": true,
  "filters": {
    "filterType": "yearly",
    "year": "2025",
    "month": null,
    "startDate": null,
    "endDate": null,
    "status": "all"
  },
  "summary": {
    "totalOrders": 15,
    "totalAmount": 75000,
    "completedOrders": 12,
    "pendingOrders": 2,
    "failedOrders": 1,
    "completedAmount": 60000
  },
  "count": 15,
  "data": [...]
}
```

---

### Test Case 3: Export Monthly Orders (January 2025, Completed Only)

**Endpoint**: `GET http://localhost:8080/api/orders/export?filterType=monthly&year=2025&month=1&status=completed`

**Query Parameters**:
- `filterType`: `monthly`
- `year`: `2025`
- `month`: `1` (January)
- `status`: `completed`

**Expected Response**:
```json
{
  "success": true,
  "filters": {
    "filterType": "monthly",
    "year": "2025",
    "month": "1",
    "startDate": null,
    "endDate": null,
    "status": "completed"
  },
  "summary": {
    "totalOrders": 8,
    "totalAmount": 40000,
    "completedOrders": 8,
    "pendingOrders": 0,
    "failedOrders": 0,
    "completedAmount": 40000
  },
  "count": 8,
  "data": [...]
}
```

---

### Test Case 4: Export Date Range Orders (Pending Only)

**Endpoint**: `GET http://localhost:8080/api/orders/export?filterType=dateRange&startDate=2025-01-01&endDate=2025-01-31&status=pending`

**Query Parameters**:
- `filterType`: `dateRange`
- `startDate`: `2025-01-01`
- `endDate`: `2025-01-31`
- `status`: `pending`

**Expected Response**:
```json
{
  "success": true,
  "filters": {
    "filterType": "dateRange",
    "year": null,
    "month": null,
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    "status": "pending"
  },
  "summary": {
    "totalOrders": 3,
    "totalAmount": 15000,
    "completedOrders": 0,
    "pendingOrders": 3,
    "failedOrders": 0,
    "completedAmount": 0
  },
  "count": 3,
  "data": [...]
}
```

---

### Test Case 5: Export Failed Orders (All Time)

**Endpoint**: `GET http://localhost:8080/api/orders/export?status=failed`

**Query Parameters**:
- `status`: `failed`

**Expected Response**:
```json
{
  "success": true,
  "filters": {
    "filterType": null,
    "year": null,
    "month": null,
    "startDate": null,
    "endDate": null,
    "status": "failed"
  },
  "summary": {
    "totalOrders": 2,
    "totalAmount": 10000,
    "completedOrders": 0,
    "pendingOrders": 0,
    "failedOrders": 2,
    "completedAmount": 0
  },
  "count": 2,
  "data": [...]
}
```

---

## Common Error Responses

### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden (Not Admin)
```json
{
  "success": false,
  "message": "Not authorized as admin"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error exporting orders",
  "error": "Error details here"
}
```

---

## Payment Method Values

The `paymentMethod` field in the response can have these values:
- `upi` - UPI payments
- `card` - Credit/Debit card payments
- `netbanking` - Net banking
- `wallet` - Digital wallet payments
- `other` - Other payment methods or not captured

---

## Order Status Values

The `status` field can have these values:
- `completed` - Payment successful
- `pending` - Payment initiated but not completed
- `failed` - Payment failed

---

## Tips for Testing

1. **Create Test Data**: Before testing, ensure you have some orders in your database with different:
   - Dates (different months/years)
   - Statuses (completed, pending, failed)
   - Payment methods

2. **Use Postman Collections**: Save these requests in a Postman collection for easy reuse

3. **Environment Variables**: Set up Postman environment variables for:
   - `baseUrl`: `http://localhost:8080`
   - `adminToken`: Your admin JWT token

4. **Test Edge Cases**:
   - Empty results (date range with no orders)
   - Invalid date formats
   - Future dates
   - Invalid status values

---

## Quick Test Checklist

- [ ] Login as admin and get token
- [ ] Test export all orders
- [ ] Test yearly filter (current year)
- [ ] Test monthly filter (current month)
- [ ] Test date range filter
- [ ] Test status filter (completed)
- [ ] Test status filter (pending)
- [ ] Test status filter (failed)
- [ ] Test combined filters (monthly + completed)
- [ ] Verify payment method is captured correctly
- [ ] Verify summary calculations are correct

---

## Next Steps

Once you've verified the API is working correctly:
1. Proceed to Phase 2: Frontend implementation
2. Implement PDF generation using the export data
3. Add download/print functionality

---

**Need Help?**
- Check backend console logs for errors
- Verify MongoDB connection
- Ensure orders exist in the database
- Confirm admin user has correct role
