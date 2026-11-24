import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cart } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <!-- Myntra Stepper Header Bar -->
      <div class="checkout-stepper-bar">
        <div class="container stepper-container">
          <div class="step-item active">
            <span class="step-num">1</span>
            <span class="step-text">BAG</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <span class="step-num">2</span>
            <span class="step-text">ADDRESS</span>
          </div>
          <div class="step-line"></div>
          <div class="step-item">
            <span class="step-num">3</span>
            <span class="step-text">PAYMENT</span>
          </div>
        </div>
      </div>

      <div class="container py-8">
        <div *ngIf="cart && cart.items.length > 0; else emptyCartTemplate" class="myntra-cart-layout">
          <!-- Left: Items in Bag -->
          <div class="bag-items-col">
            <!-- Offer Banner -->
            <div class="cart-offer-alert card p-4 mb-4">
              <span class="offer-icon">⚡</span>
              <div>
                <strong>Available Offer</strong>
                <p>Flat ₹500 off on first order. Use coupon code <strong>CLOUDCART500</strong></p>
              </div>
            </div>

            <!-- Bag Header -->
            <div class="bag-card card">
              <div class="bag-header">
                <span class="bag-title">ITEMS IN BAG ({{ cart.totalItems }})</span>
                <button (click)="clearCart()" class="clear-bag-btn">Clear Bag</button>
              </div>

              <!-- Item List -->
              <div class="bag-item-list">
                <div *ngFor="let item of cart.items" class="bag-item-row">
                  <img [src]="item.imageUrl" [alt]="item.productName" class="bag-item-img" />

                  <div class="bag-item-details">
                    <span class="item-sku">SKU: {{ item.sku }}</span>
                    <h3 class="item-name">{{ item.productName }}</h3>
                    <span class="item-price-unit">₹{{ item.unitPrice | number:'1.2-2' }} each</span>

                    <!-- Return Policy Tag -->
                    <div class="return-tag">
                      <span class="icon">🔄</span> <strong>14 days</strong> return available
                    </div>

                    <!-- Quantity Stepper & Subtotal -->
                    <div class="item-actions-row mt-3">
                      <div class="qty-control-pill">
                        <button (click)="updateQuantity(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                        <span class="qty-num">{{ item.quantity }}</span>
                        <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                      </div>

                      <div class="item-subtotal-price">
                        <span>Total:</span>
                        <strong>₹{{ item.subtotal | number:'1.2-2' }}</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Delete Item Button -->
                  <button (click)="removeItem(item.id)" class="remove-btn" title="Remove from bag">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Price Details & Coupon Sidebar -->
          <aside class="price-details-col">
            <!-- Coupon Code Card -->
            <div class="card p-4 mb-4 coupon-card">
              <span class="coupon-title">COUPONS & OFFERS</span>
              <div class="coupon-input-row mt-2">
                <input
                  type="text"
                  [(ngModel)]="couponCode"
                  placeholder="Enter Coupon Code"
                  class="form-control coupon-input"
                  [disabled]="couponApplied"
                />
                <button
                  (click)="applyCoupon()"
                  [disabled]="couponApplied"
                  class="btn btn-sm btn-outline-primary"
                >
                  {{ couponApplied ? 'APPLIED' : 'APPLY' }}
                </button>
              </div>
              <div *ngIf="couponApplied" class="coupon-success mt-2">
                ✓ Coupon <strong>CLOUDCART500</strong> applied! ₹500 saved.
              </div>
            </div>

            <!-- Price Breakdown Summary -->
            <div class="card p-5 summary-card">
              <h3 class="price-details-title">PRICE DETAILS ({{ cart.totalItems }} Items)</h3>

              <div class="price-rows">
                <div class="price-row">
                  <span>Total MRP</span>
                  <span>₹{{ getEstimatedMrp() | number:'1.2-2' }}</span>
                </div>
                <div class="price-row text-success">
                  <span>Discount on MRP</span>
                  <span>-₹{{ (getEstimatedMrp() - cart.totalAmount) | number:'1.2-2' }}</span>
                </div>
                <div class="price-row text-success" *ngIf="couponApplied">
                  <span>Coupon Discount</span>
                  <span>-₹500.00</span>
                </div>
                <div class="price-row">
                  <span>Estimated GST (18%)</span>
                  <span>₹{{ getEstimatedTax() | number:'1.2-2' }}</span>
                </div>
                <div class="price-row">
                  <span>Shipping Fee</span>
                  <span *ngIf="getShippingCost() === 0" class="text-success font-bold">FREE</span>
                  <span *ngIf="getShippingCost() > 0">₹{{ getShippingCost() | number:'1.2-2' }}</span>
                </div>

                <div class="free-shipping-progress" *ngIf="cart.totalAmount < 999">
                  Add <strong>₹{{ (999 - cart.totalAmount) | number:'1.2-2' }}</strong> more to qualify for FREE Shipping!
                </div>

                <div class="summary-divider"></div>

                <div class="price-row total-row">
                  <span>Total Amount</span>
                  <span class="grand-total">₹{{ getFinalTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Green Savings Banner -->
              <div class="savings-alert mt-4">
                You will save <strong>₹{{ (getEstimatedMrp() - cart.totalAmount + (couponApplied ? 500 : 0)) | number:'1.2-2' }}</strong> on this order
              </div>

              <!-- Place Order Primary Button -->
              <button (click)="proceedToCheckout()" class="btn btn-primary btn-lg w-full place-order-btn mt-5">
                PLACE ORDER →
              </button>
            </div>
          </aside>
        </div>

        <!-- Empty Cart State -->
        <ng-template #emptyCartTemplate>
          <div class="empty-bag-card card text-center p-8">
            <div class="empty-bag-art">🛍️</div>
            <h2 class="empty-bag-title">Hey, your bag feels so light!</h2>
            <p class="empty-bag-sub">There is nothing in your bag. Let's add some items from our catalog.</p>
            <a routerLink="/products" class="btn btn-primary btn-lg mt-6">
              EXPLORE PRODUCTS CATALOG
            </a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }

    /* Myntra Checkout Stepper */
    .checkout-stepper-bar {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 14px 0;
    }

    .stepper-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      max-width: 500px;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
    }

    .step-item.active {
      color: var(--primary);
    }

    .step-num {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid currentColor;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }

    .step-item.active .step-num {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .step-line {
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }

    .py-8 {
      padding: 2rem 0 4rem;
    }

    .myntra-cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    /* Offer Alert */
    .cart-offer-alert {
      background: #fff8fa;
      border: 1px solid #ffd1dc;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: var(--radius-sm);
    }

    .offer-icon {
      font-size: 1.5rem;
    }

    .cart-offer-alert strong {
      color: var(--secondary);
      font-size: 0.8125rem;
    }

    .cart-offer-alert p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Bag Header */
    .bag-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .bag-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .bag-title {
      font-size: 0.8125rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.05em;
    }

    .clear-bag-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }

    /* Bag Items */
    .bag-item-list {
      display: flex;
      flex-direction: column;
    }

    .bag-item-row {
      display: flex;
      padding: 20px;
      border-bottom: 1px solid var(--border-color);
      gap: 16px;
      position: relative;
    }

    .bag-item-row:last-child {
      border-bottom: none;
    }

    .bag-item-img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background: #f8fafc;
      flex-shrink: 0;
    }

    .bag-item-details {
      flex: 1;
    }

    .item-sku {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .item-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--secondary);
      margin: 2px 0 4px;
    }

    .item-price-unit {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .return-tag {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-top: 6px;
    }

    .item-actions-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .qty-control-pill {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .qty-control-pill button {
      background: #f8fafc;
      border: none;
      width: 28px;
      height: 28px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary);
    }

    .qty-control-pill button:hover:not(:disabled) {
      background: var(--primary-light);
      color: var(--primary);
    }

    .qty-num {
      padding: 0 12px;
      font-size: 0.875rem;
      font-weight: 800;
    }

    .item-subtotal-price {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .item-subtotal-price strong {
      color: var(--secondary);
      font-size: 1rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      align-self: flex-start;
      padding: 4px;
      transition: color 0.2s ease;
    }

    .remove-btn:hover {
      color: var(--danger);
    }

    /* Right Sidebar Summary */
    .coupon-card {
      background: #ffffff;
      border-radius: var(--radius-md);
    }

    .coupon-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.05em;
    }

    .coupon-input-row {
      display: flex;
      gap: 8px;
    }

    .coupon-input {
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .coupon-success {
      font-size: 0.75rem;
      color: #03a685;
      font-weight: 700;
    }

    .summary-card {
      background: #ffffff;
      border-radius: var(--radius-md);
    }

    .price-details-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.08em;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
    }

    .price-rows {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .price-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.84rem;
      color: var(--text-secondary);
    }

    .text-success {
      color: #03a685 !important;
      font-weight: 600;
    }

    .free-shipping-progress {
      font-size: 0.725rem;
      color: var(--primary);
      background: var(--primary-light);
      padding: 6px 10px;
      border-radius: 4px;
      margin-top: 4px;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-color);
      margin: 8px 0;
    }

    .total-row {
      font-size: 1rem;
      font-weight: 800;
      color: var(--secondary);
    }

    .grand-total {
      font-size: 1.25rem;
      color: var(--secondary);
    }

    .savings-alert {
      background: #e6f7f4;
      color: #03a685;
      font-size: 0.8125rem;
      padding: 8px 12px;
      border-radius: 6px;
      text-align: center;
    }

    .place-order-btn {
      letter-spacing: 0.04em;
    }

    /* Empty Bag */
    .empty-bag-card {
      max-width: 480px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: var(--radius-lg);
    }

    .empty-bag-art {
      font-size: 4rem;
      margin-bottom: 12px;
    }

    .empty-bag-title {
      font-size: 1.35rem;
      color: var(--secondary);
      margin-bottom: 6px;
    }

    .empty-bag-sub {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    @media (max-width: 991px) {
      .myntra-cart-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartViewComponent implements OnInit {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cart: Cart | null = null;
  couponCode = '';
  couponApplied = false;

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
    }
  }

  updateQuantity(itemId: number, newQty: number): void {
    if (newQty < 1) return;
    this.cartService.updateQuantity(itemId, newQty).subscribe();
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success('Item removed from your bag');
        }
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success('Shopping bag cleared');
        }
      }
    });
  }

  applyCoupon(): void {
    if (this.couponCode.trim().toUpperCase() === 'CLOUDCART500') {
      this.couponApplied = true;
      this.notificationService.success('Congratulations! Coupon CLOUDCART500 applied: ₹500 Discount');
    } else {
      this.notificationService.show('warning', 'Invalid coupon code. Try CLOUDCART500 for ₹500 off!');
    }
  }

  getEstimatedMrp(): number {
    return this.cart ? Math.round(this.cart.totalAmount * 1.33) : 0;
  }

  getEstimatedTax(): number {
    return this.cart ? Math.round(this.cart.totalAmount * 0.18) : 0;
  }

  getShippingCost(): number {
    if (!this.cart || this.cart.totalAmount === 0) return 0;
    return this.cart.totalAmount >= 999 ? 0 : 99;
  }

  getFinalTotal(): number {
    if (!this.cart) return 0;
    const discount = this.couponApplied ? 500 : 0;
    const base = this.cart.totalAmount + this.getEstimatedTax() + this.getShippingCost();
    return Math.max(0, base - discount);
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.show('warning', 'Please sign in to complete your checkout');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
