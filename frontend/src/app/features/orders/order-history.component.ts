import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-8">
      <h1 class="page-title mb-6">My Order History</h1>

      <div *ngIf="!loading && orders.length > 0; else noOrders" class="orders-list">
        <div *ngFor="let order of orders" class="order-card card p-6 mb-4">
          <div class="order-card-header">
            <div class="order-meta">
              <span class="order-num">{{ order.orderNumber }}</span>
              <span class="order-date">Placed on {{ order.createdAt | date:'mediumDate' }}</span>
            </div>
            <div class="order-badge-row">
              <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                {{ order.status }}
              </span>
              <span class="order-total">₹{{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="order-card-body">
            <div class="items-preview">
              <div *ngFor="let item of order.items" class="preview-item">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-qty">Qty: {{ item.quantity }}</span>
                <span class="item-sub">₹{{ item.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="order-actions">
              <a [routerLink]="['/orders', order.orderNumber]" class="btn btn-sm btn-outline">
                Track Order & Details →
              </a>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noOrders>
        <div *ngIf="!loading" class="card p-8 text-center">
          <div class="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p class="mt-2 text-muted">You haven't placed any orders with CloudCart yet.</p>
          <a routerLink="/products" class="btn btn-primary mt-4">Start Shopping</a>
        </div>
      </ng-template>

      <div *ngIf="loading" class="loading-box text-center py-8">
        <div class="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .page-title { font-size: 1.85rem; color: var(--secondary); }
    .p-6 { padding: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    
    .order-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .order-num { font-size: 1.1rem; font-weight: 800; color: var(--secondary); display: block; }
    .order-date { font-size: 0.8rem; color: var(--text-muted); }
    .order-badge-row { display: flex; align-items: center; gap: 14px; }
    .order-total { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
    
    .order-card-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .items-preview { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .preview-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
    }
    .item-name { font-weight: 600; color: var(--text-primary); }
    .item-qty { color: var(--text-muted); font-size: 0.75rem; }
    .item-sub { font-weight: 700; color: var(--text-secondary); margin-left: auto; }
    
    .empty-icon { font-size: 3rem; margin-bottom: 12px; }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .order-card-body { flex-direction: column; align-items: stretch; }
      .order-actions { margin-top: 12px; }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = true;

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: res => {
        this.loading = false;
        if (res.success) this.orders = res.data;
      },
      error: () => {
        this.loading = false;
      }
    });
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
