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
      <div class="admin-header mb-6">
        <div>
          <span class="badge badge-warning mb-2">Management Console</span>
          <h1 class="page-title">Executive Operations Dashboard</h1>
        </div>
        <div class="header-actions">
          <button (click)="openProductModal()" class="btn btn-primary">+ Create New Product</button>
        </div>
      </div>

      <!-- KPI Metrics Cards -->
      <div class="metrics-grid mb-6">
        <div class="card metric-card p-6">
          <div class="metric-top">
            <span class="metric-label">Total Revenue</span>
            <span class="metric-icon">💰</span>
          </div>
          <div class="metric-value">₹{{ totalRevenue | number:'1.2-2' }}</div>
          <span class="metric-sub text-success">From {{ totalOrdersCount }} customer orders</span>
        </div>

        <div class="card metric-card p-6">
          <div class="metric-top">
            <span class="metric-label">Total Orders</span>
            <span class="metric-icon">📦</span>
          </div>
          <div class="metric-value">{{ totalOrdersCount }}</div>
          <span class="metric-sub text-muted">Across all microservices</span>
        </div>

        <div class="card metric-card p-6">
          <div class="metric-top">
            <span class="metric-label">Catalog Products</span>
            <span class="metric-icon">🛍️</span>
          </div>
          <div class="metric-value">{{ products.length }}</div>
          <span class="metric-sub text-muted">In {{ categories.length }} categories</span>
        </div>

        <div class="card metric-card p-6">
          <div class="metric-top">
            <span class="metric-label">Low Stock Alerts</span>
            <span class="metric-icon">⚠️</span>
          </div>
          <div class="metric-value text-warning">{{ lowStockCount }}</div>
          <span class="metric-sub text-muted">SKUs below 20 units</span>
        </div>
      </div>

      <!-- Admin Tab Switcher -->
      <div class="tab-bar mb-6">
        <button [class.active]="activeTab === 'orders'" (click)="activeTab = 'orders'" class="tab-btn">
          📋 Order Fulfillment ({{ orders.length }})
        </button>
        <button [class.active]="activeTab === 'products'" (click)="activeTab = 'products'" class="tab-btn">
          📦 Product Catalog ({{ products.length }})
        </button>
        <button [class.active]="activeTab === 'inventory'" (click)="activeTab = 'inventory'" class="tab-btn">
          📊 Inventory & Stock Levels
        </button>
      </div>

      <!-- Tab 1: Orders Management -->
      <div *ngIf="activeTab === 'orders'" class="card p-6">
        <div class="card-header-line mb-4">
          <h2>Order Fulfillment & Status Lifecycle</h2>
          <span class="text-muted text-sm">Update status across distributed saga lifecycle</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>User / Email</th>
                <th>Date</th>
                <th>Total</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td class="font-bold">
                  <a [routerLink]="['/orders', order.orderNumber]" class="text-primary">{{ order.orderNumber }}</a>
                </td>
                <td>{{ order.userEmail || ('User #' + order.userId) }}</td>
                <td class="text-muted">{{ order.createdAt | date:'short' }}</td>
                <td class="font-bold">₹{{ order.totalAmount | number:'1.2-2' }}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Product Management -->
      <div *ngIf="activeTab === 'products'" class="card p-6">
        <div class="card-header-line mb-4">
          <h2>Product Catalog Administration</h2>
          <button (click)="openProductModal()" class="btn btn-sm btn-primary">+ Add Product</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td class="font-mono">{{ product.sku }}</td>
                <td class="font-bold">{{ product.name }}</td>
                <td>{{ product.categoryName || 'General' }}</td>
                <td class="font-bold">₹{{ product.price | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="product.active ? 'badge-success' : 'badge-danger'">
                    {{ product.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button (click)="toggleProductActive(product)" class="btn btn-sm btn-outline">
                    {{ product.active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Inventory Management -->
      <div *ngIf="activeTab === 'inventory'" class="card p-6">
        <div class="card-header-line mb-4">
          <h2>Inventory Stock Levels & Concurrency Management</h2>
          <span class="text-muted text-sm">Directly managed with pessimistic row-level write locks</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Stock Level</th>
                <th>Replenish / Set Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventoryItems">
                <td class="font-mono">{{ item.sku }}</td>
                <td class="font-bold">{{ item.productName }}</td>
                <td>
                  <span class="badge" [ngClass]="item.stockQuantity > 20 ? 'badge-success' : (item.stockQuantity > 0 ? 'badge-warning' : 'badge-danger')">
                    {{ item.stockQuantity }} Available
                  </span>
                </td>
                <td>
                  <div class="stock-input-group">
                    <input type="number" [(ngModel)]="item.newStock" min="0" class="stock-input" />
                    <button (click)="updateStock(item)" class="btn btn-sm btn-primary">Update</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create Product Modal -->
      <div *ngIf="showProductModal" class="modal-backdrop">
        <div class="card modal-content p-6">
          <div class="modal-header mb-4">
            <h2>Add New Product to Catalog</h2>
            <button (click)="closeProductModal()" class="btn-close">×</button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onCreateProduct()">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">SKU *</label>
                <input type="text" formControlName="sku" class="form-control" placeholder="PROD-DEVICE-01" />
              </div>
              <div class="form-group">
                <label class="form-label">Price (₹) *</label>
                <input type="number" formControlName="price" class="form-control" placeholder="1499.00" step="0.01" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="Acoustic Noise-Cancelling Headphones" />
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select formControlName="categoryId" class="form-control">
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea formControlName="description" class="form-control" rows="3" placeholder="Detailed product specifications..."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input type="text" formControlName="imageUrl" class="form-control" placeholder="https://images.unsplash.com/..." />
            </div>

            <div class="modal-footer mt-6">
              <button type="button" (click)="closeProductModal()" class="btn btn-outline">Cancel</button>
              <button type="submit" [disabled]="productForm.invalid" class="btn btn-primary">Save Product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title { font-size: 1.85rem; color: var(--secondary); }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .metric-card { background: #ffffff; }
    .metric-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .metric-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .metric-icon { font-size: 1.4rem; }
    .metric-value { font-size: 1.85rem; font-weight: 800; color: var(--secondary); margin-bottom: 4px; }
    .metric-sub { font-size: 0.75rem; font-weight: 600; }
    
    .tab-bar {
      display: flex;
      gap: 10px;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 2px;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 10px 18px;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-secondary);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -4px;
      transition: all 0.15s ease;
    }
    .tab-btn:hover { color: var(--primary); }
    .tab-btn.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
    }
    
    .card-header-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-header-line h2 { font-size: 1.15rem; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .data-table th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #f1f5f9;
      color: var(--text-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
    }
    .data-table td {
      padding: 14px 12px;
      border-bottom: 1px solid #f1f5f9;
    }
    .status-select {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      font-size: 0.8rem;
      font-weight: 600;
      background: #ffffff;
    }
    .stock-input-group { display: flex; align-items: center; gap: 8px; }
    .stock-input {
      width: 80px;
      padding: 4px 8px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
    }
    .font-mono { font-family: monospace; font-size: 0.8rem; }
    
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      width: 100%;
      max-width: 540px;
      background: #ffffff;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-header h2 { font-size: 1.25rem; }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; }

    @media (max-width: 992px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
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
