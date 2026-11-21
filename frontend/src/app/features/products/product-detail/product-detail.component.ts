import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-8" *ngIf="product; else loadingState">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a routerLink="/">Home</a>
        <span>/</span>
        <a routerLink="/products">Products</a>
        <span>/</span>
        <span class="active">{{ product.name }}</span>
      </nav>

      <div class="product-detail-card card">
        <div class="detail-gallery">
          <img [src]="product.imageUrl" [alt]="product.name" class="detail-img" />
          <span class="detail-sku">SKU: {{ product.sku }}</span>
        </div>

        <div class="detail-info">
          <div class="badge-row">
            <span class="badge badge-primary">{{ product.categoryName || 'General' }}</span>

            <!-- Real-time live inventory badge -->
            <span *ngIf="product.stockQuantity != null && product.stockQuantity > 10" class="badge badge-success">
              ✓ In Stock ({{ product.stockQuantity }} units available)
            </span>
            <span *ngIf="product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 10" class="badge badge-warning">
              ⚠ Low Stock: Only {{ product.stockQuantity }} left!
            </span>
            <span *ngIf="product.stockQuantity != null && product.stockQuantity === 0" class="badge badge-danger">
              ✕ Out of Stock
            </span>
          </div>

          <h1 class="detail-title">{{ product.name }}</h1>
          <div class="detail-price">₹{{ product.price | number:'1.2-2' }}</div>

          <p class="detail-description">{{ product.description }}</p>

          <div class="purchase-box" *ngIf="product.active && (product.stockQuantity == null || product.stockQuantity > 0); else outOfStockBox">
            <div class="quantity-picker">
              <label>Quantity:</label>
              <div class="qty-controls">
                <button (click)="decreaseQty()" [disabled]="quantity <= 1">-</button>
                <input type="number" [(ngModel)]="quantity" min="1" [max]="product.stockQuantity || 99" readonly />
                <button (click)="increaseQty()" [disabled]="product.stockQuantity != null && quantity >= product.stockQuantity">+</button>
              </div>
            </div>

            <button (click)="addToCart()" class="btn btn-primary btn-lg add-cart-btn">
              🛒 Add to Shopping Cart
            </button>
          </div>

          <ng-template #outOfStockBox>
            <div class="out-of-stock-alert card p-4">
              <span class="text-danger font-bold">Currently Unavailable</span>
              <p>This item is currently out of stock or reserved in active checkout sagas.</p>
            </div>
          </ng-template>

          <div class="features-list">
            <div class="feature-line">
              <span class="icon">🚚</span>
              <div>
                <strong>Free Standard Shipping</strong>
                <p>Eligible for free shipping on orders over \$50</p>
              </div>
            </div>
            <div class="feature-line">
              <span class="icon">🔒</span>
              <div>
                <strong>Simulated Secure Transaction</strong>
                <p>Protected by Spring Cloud Gateway & JWT authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ng-template #loadingState>
      <div class="container py-8 text-center">
        <div class="spinner"></div>
        <p>Loading real-time product and stock specifications...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    .breadcrumb a { color: var(--text-secondary); text-decoration: none; }
    .breadcrumb a:hover { color: var(--primary); }
    .breadcrumb .active { color: var(--text-primary); font-weight: 600; }
    
    .product-detail-card {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 40px;
      padding: 30px;
      background: #ffffff;
    }
    .detail-gallery {
      position: relative;
      background: #f8fafc;
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
    .detail-img { width: 100%; height: 100%; object-fit: cover; max-height: 480px; }
    .detail-sku {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(15, 23, 42, 0.8);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }
    .detail-info { display: flex; flex-direction: column; }
    .badge-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .detail-title { font-size: 1.85rem; line-height: 1.25; margin-bottom: 12px; color: var(--secondary); }
    .detail-price { font-size: 2rem; font-weight: 800; color: var(--primary); margin-bottom: 18px; }
    .detail-description {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 28px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
    }
    .purchase-box {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    .quantity-picker {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .quantity-picker label { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); }
    .qty-controls {
      display: flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }
    .qty-controls button {
      background: #f1f5f9;
      border: none;
      width: 36px;
      height: 36px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
    }
    .qty-controls button:disabled { opacity: 0.4; cursor: not-allowed; }
    .qty-controls input {
      width: 44px;
      height: 36px;
      border: none;
      text-align: center;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .add-cart-btn { flex: 1; height: 48px; }
    .out-of-stock-alert { background: #fef2f2; border: 1px solid #fecaca; margin-bottom: 24px; border-radius: var(--radius-md); }
    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-top: 1px solid var(--border-color);
      padding-top: 24px;
    }
    .feature-line {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .feature-line .icon { font-size: 1.4rem; }
    .feature-line strong { font-size: 0.85rem; color: var(--secondary); display: block; }
    .feature-line p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 40px auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .product-detail-card { grid-template-columns: 1fr; }
      .purchase-box { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product: Product | null = null;
  quantity = 1;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.productService.getProductById(id).subscribe({
          next: res => { if (res.success) this.product = res.data; }
        });
      }
    });
  }

  increaseQty() {
    if (this.product && (this.product.stockQuantity == null || this.quantity < this.product.stockQuantity)) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity).subscribe();
    }
  }
}
