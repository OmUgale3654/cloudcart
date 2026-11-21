import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-8">
      <h1 class="page-title mb-6">Shopping Cart</h1>

      <div *ngIf="cart && cart.items.length > 0; else emptyCart" class="cart-layout">
        <!-- Cart Items List -->
        <div class="cart-items-panel card">
          <div class="panel-header">
            <h2>Cart Items ({{ cart.totalItems }})</h2>
            <button (click)="clearCart()" class="btn-clear">Clear Cart</button>
          </div>

          <div class="items-list">
            <div *ngFor="let item of cart.items" class="cart-item-row">
              <img [src]="item.imageUrl" [alt]="item.productName" class="item-img" />
              <div class="item-details">
                <span class="item-sku">SKU: {{ item.sku }}</span>
                <h3 class="item-name">{{ item.productName }}</h3>
                <span class="item-unit-price">₹{{ item.unitPrice | number:'1.2-2' }} each</span>
              </div>

              <div class="item-quantity">
                <div class="qty-btn-group">
                  <button (click)="updateQuantity(item.id, item.quantity - 1)" [disabled]="item.quantity <= 1">-</button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button (click)="updateQuantity(item.id, item.quantity + 1)">+</button>
                </div>
              </div>

              <div class="item-subtotal">
                <span class="subtotal-amount">₹{{ item.subtotal | number:'1.2-2' }}</span>
              </div>

              <button (click)="removeItem(item.id)" class="btn-remove" title="Remove item">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Card -->
        <aside class="cart-summary-panel">
          <div class="card p-6 summary-box">
            <h2 class="summary-title">Order Summary</h2>

            <div class="summary-rows">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>₹{{ cart.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Estimated GST (18%)</span>
                <span>₹{{ getEstimatedTax() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span *ngIf="getShippingCost() === 0" class="text-success font-bold">FREE</span>
                <span *ngIf="getShippingCost() > 0">₹{{ getShippingCost() | number:'1.2-2' }}</span>
              </div>
              <div class="free-shipping-hint" *ngIf="cart.totalAmount < 999">
                Add <strong>₹{{ (999 - cart.totalAmount) | number:'1.2-2' }}</strong> more to qualify for FREE shipping!
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row total-row">
                <span>Estimated Total</span>
                <span class="total-amount">₹{{ getEstimatedTotal() | number:'1.2-2' }}</span>
              </div>
            </div>

            <button (click)="proceedToCheckout()" class="btn btn-primary btn-lg w-full checkout-btn mt-6">
              Proceed to Checkout →
            </button>

            <div class="trust-icons mt-4">
              <span>🔒 256-Bit SSL Encryption</span>
              <span>⚡ Fast Cloud-Native Processing</span>
            </div>
          </div>
        </aside>
      </div>

      <!-- Empty Cart State -->
      <ng-template #emptyCart>
        <div class="card empty-cart-card text-center p-8">
          <div class="empty-cart-icon">🛒</div>
          <h2>Your Shopping Cart is Empty</h2>
          <p>Discover our cloud-native selection of audio, wearables, and computing peripherals.</p>
          <a routerLink="/products" class="btn btn-primary btn-lg mt-6">Start Shopping</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .page-title { font-size: 1.85rem; color: var(--secondary); }
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 30px;
      align-items: flex-start;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }
    .panel-header h2 { font-size: 1.15rem; }
    .btn-clear {
      background: none;
      border: none;
      color: var(--danger);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .items-list { padding: 0 24px; }
    .cart-item-row {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .cart-item-row:last-child { border-bottom: none; }
    .item-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: var(--radius-md);
      background: #f8fafc;
    }
    .item-details { flex: 1; }
    .item-sku { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
    .item-name { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 2px 0 4px; }
    .item-unit-price { font-size: 0.8rem; color: var(--text-secondary); }
    
    .qty-btn-group {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #ffffff;
      overflow: hidden;
    }
    .qty-btn-group button {
      background: #f8fafc;
      border: none;
      width: 32px;
      height: 32px;
      font-weight: 700;
      cursor: pointer;
    }
    .qty-btn-group button:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-val { width: 36px; text-align: center; font-size: 0.85rem; font-weight: 700; }
    
    .item-subtotal { min-width: 90px; text-align: right; }
    .subtotal-amount { font-size: 1.1rem; font-weight: 800; color: var(--secondary); }
    .btn-remove {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.1rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .btn-remove:hover { opacity: 1; }
    
    .p-6 { padding: 1.5rem; }
    .summary-title { font-size: 1.25rem; margin-bottom: 20px; }
    .summary-rows { display: flex; flex-direction: column; gap: 12px; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .summary-divider { height: 1px; background: var(--border-color); margin: 8px 0; }
    .total-row {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .total-amount { color: var(--primary); font-size: 1.4rem; }
    .free-shipping-hint {
      font-size: 0.75rem;
      color: #92400e;
      background: #fef3c7;
      padding: 6px 10px;
      border-radius: 6px;
      margin-top: 4px;
    }
    .w-full { width: 100%; }
    .text-success { color: #10b981; }
    .font-bold { font-weight: 700; }
    .trust-icons {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
    }

    .empty-cart-card {
      padding: 80px 20px;
      background: #ffffff;
      max-width: 600px;
      margin: 0 auto;
    }
    .empty-cart-icon { font-size: 3.5rem; margin-bottom: 16px; }
    .empty-cart-card p { color: var(--text-secondary); margin-top: 6px; }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; gap: 24px; }
    }

    @media (max-width: 600px) {
      .items-list { padding: 0 14px; }
      .cart-item-row {
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px 0;
      }
      .item-img {
        width: 64px;
        height: 64px;
      }
      .item-details {
        flex: 1;
        min-width: 140px;
      }
      .item-quantity {
        margin-left: 76px;
      }
      .item-subtotal {
        margin-left: auto;
      }
      .p-6 {
        padding: 1rem;
      }
      .total-amount {
        font-size: 1.25rem;
      }
    }
  `]
})
export class CartViewComponent implements OnInit {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  cart: Cart | null = null;

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({
        next: res => { if (res.success) this.cart = res.data; }
      });
    }
  }

  updateQuantity(itemId: number, newQty: number) {
    this.cartService.updateQuantity(itemId, newQty).subscribe();
  }

  removeItem(itemId: number) {
    this.cartService.removeItem(itemId).subscribe();
  }

  clearCart() {
    this.cartService.clearCart().subscribe();
  }

  getEstimatedTax(): number {
    return this.cart ? +(this.cart.totalAmount * 0.18).toFixed(2) : 0;
  }

  getShippingCost(): number {
    if (!this.cart) return 0;
    return this.cart.totalAmount >= 999 ? 0 : 99.00;
  }

  getEstimatedTotal(): number {
    if (!this.cart) return 0;
    return +(this.cart.totalAmount + this.getEstimatedTax() + this.getShippingCost()).toFixed(2);
  }

  proceedToCheckout() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { redirect: '/checkout' } });
    } else {
      this.router.navigate(['/checkout']);
    }
  }
}
