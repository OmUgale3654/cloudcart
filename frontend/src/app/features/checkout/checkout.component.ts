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
    <div class="checkout-page">
      <!-- Myntra Stepper Header Bar -->
      <div class="checkout-stepper-bar">
        <div class="container stepper-container">
          <a routerLink="/cart" class="step-item completed">
            <span class="step-num">✓</span>
            <span class="step-text">BAG</span>
          </a>
          <div class="step-line active"></div>
          <div class="step-item active">
            <span class="step-num">2</span>
            <span class="step-text">ADDRESS</span>
          </div>
          <div class="step-line active"></div>
          <div class="step-item active">
            <span class="step-num">3</span>
            <span class="step-text">PAYMENT</span>
          </div>
        </div>
      </div>

      <div class="container py-8">
        <div *ngIf="cart && cart.items.length > 0; else noItems" class="checkout-layout">
          <!-- Forms Column -->
          <div class="checkout-forms">
            <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
              <!-- Section 1: Indian Delivery Address -->
              <div class="card p-6 mb-6 address-card">
                <div class="section-title-row">
                  <span class="step-badge">1</span>
                  <div>
                    <h2 class="section-title">DELIVERY ADDRESS</h2>
                    <p class="section-sub">Where should we deliver your order?</p>
                  </div>
                </div>

                <div class="quick-preset-btns mb-4">
                  <span class="preset-label">Quick Fill:</span>
                  <button type="button" (click)="fillPreset('bengaluru')" class="preset-chip">📍 Bengaluru</button>
                  <button type="button" (click)="fillPreset('mumbai')" class="preset-chip">📍 Mumbai</button>
                  <button type="button" (click)="fillPreset('delhi')" class="preset-chip">📍 Delhi NCR</button>
                </div>

                <div class="form-group">
                  <label class="form-label">Flat, House no., Building, Street *</label>
                  <input
                    type="text"
                    formControlName="street"
                    class="form-control"
                    placeholder="e.g. 402 Green Glen Layout, Bellandur"
                  />
                  <span class="form-error" *ngIf="checkoutForm.get('street')?.invalid && checkoutForm.get('street')?.touched">
                    Street address is required.
                  </span>
                </div>

                <div class="form-grid-3">
                  <div class="form-group">
                    <label class="form-label">City *</label>
                    <input type="text" formControlName="city" class="form-control" placeholder="Bengaluru" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">State *</label>
                    <input type="text" formControlName="state" class="form-control" placeholder="Karnataka" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Pincode *</label>
                    <input type="text" formControlName="zipCode" class="form-control" placeholder="560103" />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Country</label>
                  <input type="text" formControlName="country" class="form-control" readonly />
                </div>
              </div>

              <!-- Section 2: Simulated Payment Gateway Scenarios -->
              <div class="card p-6 mb-6 payment-card">
                <div class="section-title-row">
                  <span class="step-badge">2</span>
                  <div>
                    <h2 class="section-title">PAYMENT METHOD SIMULATION</h2>
                    <p class="section-sub">Choose a distributed transaction scenario to test Saga orchestration</p>
                  </div>
                </div>

                <!-- Scenario Radio Cards -->
                <div class="scenario-cards-list mt-4">
                  <label class="scenario-option card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_SUCCESS'">
                    <input type="radio" formControlName="paymentToken" value="CARD_SUCCESS" />
                    <div class="scenario-body">
                      <div class="scenario-title-line">
                        <span class="scenario-name">🟢 Instant Approval (UPI & Cards)</span>
                        <span class="badge badge-success">Saga Complete</span>
                      </div>
                      <p class="scenario-desc">
                        Simulates successful charge. Inventory locks are permanently confirmed, and order status transitions to <strong>CONFIRMED</strong>.
                      </p>
                    </div>
                  </label>

                  <label class="scenario-option card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_DECLINED'">
                    <input type="radio" formControlName="paymentToken" value="CARD_DECLINED" />
                    <div class="scenario-body">
                      <div class="scenario-title-line">
                        <span class="scenario-name">🔴 Card Declined / Gateway Error</span>
                        <span class="badge badge-danger">Rollback Demo</span>
                      </div>
                      <p class="scenario-desc">
                        Simulates declined card. Order Saga triggers compensating transaction to release reserved stock.
                      </p>
                    </div>
                  </label>

                  <label class="scenario-option card" [class.selected]="checkoutForm.get('paymentToken')?.value === 'CARD_INSUFFICIENT_FUNDS'">
                    <input type="radio" formControlName="paymentToken" value="CARD_INSUFFICIENT_FUNDS" />
                    <div class="scenario-body">
                      <div class="scenario-title-line">
                        <span class="scenario-name">🟡 Insufficient Balance</span>
                        <span class="badge badge-warning">Rollback Demo</span>
                      </div>
                      <p class="scenario-desc">
                        Simulates bank rejection due to insufficient funds. Demonstrates idempotent failure handling.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="checkoutForm.invalid || loading"
                class="btn btn-primary btn-lg w-full pay-now-btn"
              >
                <span *ngIf="!loading">PAY & COMPLETE ORDER (₹{{ getFinalTotal() | number:'1.2-2' }}) →</span>
                <span *ngIf="loading">Executing Distributed Saga (Reserve → Charge → Confirm)...</span>
              </button>
            </form>
          </div>

          <!-- Right Sidebar: Order Summary & Trust -->
          <aside class="checkout-summary-col">
            <div class="card p-5 summary-card">
              <h3 class="summary-title">ORDER SUMMARY ({{ cart.totalItems }} Items)</h3>

              <!-- Mini Item Thumbnails -->
              <div class="mini-items-strip">
                <div *ngFor="let item of cart.items" class="mini-item-box">
                  <img [src]="item.imageUrl" [alt]="item.productName" class="mini-img" />
                  <span class="mini-qty-badge">{{ item.quantity }}</span>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="price-rows">
                <div class="price-row">
                  <span>Bag Subtotal</span>
                  <span>₹{{ cart.totalAmount | number:'1.2-2' }}</span>
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

                <div class="summary-divider"></div>

                <div class="price-row total-row">
                  <span>Total Payable</span>
                  <span class="grand-total">₹{{ getFinalTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Trust Badges -->
              <div class="checkout-trust-box mt-4">
                <div class="trust-line">
                  <span>🔒</span>
                  <span>256-Bit SSL Encrypted & PCI-DSS Tokenized</span>
                </div>
                <div class="trust-line">
                  <span>⚡</span>
                  <span>Spring Cloud Distributed Transaction</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <ng-template #noItems>
          <div class="empty-checkout card text-center p-8">
            <div class="empty-icon">🛍️</div>
            <h2>Your bag is empty!</h2>
            <p>Please add products to your bag before proceeding to checkout.</p>
            <a routerLink="/products" class="btn btn-primary mt-4">Browse Catalog</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }

    /* Stepper */
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

    .step-item.completed {
      color: #03a685;
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

    .step-item.completed .step-num {
      background: #03a685;
      color: #ffffff;
      border-color: #03a685;
    }

    .step-line {
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }

    .step-line.active {
      background: #03a685;
    }

    .py-8 {
      padding: 2rem 0 4rem;
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 32px;
      align-items: start;
    }

    .section-title-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }

    .step-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--secondary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.04em;
    }

    .section-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Quick Fill Presets */
    .quick-preset-btns {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .preset-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    .preset-chip {
      background: #f5f5f6;
      border: 1px solid var(--border-color);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.725rem;
      font-weight: 700;
      cursor: pointer;
      color: var(--secondary);
      transition: all 0.2s ease;
    }

    .preset-chip:hover {
      background: var(--primary-light);
      border-color: var(--primary-border);
      color: var(--primary);
    }

    /* Payment Scenarios */
    .scenario-cards-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .scenario-option {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      border: 1.5px solid var(--border-color);
      transition: all 0.2s ease;
      background: #ffffff;
    }

    .scenario-option:hover {
      border-color: #cbd5e1;
    }

    .scenario-option.selected {
      border-color: var(--primary);
      background: #fffbfa;
      box-shadow: 0 4px 12px rgba(255, 63, 108, 0.1);
    }

    .scenario-option input {
      margin-top: 3px;
      accent-color: var(--primary);
    }

    .scenario-body {
      flex: 1;
    }

    .scenario-title-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .scenario-name {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--secondary);
    }

    .scenario-desc {
      font-size: 0.775rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin: 0;
    }

    .pay-now-btn {
      height: 52px;
      font-size: 1rem;
      letter-spacing: 0.04em;
    }

    /* Right Summary Card */
    .summary-card {
      background: #ffffff;
      border-radius: var(--radius-md);
    }

    .summary-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    .mini-items-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .mini-item-box {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .mini-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .mini-qty-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.75);
      color: #ffffff;
      font-size: 0.6rem;
      padding: 1px 4px;
      border-top-left-radius: 4px;
      font-weight: 800;
    }

    .summary-divider {
      height: 1px;
      background: var(--border-color);
      margin: 12px 0;
    }

    .price-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
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

    .total-row {
      font-size: 1rem;
      font-weight: 800;
      color: var(--secondary);
    }

    .grand-total {
      font-size: 1.25rem;
      color: var(--secondary);
    }

    .checkout-trust-box {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .trust-line {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-checkout {
      max-width: 440px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: var(--radius-lg);
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    @media (max-width: 991px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }
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
  loading: boolean = false;

  checkoutForm: FormGroup = this.fb.group({
    street: ['Flat 402, Green Glen Layout, Bellandur', [Validators.required]],
    city: ['Bengaluru', [Validators.required]],
    state: ['Karnataka', [Validators.required]],
    zipCode: ['560103', [Validators.required]],
    country: ['India', [Validators.required]],
    paymentToken: ['CARD_SUCCESS', [Validators.required]]
  });

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    this.cartService.loadCart().subscribe();
  }

  fillPreset(city: string): void {
    if (city === 'bengaluru') {
      this.checkoutForm.patchValue({
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560103',
        country: 'India'
      });
    } else if (city === 'mumbai') {
      this.checkoutForm.patchValue({
        street: '14, Bandra West, Near Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400050',
        country: 'India'
      });
    } else if (city === 'delhi') {
      this.checkoutForm.patchValue({
        street: 'Tower B, Cyber City, DLF Phase 2',
        city: 'Gurugram',
        state: 'Haryana',
        zipCode: '122002',
        country: 'India'
      });
    }
    this.notificationService.success(`Address updated to ${city.toUpperCase()}`);
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
    return this.cart.totalAmount + this.getEstimatedTax() + this.getShippingCost();
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || !this.cart) return;

    this.loading = true;
    const formVal = this.checkoutForm.value;
    const fullShippingAddress = `${formVal.street}, ${formVal.city}, ${formVal.state} - ${formVal.zipCode}, ${formVal.country}`;

    this.orderService.checkout({
      shippingAddress: fullShippingAddress,
      paymentMethod: 'CREDIT_CARD',
      paymentToken: formVal.paymentToken
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success && res.data) {
          this.notificationService.success('Order placed and confirmed successfully!');
          this.cartService.loadCart().subscribe();
          this.router.navigate(['/orders', res.data.orderNumber]);
        }
      },
      error: (err) => {
        this.loading = false;
        // In case of simulated decline, the error interceptor will notify
      }
    });
  }
}
