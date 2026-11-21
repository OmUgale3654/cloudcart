# CloudCart – REST API Reference

All requests originating outside the cluster pass through **API Gateway** on port `8080`.
The Gateway validates JWT tokens for protected endpoints and injects `X-User-Id`, `X-User-Email`, `X-User-Role`, and `X-Correlation-ID` headers downstream.

---

## 1. Authentication & Users (`user-service`)

### Register New User
- **Method / Path:** `POST /api/v1/auth/register`
- **Auth:** Public
- **Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0100",
  "address": "123 Market St",
  "city": "Seattle",
  "state": "WA",
  "postalCode": "98101",
  "country": "USA"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "email": "john.doe@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "role": "CUSTOMER"
  }
}
```

### User Login
- **Method / Path:** `POST /api/v1/auth/login`
- **Auth:** Public
- **Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

### Get Current User Profile
- **Method / Path:** `GET /api/v1/users/me`
- **Auth:** Bearer Token required

---

## 2. Products Catalog (`product-service`)

### Search & Filter Products
- **Method / Path:** `GET /api/v1/products`
- **Auth:** Public
- **Query Params:**
  - `keyword` (string): Text match on title or description
  - `categoryId` (long): Filter by category
  - `minPrice` (double) / `maxPrice` (double)
  - `page` (int, default 0), `size` (int, default 12), `sort` (string)
- **Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "sku": "PROD-KEYBOARD-01",
        "name": "CloudCart Apex Mechanical Keyboard",
        "description": "Tactile mechanical switches with RGB backlight.",
        "price": 129.99,
        "categoryId": 1,
        "categoryName": "Electronics",
        "availableStock": 45,
        "inStock": true
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 8,
    "totalPages": 1,
    "last": true
  }
}
```

---

## 3. Shopping Cart (`cart-service`)

### Get Current Cart
- **Method / Path:** `GET /api/v1/cart`
- **Auth:** Bearer Token

### Add Item to Cart
- **Method / Path:** `POST /api/v1/cart/items`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "sku": "PROD-KEYBOARD-01",
  "quantity": 2
}
```

### Update Item Quantity
- **Method / Path:** `PUT /api/v1/cart/items/{sku}`
- **Auth:** Bearer Token
- **Body:** `{ "quantity": 3 }`

### Remove Item from Cart
- **Method / Path:** `DELETE /api/v1/cart/items/{sku}`
- **Auth:** Bearer Token

---

## 4. Inventory Management (`inventory-service`)

### Check Stock Level
- **Method / Path:** `GET /api/v1/inventory/{sku}`
- **Auth:** Public / Internal

### Reserve Stock (Pessimistic Locking)
- **Method / Path:** `POST /api/v1/inventory/reserve`
- **Auth:** Internal (Feign)
- **Body:**
```json
{
  "orderReference": "ORD-20261121-ABCD",
  "items": [
    { "sku": "PROD-KEYBOARD-01", "quantity": 1 }
  ]
}
```

### Release Stock (Compensating Rollback)
- **Method / Path:** `POST /api/v1/inventory/release`
- **Auth:** Internal (Feign)

---

## 5. Simulated Payments (`payment-service`)

### Process Simulated Payment
- **Method / Path:** `POST /api/v1/payments/process`
- **Auth:** Internal (Feign)
- **Body:**
```json
{
  "orderNumber": "ORD-20261121-ABCD",
  "userId": 1,
  "amount": 129.99,
  "currency": "USD",
  "paymentMethod": "CREDIT_CARD",
  "paymentToken": "CARD_SUCCESS",
  "idempotencyKey": "idem-uuid-999"
}
```

### Test Card Tokens

| Token Value | Triggered Outcome |
|---|---|
| `CARD_SUCCESS` | Status `COMPLETED`, approved immediately with transaction reference |
| `CARD_DECLINED` | HTTP 400 `PaymentFailedException`, triggers Saga inventory release |
| `CARD_INSUFFICIENT_FUNDS` | HTTP 400 `PaymentFailedException`, triggers Saga inventory release |

---

## 6. Orders & Checkout (`order-service`)

### Execute Checkout Saga
- **Method / Path:** `POST /api/v1/orders/checkout`
- **Auth:** Bearer Token
- **Body:**
```json
{
  "shippingAddress": "123 Market St",
  "shippingCity": "Seattle",
  "shippingState": "WA",
  "shippingPostalCode": "98101",
  "shippingCountry": "USA",
  "paymentMethod": "CREDIT_CARD",
  "paymentToken": "CARD_SUCCESS"
}
```

### Cancel Order
- **Method / Path:** `POST /api/v1/orders/{orderNumber}/cancel`
- **Auth:** Bearer Token
