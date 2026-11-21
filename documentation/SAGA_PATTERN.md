# CloudCart – Distributed Saga Checkout Flow

The checkout workflow coordinates multiple microservices to guarantee transactional consistency across network and database boundaries without blocking two-phase commits (2PC).

## 1. Sequence Diagram: Happy Path Checkout

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as Angular Storefront
    participant Gateway as API Gateway
    participant OrderSvc as Order Service (Orchestrator)
    participant CartSvc as Cart Service
    participant InvSvc as Inventory Service
    participant PaySvc as Payment Service
    participant NotifSvc as Notification Service

    Customer->>Frontend: Click "Place Order"
    Frontend->>Gateway: POST /api/v1/orders/checkout (JWT + Address + Payment Token)
    Gateway->>OrderSvc: Forward with X-User-Id, X-User-Email
    
    OrderSvc->>CartSvc: 1. GET /api/v1/cart (Validate non-empty & fetch items)
    CartSvc-->>OrderSvc: Return Cart with Subtotal & Items
    
    OrderSvc->>OrderSvc: 2. Persist Order entity (Status: PENDING)
    
    OrderSvc->>InvSvc: 3. POST /api/v1/inventory/reserve (Lock & reserve stock)
    InvSvc-->>OrderSvc: Stock Reserved Successfully (HTTP 200)
    
    OrderSvc->>PaySvc: 4. POST /api/v1/payments/process (Simulated Charge)
    PaySvc-->>OrderSvc: Payment COMPLETED (Transaction ID: TX-xxx)
    
    OrderSvc->>InvSvc: 5. POST /api/v1/inventory/confirm (Deduct stock permanently)
    InvSvc-->>OrderSvc: Stock Confirmed
    
    OrderSvc->>CartSvc: 6. DELETE /api/v1/cart (Clear customer's cart)
    CartSvc-->>OrderSvc: Cart Cleared
    
    OrderSvc->>OrderSvc: 7. Update Order status: CONFIRMED
    
    OrderSvc->>NotifSvc: 8. POST /api/v1/notifications/send (Order Confirmation Email)
    NotifSvc-->>OrderSvc: Notification Dispatched
    
    OrderSvc-->>Gateway: HTTP 200: OrderResponseDTO
    Gateway-->>Frontend: Display Order Success Page
```

---

## 2. Sequence Diagram: Payment Failure & Compensating Rollback

When a payment fails (e.g. `CARD_DECLINED` or `CARD_INSUFFICIENT_FUNDS`), the orchestrator triggers immediate compensation to release reserved inventory.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Gateway as API Gateway
    participant OrderSvc as Order Service (Orchestrator)
    participant InvSvc as Inventory Service
    participant PaySvc as Payment Service

    Gateway->>OrderSvc: POST /api/v1/orders/checkout
    OrderSvc->>InvSvc: 1. Reserve Stock
    InvSvc-->>OrderSvc: Stock Reserved
    
    OrderSvc->>PaySvc: 2. POST /api/v1/payments/process (Declined Card Token)
    PaySvc-->>OrderSvc: Payment FAILED (HTTP 400: Card Declined)
    
    Note over OrderSvc,InvSvc: INITIATE SAGA COMPENSATING ROLLBACK
    OrderSvc->>InvSvc: 3. POST /api/v1/inventory/release (Compensate stock reservation)
    InvSvc-->>OrderSvc: Reserved Stock Released back to Available
    
    OrderSvc->>OrderSvc: 4. Mark Order status: FAILED
    OrderSvc-->>Gateway: HTTP 400: PaymentFailedException
    Gateway-->>Customer: Display Payment Declined error & retain items in cart
```

---

## 3. Order Status State Machine

```
      [ Cart Active ]
             │ (Checkout Started)
             ▼
        [ PENDING ] ──────(Stock Unavailable)─────► [ CANCELLED ]
             │
             │ (Stock Reserved)
             ▼
     [ PAYMENT_PENDING ] ─(Payment Declined)─────► [ FAILED ]
             │                                    (Compensate: Release Stock)
             │ (Payment Success)
             ▼
       [ CONFIRMED ] ─────(User Cancels)─────────► [ CANCELLED ]
             │                                    (Compensate: Release Stock + Refund)
             │
             ▼
       [ PROCESSING ]
             │
             ▼
        [ SHIPPED ]
             │
             ▼
       [ DELIVERED ]
```
