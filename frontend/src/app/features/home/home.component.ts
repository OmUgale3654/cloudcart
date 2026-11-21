import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container hero-container">
          <div class="hero-content">
            <span class="badge badge-primary mb-4">Enterprise Architecture • Spring Cloud & Angular</span>
            <h1 class="hero-title">Cloud-Native Microservices E-Commerce Platform</h1>
            <p class="hero-subtitle">
              Engineered with clean architecture, distributed Saga checkout orchestration, pessimistic inventory locks, stateless JWT security, and resilient OpenFeign communication.
            </p>
            <div class="hero-cta">
              <a routerLink="/products" class="btn btn-primary btn-lg">Explore Catalog</a>
              <a routerLink="/auth/login" class="btn btn-outline btn-lg">Live Demo Login</a>
            </div>
            <div class="hero-features">
              <div class="feature-item">
                <span class="feature-icon">🛡️</span>
                <span>Stateless JWT Auth</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span>Pessimistic Concurrency</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔄</span>
                <span>Saga Compensations</span>
              </div>
            </div>
          </div>
          <div class="hero-graphic">
            <div class="graphic-card">
              <div class="card-header-bar">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="card-title">Distributed System Topology</span>
              </div>
              <div class="topology-grid">
                <div class="node-box gateway">API Gateway<br><small>:8080</small></div>
                <div class="nodes-row">
                  <div class="node-box service">User Svc<br><small>:8081</small></div>
                  <div class="node-box service">Product<br><small>:8082</small></div>
                  <div class="node-box service">Cart Svc<br><small>:8083</small></div>
                </div>
                <div class="nodes-row">
                  <div class="node-box service highlight">Order Saga<br><small>:8084</small></div>
                  <div class="node-box service">Payment<br><small>:8085</small></div>
                  <div class="node-box service">Inventory<br><small>:8086</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Spotlight -->
      <section class="container mt-6">
        <div class="section-header">
          <div>
            <h2>Shop by Category</h2>
            <p class="section-sub">Engineered hardware, audio gear and productivity peripherals</p>
          </div>
          <a routerLink="/products" class="view-all-link">View all products →</a>
        </div>

        <div class="category-grid">
          <div *ngFor="let cat of categories" class="category-card" [routerLink]="['/products']" [queryParams]="{ categoryId: cat.id }">
            <img [src]="cat.imageUrl" [alt]="cat.name" class="cat-img" />
            <div class="cat-overlay">
              <h3>{{ cat.name }}</h3>
              <p>{{ cat.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="container mt-6">
        <div class="section-header">
          <div>
            <h2>Featured Products</h2>
            <p class="section-sub">Synchronized with live PostgreSQL catalog and real-time inventory</p>
          </div>
        </div>

        <div class="product-grid" *ngIf="products.length > 0; else loadingState">
          <div *ngFor="let product of products" class="card product-card">
            <a [routerLink]="['/products', product.id]" class="product-img-wrapper">
              <img [src]="product.imageUrl" [alt]="product.name" class="product-img" />
              <span class="product-sku">{{ product.sku }}</span>
            </a>
            <div class="product-body">
              <span class="product-category">{{ product.categoryName || 'General' }}</span>
              <h3 class="product-title">
                <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
              </h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-footer">
                <span class="product-price">\${{ product.price | number:'1.2-2' }}</span>
                <button (click)="addToCart(product.id)" class="btn btn-sm btn-primary">
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <ng-template #loadingState>
          <div class="loading-box">
            <div class="spinner"></div>
            <p>Loading real-time catalog from Product Service...</p>
          </div>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .hero-section {
      background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
      border-bottom: 1px solid var(--border-color);
      padding: 70px 0 60px;
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      align-items: center;
      gap: 50px;
    }
    .hero-title {
      font-size: 2.75rem;
      line-height: 1.15;
      color: #0f172a;
      margin-bottom: 18px;
    }
    .hero-subtitle {
      font-size: 1.05rem;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .hero-cta {
      display: flex;
      gap: 16px;
      margin-bottom: 36px;
    }
    .hero-features {
      display: flex;
      gap: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }
    .graphic-card {
      background: #0f172a;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25);
      border: 1px solid #334155;
    }
    .card-header-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.red { background: #ef4444; }
    .dot.yellow { background: #f59e0b; }
    .dot.green { background: #10b981; }
    .card-title { color: #94a3b8; font-size: 0.75rem; font-weight: 600; margin-left: 8px; }
    .topology-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .node-box {
      background: #1e293b;
      color: #ffffff;
      padding: 10px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      border: 1px solid #334155;
    }
    .node-box small { color: #38bdf8; font-weight: 400; }
    .node-box.gateway { background: #1e3a8a; border-color: #3b82f6; }
    .node-box.highlight { background: #065f46; border-color: #10b981; }
    .nodes-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    
    .section-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 24px;
    }
    .section-sub { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
    .view-all-link { color: var(--primary); font-weight: 600; font-size: 0.9rem; text-decoration: none; }
    .view-all-link:hover { text-decoration: underline; }
    
    .category-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .category-card {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      height: 180px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s ease;
    }
    .category-card:hover { transform: translateY(-4px); }
    .cat-img { width: 100%; height: 100%; object-fit: cover; }
    .cat-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.85) 100%);
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      color: #ffffff;
    }
    .cat-overlay h3 { color: #ffffff; font-size: 1.1rem; margin-bottom: 4px; }
    .cat-overlay p { font-size: 0.75rem; color: #cbd5e1; }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .product-img-wrapper {
      position: relative;
      height: 200px;
      background: #f8fafc;
      overflow: hidden;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-img { transform: scale(1.05); }
    .product-sku {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.75);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      backdrop-filter: blur(4px);
    }
    .product-body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-category {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .product-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .product-title a { color: var(--text-primary); text-decoration: none; }
    .product-title a:hover { color: var(--primary); }
    .product-desc {
      font-size: 0.825rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .product-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
    .product-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--secondary);
    }
    .loading-box {
      text-align: center;
      padding: 60px 0;
      color: var(--text-secondary);
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 992px) {
      .hero-container { grid-template-columns: 1fr; }
      .category-grid, .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  categories: Category[] = [];
  products: Product[] = [];

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: res => { if (res.success) this.categories = res.data; }
    });

    this.productService.searchProducts({ size: 8 }).subscribe({
      next: res => { if (res.success) this.products = res.data.content; }
    });
  }

  addToCart(productId: number) {
    this.cartService.addToCart(productId, 1).subscribe();
  }
}
