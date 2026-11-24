import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus } from '../../core/models/order.model';
import { Category, Product } from '../../core/models/product.model';
import { ApiResponse } from '../../core/models/api.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container py-8">
      <!-- Admin Header Banner -->
      <div class="admin-header-card mb-6">
        <div class="admin-header-left">
          <div class="console-pill">
            <span class="pulse-dot"></span>
            <span>CLOUDCART ENTERPRISE • LIVE OPERATIONS</span>
          </div>
          <h1 class="console-title">Executive Operations Console</h1>
          <p class="console-subtitle">
            Orchestrate distributed saga orders, catalog SKU lifecycle, and row-level inventory concurrency.
          </p>
        </div>
        <div class="admin-header-right">
          <button (click)="openProductModal()" class="btn-create-product">
            <span>✨</span> Add New Product
          </button>
        </div>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="metrics-grid mb-6">
        <div class="kpi-card revenue-kpi">
          <div class="kpi-top">
            <span class="kpi-label">Total Net Revenue</span>
            <span class="kpi-icon-wrap bg-pink-light">💰</span>
          </div>
          <div class="kpi-val">₹{{ totalRevenue | number:'1.2-2' }}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-up">▲ Active</span>
            <span class="kpi-hint">From {{ totalOrdersCount }} customer orders</span>
          </div>
        </div>

        <div class="kpi-card orders-kpi">
          <div class="kpi-top">
            <span class="kpi-label">Total Orders</span>
            <span class="kpi-icon-wrap bg-blue-light">📦</span>
          </div>
          <div class="kpi-val">{{ totalOrdersCount }}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-neutral">● Saga Tracked</span>
            <span class="kpi-hint">Across distributed services</span>
          </div>
        </div>

        <div class="kpi-card catalog-kpi">
          <div class="kpi-top">
            <span class="kpi-label">Active Catalog SKUs</span>
            <span class="kpi-icon-wrap bg-purple-light">🛍️</span>
          </div>
          <div class="kpi-val">{{ products.length }}</div>
          <div class="kpi-footer">
            <span class="kpi-trend trend-up">✓ In-Stock</span>
            <span class="kpi-hint">{{ categories.length }} Categories mapped</span>
          </div>
        </div>

        <div class="kpi-card stock-kpi">
          <div class="kpi-top">
            <span class="kpi-label">Low Stock Alerts</span>
            <span class="kpi-icon-wrap bg-amber-light">⚠️</span>
          </div>
          <div class="kpi-val" [class.val-alert]="lowStockCount > 0">{{ lowStockCount }}</div>
          <div class="kpi-footer">
            <span class="kpi-trend" [ngClass]="lowStockCount > 0 ? 'trend-alert' : 'trend-up'">
              {{ lowStockCount > 0 ? 'Action Needed' : 'Nominal' }}
            </span>
            <span class="kpi-hint">SKUs below 20 units</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="console-tabs-wrap mb-6">
        <button [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'" class="console-tab">
          <span class="tab-icon">📋</span>
          <span>Order Fulfillment</span>
          <span class="tab-badge">{{ orders.length }}</span>
        </button>
        <button [class.active]="activeTab === 'products'" (click)="activeTab = 'products'" class="console-tab">
          <span class="tab-icon">📦</span>
          <span>Product Catalog</span>
          <span class="tab-badge">{{ products.length }}</span>
        </button>
        <button [class.active]="activeTab === 'inventory'" (click)="activeTab = 'inventory'" class="console-tab">
          <span class="tab-icon">📊</span>
          <span>Inventory & Concurrency</span>
        </button>
      </div>

      <!-- TAB 1: Order Fulfillment -->
      <div *ngIf="activeTab === 'orders'" class="admin-panel card">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Order Fulfillment & Distributed Saga Lifecycle</h2>
            <p class="panel-subtitle">Update order states directly; triggers downstream inventory and notification workflows.</p>
          </div>
          <span class="panel-tag">Live Order Ledger</span>
        </div>

        <div class="table-responsive">
          <table class="luxe-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer / Email</th>
                <th>Timestamp</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Update State</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders" class="table-row">
                <td>
                  <a [routerLink]="['/orders', order.orderNumber]" class="order-ref-link">
                    {{ order.orderNumber }}
                  </a>
                </td>
                <td>
                  <div class="user-meta">
                    <span class="user-email-text">{{ order.userEmail || ('Customer #' + order.userId) }}</span>
                    <span class="user-id-sub">UID: #{{ order.userId }}</span>
                  </div>
                </td>
                <td class="text-muted text-sm">{{ order.createdAt | date:'mediumDate' }} • {{ order.createdAt | date:'shortTime' }}</td>
                <td class="order-amount">₹{{ order.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusBadgeClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td>
                  <select
                    [ngModel]="order.status"
                    (ngModelChange)="onOrderStatusChange(order.orderNumber, $event)"
                    class="status-select"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="6" class="empty-table-state">
                  <span>📦</span>
                  <p>No customer orders placed yet.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: Product Catalog -->
      <div *ngIf="activeTab === 'products'" class="admin-panel card">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Product Catalog Administration</h2>
            <p class="panel-subtitle">Manage catalog visibility, SKUs, category classifications, and pricing.</p>
          </div>
          <button (click)="openProductModal()" class="btn-panel-action">+ Add Product</button>
        </div>

        <div class="table-responsive">
          <table class="luxe-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price (INR)</th>
                <th>Catalog State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products" class="table-row">
                <td><span class="sku-chip">{{ product.sku }}</span></td>
                <td>
                  <div class="product-cell-name">
                    <span class="p-name">{{ product.name }}</span>
                  </div>
                </td>
                <td><span class="category-chip">{{ product.categoryName || 'General' }}</span></td>
                <td class="order-amount">₹{{ product.price | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="product.active ? 'badge-success' : 'badge-danger'">
                    {{ product.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button
                    (click)="toggleProductActive(product)"
                    class="btn-toggle-active"
                    [class.btn-deactivate]="product.active"
                  >
                    {{ product.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: Inventory Management -->
      <div *ngIf="activeTab === 'inventory'" class="admin-panel card">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Inventory Stock & Concurrency Controller</h2>
            <p class="panel-subtitle">Direct pessimistic row-level locking ensures zero overselling across high-traffic flash sales.</p>
          </div>
          <span class="panel-tag">Pessimistic Lock Active</span>
        </div>

        <div class="table-responsive">
          <table class="luxe-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Current In-Stock</th>
                <th>Replenish / Set Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventoryItems" class="table-row">
                <td><span class="sku-chip">{{ item.sku }}</span></td>
                <td class="font-bold">{{ item.productName }}</td>
                <td>
                  <span class="badge" [ngClass]="item.stockQuantity > 20 ? 'badge-success' : (item.stockQuantity > 0 ? 'badge-warning' : 'badge-danger')">
                    {{ item.stockQuantity }} units available
                  </span>
                </td>
                <td>
                  <div class="stock-action-cell">
                    <input type="number" [(ngModel)]="item.newStock" min="0" class="stock-num-input" />
                    <button (click)="updateStock(item)" class="btn-update-stock">Save</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Product Modal -->
      <div *ngIf="showProductModal" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <span class="badge badge-primary mb-1">Catalog Expansion</span>
              <h2 class="modal-title">Add New Product to Catalog</h2>
            </div>
            <button (click)="closeProductModal()" class="modal-close-btn" aria-label="Close modal">×</button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onCreateProduct()" class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="modal-label">Product SKU *</label>
                <input type="text" formControlName="sku" class="modal-input" placeholder="e.g. LUXE-AIR-01" />
              </div>
              <div class="form-group">
                <label class="modal-label">Selling Price (₹) *</label>
                <input type="number" formControlName="price" class="modal-input" placeholder="2499.00" step="0.01" />
              </div>
            </div>

            <div class="form-group">
              <label class="modal-label">Product Title *</label>
              <input type="text" formControlName="name" class="modal-input" placeholder="e.g. Bang & Olufsen Beoplay HX Wireless Headphones" />
            </div>

            <div class="form-group">
              <label class="modal-label">Category *</label>
              <select formControlName="categoryId" class="modal-input">
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="modal-label">Description</label>
              <textarea formControlName="description" class="modal-input" rows="3" placeholder="Highlight technical specs, warranty, driver size, battery life..."></textarea>
            </div>

            <div class="form-group">
              <label class="modal-label">High-Resolution Image URL</label>
              <input type="text" formControlName="imageUrl" class="modal-input" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="modal-actions">
              <button type="button" (click)="closeProductModal()" class="btn-modal-cancel">Cancel</button>
              <button type="submit" [disabled]="productForm.invalid" class="btn-modal-submit">Publish Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3.5rem; }

    /* Admin Header Card */
    .admin-header-card {
      background: linear-gradient(135deg, #1e2232 0%, #11131a 100%);
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
    }
    .admin-header-card::before {
      content: '';
      position: absolute;
      top: -60px;
      right: -60px;
      width: 220px;
      height: 220px;
      background: radial-gradient(circle, rgba(255, 63, 108, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }
    .console-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      background: rgba(255, 63, 108, 0.15);
      border: 1px solid rgba(255, 63, 108, 0.3);
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #ff527b;
      margin-bottom: 10px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #ff3f6c;
      border-radius: 50%;
      box-shadow: 0 0 8px #ff3f6c;
      animation: pulse 1.8s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .console-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 6px 0;
      letter-spacing: -0.4px;
    }
    .console-subtitle {
      font-size: 0.88rem;
      color: rgba(255, 255, 255, 0.65);
      margin: 0;
      max-width: 600px;
      line-height: 1.5;
    }
    .btn-create-product {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(105deg, #ff3f6c 0%, #ff527b 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.85rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(255, 63, 108, 0.4);
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-create-product:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 63, 108, 0.5);
    }

    /* KPI Metrics Cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .kpi-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      padding: 20px 22px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
      border: 1px solid var(--border-color);
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
    .revenue-kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ff3f6c, #f43397);
    }
    .orders-kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #06b6d4);
    }
    .catalog-kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #8b5cf6, #ec4899);
    }
    .stock-kpi::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #f59e0b, #ef4444);
    }

    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .kpi-label {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .bg-pink-light { background: #fff0f3; }
    .bg-blue-light { background: #eff6ff; }
    .bg-purple-light { background: #f5f3ff; }
    .bg-amber-light { background: #fffbeb; }

    .kpi-val {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .val-alert { color: #dc2626; }

    .kpi-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.74rem;
    }
    .kpi-trend {
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.68rem;
    }
    .trend-up { background: #ecfdf5; color: #059669; }
    .trend-neutral { background: #eff6ff; color: #2563eb; }
    .trend-alert { background: #fef2f2; color: #dc2626; }
    .kpi-hint { color: var(--text-muted); font-weight: 500; }

    /* Console Tabs */
    .console-tabs-wrap {
      display: flex;
      gap: 12px;
      background: #ffffff;
      padding: 6px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
      overflow-x: auto;
    }
    .console-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .console-tab:hover {
      background: #f8f9fa;
      color: var(--secondary);
    }
    .console-tab.active {
      background: #282c3f;
      color: #ffffff;
    }
    .tab-icon { font-size: 1rem; }
    .tab-badge {
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 800;
      background: rgba(255, 63, 108, 0.15);
      color: #ff3f6c;
    }
    .console-tab.active .tab-badge {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    /* Admin Panel Card */
    .admin-panel {
      background: #ffffff;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 24px;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .panel-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--secondary);
      margin: 0 0 4px 0;
    }
    .panel-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin: 0;
    }
    .panel-tag {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary);
      background: rgba(255, 63, 108, 0.08);
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 63, 108, 0.2);
    }
    .btn-panel-action {
      background: #282c3f;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .btn-panel-action:hover { background: #11131a; }

    /* Luxe Data Table */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .luxe-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .luxe-table th {
      text-align: left;
      padding: 12px 14px;
      background: #fbfbfc;
      border-bottom: 2px solid var(--border-color);
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .luxe-table td {
      padding: 14px 14px;
      border-bottom: 1px solid #f1f3f7;
      vertical-align: middle;
    }
    .table-row:hover { background: #fafbfc; }

    .order-ref-link {
      color: var(--primary);
      font-weight: 800;
      font-family: monospace;
      font-size: 0.88rem;
      text-decoration: none;
    }
    .order-ref-link:hover { text-decoration: underline; }

    .user-meta { display: flex; flex-direction: column; gap: 2px; }
    .user-email-text { font-weight: 600; color: var(--secondary); font-size: 0.85rem; }
    .user-id-sub { font-size: 0.72rem; color: var(--text-muted); }

    .order-amount {
      font-weight: 800;
      color: var(--secondary);
    }

    .status-select {
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      font-size: 0.78rem;
      font-weight: 700;
      background: #ffffff;
      color: var(--secondary);
      outline: none;
      cursor: pointer;
    }
    .status-select:focus { border-color: var(--primary); }

    .sku-chip {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #334155;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .category-chip {
      font-size: 0.75rem;
      font-weight: 600;
      background: #f8fafc;
      color: #475569;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .product-cell-name .p-name {
      font-weight: 700;
      color: var(--secondary);
    }

    .btn-toggle-active {
      padding: 5px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid #22c55e;
      background: #f0fdf4;
      color: #15803d;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-toggle-active.btn-deactivate {
      border-color: #fca5a5;
      background: #fef2f2;
      color: #dc2626;
    }
    .btn-toggle-active:hover { filter: brightness(0.95); }

    .stock-action-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stock-num-input {
      width: 75px;
      padding: 6px 8px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      outline: none;
    }
    .stock-num-input:focus { border-color: var(--primary); }
    .btn-update-stock {
      background: var(--primary);
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-update-stock:hover { opacity: 0.9; }

    .empty-table-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--text-muted);
    }
    .empty-table-state span { font-size: 2.2rem; display: block; margin-bottom: 8px; }

    /* Modal Styling */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(5px);
      padding: 16px;
    }
    .modal-card {
      width: 100%;
      max-width: 560px;
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
      overflow: hidden;
      animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header {
      padding: 22px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #fbfbfc;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--secondary);
      margin: 0;
    }
    .modal-close-btn {
      background: none;
      border: none;
      font-size: 1.6rem;
      line-height: 1;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
    }
    .modal-close-btn:hover { color: var(--secondary); }

    .modal-body {
      padding: 24px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .modal-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .modal-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
      background: #ffffff;
      box-sizing: border-box;
    }
    .modal-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(255, 63, 108, 0.12);
    }
    textarea.modal-input { resize: vertical; }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
    }
    .btn-modal-cancel {
      padding: 10px 18px;
      border: 1px solid var(--border-color);
      background: #ffffff;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .btn-modal-cancel:hover { background: #f8fafc; }
    .btn-modal-submit {
      padding: 10px 22px;
      border: none;
      background: linear-gradient(105deg, #ff3f6c 0%, #ff527b 100%);
      color: #ffffff;
      border-radius: var(--radius-sm);
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(255, 63, 108, 0.35);
    }
    .btn-modal-submit:hover:not(:disabled) {
      box-shadow: 0 6px 16px rgba(255, 63, 108, 0.5);
    }
    .btn-modal-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 992px) {
      .admin-header-card { flex-direction: column; align-items: flex-start; gap: 20px; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .console-title { font-size: 1.4rem; }
      .metrics-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
      .admin-panel { padding: 16px 12px; }
      .modal-card { max-height: 90vh; overflow-y: auto; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  activeTab: 'orders' | 'products' | 'inventory' = 'orders';

  orders: Order[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  inventoryItems: { sku: string; productName: string; stockQuantity: number; newStock: number }[] = [];

  totalRevenue = 0;
  totalOrdersCount = 0;
  lowStockCount = 0;

  showProductModal = false;
  productForm: FormGroup = this.fb.group({
    sku: ['', Validators.required],
    name: ['', Validators.required],
    price: [null, [Validators.required, Validators.min(0.01)]],
    categoryId: [1, Validators.required],
    description: [''],
    imageUrl: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']
  });

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
  }

  loadOrders() {
    this.orderService.getAllOrders(0, 50).subscribe({
      next: res => {
        if (res.success) {
          this.orders = res.data.content;
          this.totalOrdersCount = res.data.totalElements;
          this.totalRevenue = this.orders
            .filter(o => o.status !== 'CANCELLED' && o.status !== 'PAYMENT_FAILED')
            .reduce((sum, o) => sum + o.totalAmount, 0);
        }
      }
    });
  }

  loadProducts() {
    this.productService.searchProducts({ size: 50 }).subscribe({
      next: res => {
        if (res.success) {
          this.products = res.data.content;
          this.buildInventoryList();
        }
      }
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: res => { if (res.success) this.categories = res.data; }
    });
  }

  buildInventoryList() {
    this.inventoryItems = this.products.map(p => ({
      sku: p.sku,
      productName: p.name,
      stockQuantity: p.stockQuantity != null ? p.stockQuantity : 100,
      newStock: p.stockQuantity != null ? p.stockQuantity : 100
    }));

    this.lowStockCount = this.inventoryItems.filter(i => i.stockQuantity < 20).length;
  }

  onOrderStatusChange(orderNumber: string, newStatus: OrderStatus) {
    this.orderService.updateOrderStatus(orderNumber, newStatus).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success(`Order ${orderNumber} updated to ${newStatus}`);
          this.loadOrders();
        }
      }
    });
  }

  toggleProductActive(product: Product) {
    this.productService.updateProduct(product.id, { active: !product.active }).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success(`Product status updated`);
          this.loadProducts();
        }
      }
    });
  }

  updateStock(item: { sku: string; newStock: number }) {
    this.http.put<ApiResponse<unknown>>(
      `${environment.apiUrl}/inventory/stock/${item.sku}?quantity=${item.newStock}`, {}
    ).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success(`Inventory for ${item.sku} updated to ${item.newStock}`);
          this.loadProducts();
        }
      }
    });
  }

  openProductModal() {
    this.productForm.reset({
      categoryId: 1,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    });
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
  }

  onCreateProduct() {
    if (this.productForm.invalid) return;

    this.productService.createProduct(this.productForm.value).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success(`Product '${res.data.name}' added to catalog`);
          this.closeProductModal();
          this.loadProducts();
        }
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
