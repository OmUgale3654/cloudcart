import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Category, Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-8">
      <div class="catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="filter-sidebar">
          <div class="card p-5 filter-box">
            <div class="filter-header">
              <h3>Filters</h3>
              <button (click)="resetFilters()" class="btn-link">Reset</button>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <label class="filter-title">Categories</label>
              <div class="filter-options">
                <label class="radio-label">
                  <input type="radio" name="category" [value]="null" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                  <span>All Categories</span>
                </label>
                <label *ngFor="let cat of categories" class="radio-label">
                  <input type="radio" name="category" [value]="cat.id" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                  <span>{{ cat.name }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range Filter -->
            <div class="filter-group">
              <label class="filter-title">Max Price: \${{ maxPrice }}</label>
              <input type="range" min="10" max="500" step="10" [(ngModel)]="maxPrice" (change)="applyFilters()" class="range-slider" />
              <div class="price-range-labels">
                <span>\$10</span>
                <span>\$500</span>
              </div>
            </div>

            <!-- Keyword Search in Sidebar -->
            <div class="filter-group">
              <label class="filter-title">Search Keywords</label>
              <input type="text" [(ngModel)]="keyword" (keyup.enter)="applyFilters()" placeholder="e.g. Wireless, Gaming" class="form-control" />
            </div>
          </div>
        </aside>

        <!-- Product Grid Main Content -->
        <main class="catalog-main">
          <div class="catalog-toolbar">
            <span class="results-count" *ngIf="totalElements > 0">
              Showing <strong>{{ products.length }}</strong> of <strong>{{ totalElements }}</strong> products
            </span>
            <div class="sort-select-wrapper">
              <label>Sort By:</label>
              <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-select">
                <option value="createdAt,desc">Newest Arrivals</option>
                <option value="price,asc">Price: Low to High</option>
                <option value="price,desc">Price: High to Low</option>
                <option value="name,asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="product-grid" *ngIf="!loading && products.length > 0">
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

          <!-- Empty State -->
          <div *ngIf="!loading && products.length === 0" class="empty-state card p-8 text-center">
            <div class="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your search query, selecting another category, or resetting filters.</p>
            <button (click)="resetFilters()" class="btn btn-outline mt-4">Reset All Filters</button>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="loading-box">
            <div class="spinner"></div>
            <p>Fetching products...</p>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar" *ngIf="totalPages > 1">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 0" class="btn btn-sm btn-outline">
              ← Previous
            </button>
            <span class="page-indicator">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages - 1" class="btn btn-sm btn-outline">
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .py-8 { padding-top: 2rem; padding-bottom: 3rem; }
    .catalog-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 30px;
    }
    .p-5 { padding: 1.25rem; }
    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .btn-link {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .filter-group { margin-bottom: 24px; }
    .filter-title {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--secondary);
      margin-bottom: 12px;
    }
    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .range-slider { width: 100%; accent-color: var(--primary); }
    .price-range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .catalog-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .results-count { font-size: 0.875rem; color: var(--text-secondary); }
    .sort-select-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .sort-select {
      padding: 6px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      background: #ffffff;
      font-size: 0.85rem;
      outline: none;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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
    .product-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
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
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-category {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .product-title {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .product-title a { color: var(--text-primary); text-decoration: none; }
    .product-title a:hover { color: var(--primary); }
    .product-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 14px;
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
    .product-price { font-size: 1.15rem; font-weight: 800; color: var(--secondary); }
    .empty-state {
      padding: 60px 20px;
      background: #ffffff;
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 40px;
    }
    .page-indicator { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 40px auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .catalog-layout { grid-template-columns: 1fr; }
      .product-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories: Category[] = [];
  products: Product[] = [];
  loading = false;

  selectedCategoryId: number | null = null;
  keyword = '';
  maxPrice = 500;
  sortBy = 'createdAt,desc';

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  ngOnInit() {
    this.productService.getCategories().subscribe({
      next: res => { if (res.success) this.categories = res.data; }
    });

    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) this.selectedCategoryId = +params['categoryId'];
      if (params['keyword']) this.keyword = params['keyword'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.loading = true;
    const [sortField, sortDir] = this.sortBy.split(',');

    this.productService.searchProducts({
      categoryId: this.selectedCategoryId || undefined,
      keyword: this.keyword.trim() || undefined,
      maxPrice: this.maxPrice < 500 ? this.maxPrice : undefined,
      page: this.currentPage,
      size: 9,
      sortBy: sortField,
      direction: sortDir
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.products = res.data.content;
          this.currentPage = res.data.pageNumber;
          this.totalPages = res.data.totalPages;
          this.totalElements = res.data.totalElements;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.currentPage = 0;
    this.loadProducts();
  }

  resetFilters() {
    this.selectedCategoryId = null;
    this.keyword = '';
    this.maxPrice = 500;
    this.sortBy = 'createdAt,desc';
    this.currentPage = 0;
    this.router.navigate(['/products']);
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(productId: number) {
    this.cartService.addToCart(productId, 1).subscribe();
  }
}
