import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-detail-page">
      <div class="container py-8" *ngIf="order; else loadingState">
        <!-- Breadcrumb -->
        <nav class="breadcrumb mb-4">
          <a routerLink="/orders">Orders</a>
          <span class="sep">/</span>
          <span class="active">{{ order.orderNumber }}</span>
        </nav>

        <!-- Status Header Card -->
        <div class="card p-6 mb-6 status-card">
          <div class="status-top">
            <div>
              <span class="order-label">Tracking Shipment</span>
              <h1 class="order-title">{{ order.orderNumber }}</h1>
              <span class="order-timestamp">Placed on {{ order.createdAt | date:'medium' }}</span>
            </div>
            <div class="status-right">
              <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
              <button
                *ngIf="canCancelOrder(order.status)"
                (click)="cancelOrder()"
                class="btn btn-sm btn-danger mt-2"
              >
                Cancel Order & Refund
              </button>
            </div>
          </div>

          <!-- Myntra Delivery Progress Stepper -->
          <div class="timeline-container mt-6" *ngIf="order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED'">
            <div class="timeline-step" [class.completed]="isStepCompleted('PENDING')">
              <div class="circle">✓</div>
              <span>Order Placed</span>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted('CONFIRMED')"></div>
            <div class="timeline-step" [class.completed]="isStepCompleted('CONFIRMED')">
              <div class="circle">✓</div>
              <span>Saga Confirmed</span>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted('PROCESSING')"></div>
            <div class="timeline-step" [class.completed]="isStepCompleted('PROCESSING')">
              <div class="circle">⚙</div>
              <span>Packing Gear</span>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted('SHIPPED')"></div>
            <div class="timeline-step" [class.completed]="isStepCompleted('SHIPPED')">
              <div class="circle">🚚</div>
              <span>Out for Delivery</span>
            </div>
            <div class="timeline-line" [class.completed]="isStepCompleted('DELIVERED')"></div>
            <div class="timeline-step" [class.completed]="isStepCompleted('DELIVERED')">
              <div class="circle">📦</div>
              <span>Delivered</span>
            </div>
          </div>

          <div *ngIf="order.status === 'CANCELLED'" class="cancellation-banner mt-6">
            <span>❌ This order has been cancelled and any charged payment was refunded via Saga compensation.</span>
          </div>
        </div>

        <div class="order-details-grid">
          <!-- Items Table -->
          <div class="card p-6 items-table-card">
            <h2 class="section-heading mb-4">Ordered Items ({{ order.items.length }})</h2>
            <div class="table-responsive">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>SKU</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of order.items">
                    <td class="item-title-cell">
                      <strong>{{ item.productName }}</strong>
                    </td>
                    <td class="text-muted">{{ item.sku }}</td>
                    <td>₹{{ item.unitPrice | number:'1.2-2' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td class="text-right font-bold">₹{{ item.subtotal | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shipping and Summary Sidebar -->
          <div class="order-side-col">
            <!-- Shipping Card -->
            <div class="card p-6 mb-4 info-box">
              <h3 class="box-title">DELIVERY DESTINATION</h3>
              <p class="address-text">{{ order.shippingAddress }}</p>
              <div class="email-row mt-2">
                <span>Customer Email:</span>
                <strong>{{ order.userEmail }}</strong>
              </div>
            </div>

            <!-- Bill Summary -->
            <div class="card p-6 info-box">
              <h3 class="box-title">PRICE BREAKDOWN</h3>
              <div class="breakdown-rows">
                <div class="b-row">
                  <span>Items Subtotal</span>
                  <span>₹{{ order.subtotal | number:'1.2-2' }}</span>
                </div>
                <div class="b-row">
                  <span>GST / Tax (18%)</span>
                  <span>₹{{ order.taxAmount | number:'1.2-2' }}</span>
                </div>
                <div class="b-row">
                  <span>Shipping Fee</span>
                  <span *ngIf="order.shippingCost === 0" class="text-success font-bold">FREE</span>
                  <span *ngIf="order.shippingCost > 0">₹{{ order.shippingCost | number:'1.2-2' }}</span>
                </div>
                <div class="divider"></div>
                <div class="b-row total">
                  <span>Grand Total Paid</span>
                  <span class="total-price">₹{{ order.totalAmount | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loadingState>
        <div class="container py-8 text-center">
          <div class="spinner"></div>
          <p class="mt-2 text-muted">Retrieving order details from Order Service...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .order-detail-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }
    .py-8 { padding: 2rem 0 4rem; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .breadcrumb a { color: var(--text-secondary); font-weight: 600; }
    .status-card {
      background: #ffffff;
      border-radius: var(--radius-md);
    }
    .status-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .order-label {
      font-size: 0.6875rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .order-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--secondary);
      margin: 2px 0 4px;
    }
    .order-timestamp {
      font-size: 0.775rem;
      color: var(--text-muted);
    }
    .status-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .timeline-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #fafafb;
      padding: 20px 24px;
      border-radius: var(--radius-sm);
      overflow-x: auto;
    }
    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 0.725rem;
      font-weight: 700;
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .timeline-step .circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.8rem;
    }
    .timeline-step.completed {
      color: #03a685;
    }
    .timeline-step.completed .circle {
      background: #03a685;
      color: #ffffff;
    }
    .timeline-line {
      flex: 1;
      height: 2px;
      background: #e2e8f0;
      margin: 0 10px 18px;
      min-width: 30px;
    }
    .timeline-line.completed {
      background: #03a685;
    }
    .cancellation-banner {
      background: var(--danger-light);
      border: 1px solid var(--primary-border);
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 0.84rem;
      font-weight: 600;
    }
    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 28px;
    }
    .items-table-card {
      background: #ffffff;
      border-radius: var(--radius-md);
    }
    .section-heading {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.05em;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.84rem;
    }
    .items-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.725rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .info-box {
      background: #ffffff;
      border-radius: var(--radius-md);
    }
    .box-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.08em;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-color);
    }
    .address-text {
      font-size: 0.84rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .email-row {
      font-size: 0.775rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .breakdown-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .b-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.84rem;
      color: var(--text-secondary);
    }
    .b-row.total {
      font-size: 1rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .total-price {
      font-size: 1.25rem;
    }
    .divider {
      height: 1px;
      background: var(--border-color);
      margin: 4px 0;
    }
    @media (max-width: 991px) {
      .order-details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);

  order: Order | null = null;

  ngOnInit(): void {
    const orderNumber = this.route.snapshot.paramMap.get('orderNumber');
    if (orderNumber) {
      this.orderService.getOrderByNumber(orderNumber).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.order = res.data;
          }
        }
      });
    }
  }

  canCancelOrder(status: string): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  cancelOrder(): void {
    if (!this.order) return;
    this.orderService.cancelOrder(this.order.orderNumber).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.order = res.data;
          this.notificationService.success('Order cancelled. Compensating inventory release executed.');
        }
      }
    });
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) return false;
    const stages = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = stages.indexOf(this.order.status);
    const targetIndex = stages.indexOf(step);
    return currentIndex >= targetIndex && currentIndex !== -1;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'badge-success';
      case 'PENDING':
      case 'PROCESSING':
        return 'badge-warning';
      case 'CANCELLED':
      case 'PAYMENT_FAILED':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  }
}
