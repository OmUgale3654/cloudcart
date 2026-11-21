import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Cart } from '../../core/models/cart.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container py-8">
      <h1 class="page-title mb-6">Checkout & Order Placement</h1>

      <div *ngIf="cart && cart.items.length > 0; else noItems" class="checkout-layout">
        <!-- Main Form (Shipping & Payment) -->
        <div class="checkout-forms">
          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
            <!-- Section 1: Shipping Address -->
            <div class="card p-6 mb-6">
              <div class="section-title-row">
                <span class="step-num">1</span>
                <h2>Shipping Destination</h2>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Full Street Address *</label>
                  <input type="text" formControlName="street" class="form-control" placeholder="100 Enterprise Way, Suite 400" />
                  <span class="form-error" *ngIf="checkoutForm.get('street')?.invalid && checkoutForm.get('street')?.touched">
                    Street address is required.
                  </span>
                </div>
              </div>

              <div class="form-grid-3">
                <div class="form-group">
                  <label class="form-label">City *</label>
                  <input type="text" formControlName="city" class="form-control" placeholder="San Francisco" />
                </div>
                <div class="form-group">
                  <label class="form-label">State / Province *</label>
                  <input type="text" formControlName="state" class="form-control" placeholder="CA" />
                </div>
                <div class="form-group">
                  <label class="form-label">Postal Code *</label>
                  <input type="text" formControlName="zipCode" class="form-control" placeholder="94105" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Country *</label>
                <input type="text" formControlName="country" class="form-control" placeholder="United States" />
              </div>
            </div>

            <!-- Section 2: Payment Simulation -->
            <div class="card p-6 mb-6">
              <div class="section-title-row">
                <span class="step-num">2</span>
                <h2>Simulated Payment Gateway</h2>
              </div>
              <p class="section-desc">
                Select a simulated payment behavior scenario to test distributed Saga confirmation or compensating inventory rollback.
              </p>

              <!-- Payment Simulation Scenario Radio Cards -->
              <div class="scenario-cards mb-6">
                <label class="scenario-card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_SUCCESS'">
                  <input type="radio" formControlName="paymentToken" value="CARD_SUCCESS" />
                  <div class="scenario-info">
                    <div class="scenario-title">
                      <span>🟢 Standard Approval</span>
                      <span class="badge badge-success">Saga Complete</span>
                    </div>
                    <p>Card charge succeeds. Stock confirmed and deducted, order marked CONFIRMED.</p>
                  </div>
                </label>

                <label class="scenario-card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_DECLINED'">
                  <input type="radio" formControlName="paymentToken" value="CARD_DECLINED" />
                  <div class="scenario-info">
                    <div class="scenario-title">
                      <span>🔴 Card Declined</span>
                      <span class="badge badge-danger">Rollback Demo</span>
                    </div>
                    <p>Card fails at payment gateway. Compensating action releases reserved stock automatically.</p>
                  </div>
                </label>

                <label class="scenario-card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_INSUFFICIENT_FUNDS'">
                  <input type="radio" formControlName="paymentToken" value="CARD_INSUFFICIENT_FUNDS" />
                  <div class="scenario-info">
                    <div class="scenario-title">
                      <span>🟡 Insufficient Funds</span>
                      <span class="badge badge-warning">Rollback Demo</span>
                    </div>
                    <p>Payment rejected due to balance. Order marked PAYMENT_FAILED, inventory restored.</p>
                  </div>
                </label>
              </div>

              <!-- Simulated Card Inputs -->
              <div class="simulated-card-inputs">
                <div class="form-group">
                  <label class="form-label">Simulated Card Number</label>
                  <input type="text" class="form-control" value="•••• •••• •••• 4242" readonly />
                </div>
                <div class="form-grid-2">
                  <div class="form-group">
                    <label class="form-label">Expiry</label>
                    <input type="text" class="form-control" value="12 / 28" readonly />
                  </div>
                  <div class="form-group">
                    <label class="form-label">CVV Security Code</label>
                    <input type="text" class="form-control" value="888" readonly />
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="checkoutForm.invalid || isSubmitting"
              class="btn btn-primary btn-lg w-full submit-order-btn"
            >
              <span *ngIf="!isSubmitting">⚡ Place Order & Process Saga Checkout (\${{ getEstimatedTotal() | number:'1.2-2' }})</span>
              <span *ngIf="isSubmitting">Orchestrating Saga (Stock ➔ Payment ➔ Confirmation)...</span>
            </button>
          </form>
        </div>

        <!-- Order Summary Sidebar -->
        <aside class="checkout-summary">
          <div class="card p-6">
            <h3 class="summary-heading">Order Breakdown</h3>

            <div class="summary-items">
              <div *ngFor="let item of cart.items" class="summary-item">
                <img [src]="item.imageUrl" [alt]="item.productName" class="item-thumb" />
                <div class="item-text">
                  <span class="name">{{ item.productName }}</span>
                  <span class="qty">Qty: {{ item.quantity }} × \${{ item.unitPrice }}</span>
                </div>
                <span class="item-price">\${{ item.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="summary-calc mt-4">
              <div class="calc-row">
                <span>Subtotal</span>
                <span>\${{ cart.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="calc-row">
                <span>Sales Tax (8%)</span>
                <span>\${{ getEstimatedTax() | number:'1.2-2' }}</span>
              </div>
              <div class="calc-row">
                <span>Shipping</span>
                <span *ngIf="getShippingCost() === 0" class="text-success font-bold">FREE</span>
                <span *ngIf="getShippingCost() > 0">\${{ getShippingCost() | number:'1.2-2' }}</span>
              </div>
              <div class="calc-divider"></div>
              <div class="calc-row total">
                <span>Total Amount</span>
                <span class="price">\${{ getEstimatedTotal() | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ng-template #noItems>
        <div class="card p-8 text-center">
          <h2>No items to checkout</h2>
          <p class="mt-2 text-muted">Your shopping cart is currently empty.</p>
          <a routerLink="/products" class="btn btn-primary mt-4">Browse Catalog</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .page-title { font-size: 1.85rem; color: var(--secondary); }
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 30px;
      align-items: flex-start;
    }
    .p-6 { padding: 1.5rem; }
    .section-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-title-row h2 { font-size: 1.2rem; }
    .section-desc { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px; }
    
    .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    
    .scenario-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .scenario-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
      background: #ffffff;
    }
    .scenario-card:hover { border-color: var(--primary); background: #f8fafc; }
    .scenario-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
      box-shadow: 0 0 0 1px var(--primary);
    }
    .scenario-info { flex: 1; }
    .scenario-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    .scenario-info p { font-size: 0.775rem; color: var(--text-secondary); margin: 0; }
    
    .simulated-card-inputs {
      background: #f8fafc;
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }
    .submit-order-btn {
      height: 52px;
      font-size: 1.05rem;
    }

    .summary-heading { font-size: 1.15rem; margin-bottom: 16px; }
    .summary-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 280px;
      overflow-y: auto;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
    }
    .item-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; }
    .item-text { flex: 1; }
    .item-text .name { font-weight: 600; display: block; }
    .item-text .qty { font-size: 0.75rem; color: var(--text-muted); }
    .item-price { font-weight: 700; }
    
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }
    .calc-divider { height: 1px; background: var(--border-color); margin: 10px 0; }
    .calc-row.total {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .calc-row.total .price { color: var(--primary); font-size: 1.35rem; }

    @media (max-width: 900px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .form-grid-3 { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  cart: Cart | null = null;
  isSubmitting = false;

  checkoutForm: FormGroup = this.fb.group({
    street: ['100 Enterprise Way, Suite 400', Validators.required],
    city: ['San Francisco', Validators.required],
    state: ['CA', Validators.required],
    zipCode: ['94105', Validators.required],
    country: ['United States', Validators.required],
    paymentToken: ['CARD_SUCCESS', Validators.required]
  });

  ngOnInit() {
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    this.cartService.loadCart().subscribe({
      next: res => { if (res.success) this.cart = res.data; }
    });

    const user = this.authService.getCurrentUser();
    if (user && user.street) {
      this.checkoutForm.patchValue({
        street: user.street,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        country: user.country
      });
    }
  }

  getEstimatedTax(): number {
    return this.cart ? +(this.cart.totalAmount * 0.08).toFixed(2) : 0;
  }

  getShippingCost(): number {
    if (!this.cart) return 0;
    return this.cart.totalAmount >= 50 ? 0 : 9.99;
  }

  getEstimatedTotal(): number {
    if (!this.cart) return 0;
    return +(this.cart.totalAmount + this.getEstimatedTax() + this.getShippingCost()).toFixed(2);
  }

  onSubmit() {
    if (this.checkoutForm.invalid || !this.cart) return;

    this.isSubmitting = true;
    const formVal = this.checkoutForm.value;
    const fullAddress = `${formVal.street}, ${formVal.city}, ${formVal.state} ${formVal.zipCode}, ${formVal.country}`;

    this.orderService.checkout({
      shippingAddress: fullAddress,
      paymentMethod: 'SIMULATED_GATEWAY',
      paymentToken: formVal.paymentToken
    }).subscribe({
      next: res => {
        this.isSubmitting = false;
        if (res.success && res.data) {
          this.notificationService.success('Order placed and confirmed successfully!');
          this.cartService.loadCart().subscribe();
          this.router.navigate(['/orders', res.data.orderNumber]);
        }
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
