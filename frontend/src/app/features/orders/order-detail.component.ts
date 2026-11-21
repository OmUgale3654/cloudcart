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
    <div class="container py-8" *ngIf="order; else loadingState">
      <!-- Breadcrumb -->
      <nav class="breadcrumb mb-4">
        <a routerLink="/orders">Orders</a>
        <span>/</span>
        <span class="active">{{ order.orderNumber }}</span>
      </nav>

      <!-- Status Header -->
      <div class="card p-6 mb-6 status-card">
        <div class="status-top">
          <div>
            <span class="order-label">Tracking Order</span>
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

        <!-- Tracking Timeline -->
        <div class="timeline-container mt-6" *ngIf="order.status !== 'CANCELLED' && order.status !== 'PAYMENT_FAILED'">
          <div class="timeline-step" [class.completed]="isStepCompleted('PENDING')">
            <div class="circle">✓</div>
            <span>Order Placed</span>
          </div>
          <div class="timeline-line" [class.completed]="isStepCompleted('CONFIRMED')"></div>
          <div class="timeline-step" [class.completed]="isStepCompleted('CONFIRMED')">
            <div class="circle">✓</div>
            <span>Confirmed</span>
          </div>
          <div class="timeline-line" [class.completed]="isStepCompleted('PROCESSING')"></div>
          <div class="timeline-step" [class.completed]="isStepCompleted('PROCESSING')">
            <div class="circle">⚙</div>
            <span>Processing</span>
          </div>
          <div class="timeline-line" [class.completed]="isStepCompleted('SHIPPED')"></div>
          <div class="timeline-step" [class.completed]="isStepCompleted('SHIPPED')">
            <div class="circle">🚚</div>
            <span>Shipped</span>
          </div>
          <div class="timeline-line" [class.completed]="isStepCompleted('DELIVERED')"></div>
          <div class="timeline-step" [class.completed]="isStepCompleted('DELIVERED')">
            <div class="circle">📦</div>
            <span>Delivered</span>
          </div>
        </div>

        <div *ngIf="order.status === 'CANCELLED'" class="cancellation-banner mt-6">
          <span>❌ This order has been cancelled and any charged payment was refunded.</span>
        </div>
      </div>

      <div class="order-details-grid">
        <!-- Purchased Items Table -->
        <div class="card p-6 items-table-card">
          <h2 class="section-heading mb-4">Purchased Items</h2>
          <div class="table-responsive">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of order.items">
                  <td class="item-title">{{ item.productName }}</td>
                  <td class="text-muted">{{ item.sku }}</td>
                  <td>₹{{ item.unitPrice | number:'1.2-2' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td class="text-right font-bold">₹{{ item.subtotal | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Information & Financials -->
        <div class="info-sidebar">
          <div class="card p-6 mb-6">
            <h3 class="side-heading">Shipping Address</h3>
            <p class="address-text">{{ order.shippingAddress }}</p>
          </div>

          <div class="card p-6 mb-6">
            <h3 class="side-heading">Payment Information</h3>
            <div class="info-line">
              <span>Transaction ID:</span>
              <strong class="font-mono">{{ order.paymentTransactionId || 'N/A' }}</strong>
            </div>
            <div class="info-line mt-2">
              <span>Payment Gateway:</span>
              <span>Simulated Processor</span>
            </div>
          </div>

          <div class="card p-6">
            <h3 class="side-heading">Financial Summary</h3>
            <div class="calc-row">
              <span>Subtotal:</span>
              <span>₹{{ order.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="calc-row">
              <span>GST (18%):</span>
              <span>₹{{ order.taxAmount | number:'1.2-2' }}</span>
            </div>
            <div class="calc-row">
              <span>Shipping:</span>
              <span>₹{{ order.shippingCost | number:'1.2-2' }}</span>
            </div>
            <div class="calc-divider"></div>
            <div class="calc-row total">
              <span>Grand Total:</span>
              <span class="total-price">₹{{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
      <div class="container py-8 text-center">
        <div class="spinner"></div>
        <p>Loading order status and items...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-muted); }
    .breadcrumb a { color: var(--text-secondary); text-decoration: none; }
    .breadcrumb a:hover { color: var(--primary); }
    .breadcrumb .active { color: var(--text-primary); font-weight: 600; }
    
    .status-card { background: #ffffff; }
    .status-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .order-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--primary); letter-spacing: 0.05em; }
    .order-title { font-size: 1.75rem; color: var(--secondary); margin: 2px 0 4px; }
    .order-timestamp { font-size: 0.85rem; color: var(--text-muted); }
    .status-right { display: flex; flex-direction: column; align-items: flex-end; }
    
    .timeline-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 10px 0;
      border-top: 1px solid #f1f5f9;
    }
    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    .timeline-step.completed { color: var(--primary); }
    .timeline-step .circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 800;
    }
    .timeline-step.completed .circle {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    }
    .timeline-line {
      flex: 1;
      height: 3px;
      background: #e2e8f0;
      margin: 0 8px -20px;
    }
    .timeline-line.completed { background: var(--primary); }
    .cancellation-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 30px;
    }
    .section-heading { font-size: 1.2rem; }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .items-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #f1f5f9;
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .items-table td {
      padding: 14px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .item-title { font-weight: 600; color: var(--text-primary); }
    .font-mono { font-family: monospace; font-size: 0.8rem; }
    .side-heading { font-size: 1rem; margin-bottom: 12px; }
    .address-text { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
    .info-line { display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary); }
    .calc-row { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 8px; }
    .calc-divider { height: 1px; background: var(--border-color); margin: 10px 0; }
    .calc-row.total { font-size: 1.15rem; font-weight: 800; color: var(--secondary); }
    .total-price { color: var(--primary); font-size: 1.35rem; }

    @media (max-width: 900px) {
      .order-details-grid { grid-template-columns: 1fr; }
      .timeline-container { overflow-x: auto; padding-bottom: 10px; }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);

  order: Order | null = null;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderNumber = params['orderNumber'];
      if (orderNumber) {
        this.loadOrder(orderNumber);
      }
    });
  }

  loadOrder(orderNumber: string) {
    this.orderService.getOrderByNumber(orderNumber).subscribe({
      next: res => { if (res.success) this.order = res.data; }
    });
  }

  canCancelOrder(status: string): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  cancelOrder() {
    if (this.order && confirm('Are you sure you want to cancel this order? This will release reserved inventory and trigger a simulated refund.')) {
      this.orderService.cancelOrder(this.order.orderNumber).subscribe({
        next: res => {
          if (res.success) {
            this.notificationService.success('Order cancelled. Refund initiated.');
            this.order = res.data;
          }
        }
      });
    }
  }

  isStepCompleted(step: string): boolean {
    if (!this.order) return false;
    const orderStatus = this.order.status;
    const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return steps.indexOf(orderStatus) >= steps.indexOf(step);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'badge-success';
      case 'PENDING':
      case 'PROCESSING':
      case 'SHIPPED':
        return 'badge-warning';
      case 'CANCELLED':
      case 'PAYMENT_FAILED':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  }
}
