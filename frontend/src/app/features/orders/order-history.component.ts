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
    <div class="orders-page">
      <div class="container py-8">
        <div class="orders-header-bar mb-6">
          <div>
            <h1 class="page-title">My Orders</h1>
            <p class="page-sub">Track shipments, verify distributed Saga status & view receipts</p>
          </div>
          <a routerLink="/products" class="btn btn-sm btn-outline-primary">Continue Shopping</a>
        </div>

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
                  <span class="item-bullet">📦</span>
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-qty">Qty: {{ item.quantity }}</span>
                  <span class="item-sub">₹{{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="order-actions">
                <a [routerLink]="['/orders', order.orderNumber]" class="btn btn-sm btn-primary">
                  Track Order & Saga Timeline →
                </a>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noOrders>
          <div *ngIf="!loading" class="card p-8 text-center empty-orders-card">
            <div class="empty-icon">📦</div>
            <h2>No orders placed yet</h2>
            <p class="mt-2 text-muted">You haven't placed any orders with CloudCart yet.</p>
            <a routerLink="/products" class="btn btn-primary mt-4">Explore 58+ Products</a>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-box text-center py-8">
          <div class="spinner"></div>
          <p class="mt-2 text-muted">Loading your order history from Order Service...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }
    .py-8 { padding: 2rem 0 4rem; }
    .orders-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .page-sub {
      font-size: 0.84rem;
      color: var(--text-secondary);
    }
    .order-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      transition: all 0.25s ease;
    }
    .order-card:hover {
      box-shadow: 0 8px 24px rgba(40, 44, 63, 0.1);
    }
    .order-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 14px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .order-num {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--secondary);
      display: block;
    }
    .order-date {
      font-size: 0.775rem;
      color: var(--text-muted);
    }
    .order-badge-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .order-total {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .order-card-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }
    .items-preview {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .preview-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.84rem;
    }
    .item-bullet { font-size: 0.95rem; }
    .item-name { font-weight: 700; color: var(--text-primary); }
    .item-qty { color: var(--text-muted); font-size: 0.75rem; }
    .item-sub { font-weight: 800; color: var(--secondary); margin-left: auto; }
    .empty-orders-card {
      max-width: 480px;
      margin: 40px auto;
      border-radius: var(--radius-lg);
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: 12px; }
  `]
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: res => {
        this.loading = false;
        if (res.success && res.data) {
          this.orders = res.data;
        }
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
        return 'badge-warning';
      case 'CANCELLED':
      case 'PAYMENT_FAILED':
        return 'badge-danger';
      default:
        return 'badge-primary';
    }
  }
}
