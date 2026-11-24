import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Category, Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="catalog-page">
      <!-- Breadcrumb Bar -->
      <div class="catalog-breadcrumb-bar">
        <div class="container breadcrumb-inner">
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span class="sep">/</span>
            <span class="active">Tech Products Catalog</span>
          </nav>
          <div class="catalog-count-badge" *ngIf="totalElements > 0">
            <strong>{{ totalElements }}</strong> ITEMS FOUND
          </div>
        </div>
      </div>

      <div class="container py-6">
        <!-- Mobile Filter Toggle Bar -->
        <div class="mobile-filter-bar">
          <button (click)="toggleMobileFilters()" class="btn btn-outline w-full filter-toggle-btn">
            <span>⚙️ {{ mobileFiltersOpen ? 'Close Filters' : 'Filter & Search (' + products.length + ')' }}</span>
            <span *ngIf="selectedCategoryId || keyword || maxPrice < 50000" class="badge badge-primary">Active</span>
          </button>
        </div>

        <div class="catalog-layout">
          <!-- Myntra Sticky Filter Sidebar -->
          <aside class="filter-sidebar" [class.open]="mobileFiltersOpen">
            <div class="card filter-box">
              <div class="filter-header">
                <span class="filter-main-title">FILTERS</span>
                <button (click)="resetFilters()" class="clear-all-btn" *ngIf="selectedCategoryId || keyword || maxPrice < 50000">
                  CLEAR ALL
                </button>
              </div>

              <!-- Category Section -->
              <div class="filter-section">
                <span class="filter-section-title">CATEGORIES</span>
                <div class="filter-options-list">
                  <label class="filter-radio-row">
                    <input type="radio" name="category" [value]="null" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                    <span class="radio-custom"></span>
                    <span class="filter-opt-text">All Categories</span>
                  </label>
                  <label *ngFor="let cat of categories" class="filter-radio-row">
                    <input type="radio" name="category" [value]="cat.id" [(ngModel)]="selectedCategoryId" (change)="applyFilters()" />
                    <span class="radio-custom"></span>
                    <span class="filter-opt-text">{{ cat.name }}</span>
                  </label>
                </div>
              </div>

              <!-- Price Bracket Buttons -->
              <div class="filter-section">
                <span class="filter-section-title">PRICE RANGES</span>
                <div class="price-pills-grid">
                  <button type="button" class="price-chip" [class.active]="maxPrice === 50000" (click)="setPrice(50000)">All</button>
                  <button type="button" class="price-chip" [class.active]="maxPrice === 2000" (click)="setPrice(2000)">Under ₹2K</button>
                  <button type="button" class="price-chip" [class.active]="maxPrice === 5000" (click)="setPrice(5000)">Under ₹5K</button>
                  <button type="button" class="price-chip" [class.active]="maxPrice === 15000" (click)="setPrice(15000)">Under ₹15K</button>
                </div>

                <div class="range-box mt-3">
                  <label class="range-val">Max Price: <strong>₹{{ maxPrice | number }}</strong></label>
                  <input type="range" min="500" max="50000" step="500" [(ngModel)]="maxPrice" (change)="applyFilters()" class="range-slider" />
                </div>
              </div>

              <!-- Keyword Search -->
              <div class="filter-section border-0">
                <span class="filter-section-title">SEARCH KEYWORDS</span>
                <div class="search-input-box">
                  <input
                    type="text"
                    [(ngModel)]="keyword"
                    (keyup.enter)="applyFilters()"
                    placeholder="e.g. Wireless, ANC, Gaming..."
                    class="form-control"
                  />
                  <button (click)="applyFilters()" class="btn btn-sm btn-primary mt-2 w-full">Apply Search</button>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Products Grid Area -->
          <main class="catalog-main">
            <!-- Top Toolbar -->
            <div class="catalog-toolbar card p-4 mb-4">
              <div class="toolbar-left">
                <span class="results-text" *ngIf="totalElements > 0">
                  Showing <strong>{{ products.length }}</strong> of <strong>{{ totalElements }}</strong> items
                </span>

                <!-- Active Filter Tags (Myntra Chip Style) -->
                <div class="active-chips-row" *ngIf="selectedCategoryId || keyword || maxPrice < 50000">
                  <span *ngIf="getSelectedCategoryName() as catName" class="filter-chip">
                    {{ catName }} <button (click)="selectedCategoryId = null; applyFilters()">✕</button>
                  </span>
                  <span *ngIf="maxPrice < 50000" class="filter-chip">
                    Under ₹{{ maxPrice | number }} <button (click)="setPrice(50000)">✕</button>
                  </span>
                  <span *ngIf="keyword" class="filter-chip">
                    "{{ keyword }}" <button (click)="keyword = ''; applyFilters()">✕</button>
                  </span>
                </div>
              </div>

              <!-- Myntra Sort Dropdown -->
              <div class="sort-box">
                <label class="sort-label">Sort by:</label>
                <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-dropdown">
                  <option value="createdAt,desc">Recommended / Newest</option>
                  <option value="price,asc">Price: Low to High</option>
                  <option value="price,desc">Price: High to Low</option>
                  <option value="name,asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            <!-- Products Grid (Myntra 4-Column Layout) -->
            <div class="myntra-grid" *ngIf="!loading && products.length > 0">
              <div *ngFor="let product of products" class="myntra-card card">
                <!-- Image Box -->
                <div class="myntra-img-box">
                  <a [routerLink]="['/products', product.id]">
                    <img [src]="product.imageUrl" [alt]="product.name" class="myntra-img" />
                  </a>

                  <!-- Wishlist Button -->
                  <button
                    class="wishlist-btn"
                    [class.active]="wishlist[product.id]"
                    (click)="toggleWishlist(product.id, $event)"
                    title="Save to Wishlist"
                  >
                    {{ wishlist[product.id] ? '❤️' : '🤍' }}
                  </button>

                  <!-- Rating Pill -->
                  <div class="card-rating-tag">
                    <span class="star-icon">★</span>
                    <span class="score">4.4</span>
                    <span class="sep">|</span>
                    <span class="reviews-count">1.4k</span>
                  </div>
                </div>

                <!-- Product Body Details -->
                <div class="myntra-card-body">
                  <div class="brand-row">
                    <span class="brand-name">{{ product.categoryName || 'TECH' }}</span>
                    <span class="sku-tag">{{ product.sku }}</span>
                  </div>

                  <h3 class="product-name" [title]="product.name">
                    <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
                  </h3>

                  <p class="product-desc">{{ product.description }}</p>

                  <!-- Price Line -->
                  <div class="price-container mt-2">
                    <span class="current-price">₹{{ product.price | number:'1.2-2' }}</span>
                    <span class="original-price">₹{{ getOriginalPrice(product.price) | number:'1.2-2' }}</span>
                    <span class="discount-badge">({{ getDiscountPercent(product.id) }}% OFF)</span>
                  </div>

                  <!-- Add to Bag Button -->
                  <div class="card-action mt-4">
                    <button (click)="addToCart(product.id)" class="btn btn-sm btn-primary w-full add-bag-btn">
                      🛍️ ADD TO BAG
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && products.length === 0" class="empty-state card p-8 text-center">
              <div class="empty-icon">🛍️</div>
              <h3 class="empty-title">We couldn't find any matches!</h3>
              <p class="empty-sub">Please check the spelling or try resetting the filters to view all products.</p>
              <button (click)="resetFilters()" class="btn btn-primary mt-4">Clear All Filters</button>
            </div>

            <!-- Loading Spinner -->
            <div *ngIf="loading" class="myntra-grid">
              <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="card skeleton-card">
                <div class="skeleton-img skeleton"></div>
                <div class="skeleton-content p-4">
                  <div class="skeleton-line skeleton w-1-2 mb-2"></div>
                  <div class="skeleton-line skeleton w-full mb-3"></div>
                  <div class="skeleton-line skeleton w-3-4"></div>
                </div>
              </div>
            </div>

            <!-- Pagination Bar -->
            <div class="pagination-bar" *ngIf="totalPages > 1 && !loading">
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
    </div>
  `,
  styles: [`
    .catalog-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }

    .catalog-breadcrumb-bar {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 10px 0;
    }

    .breadcrumb-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .breadcrumb a {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .breadcrumb a:hover {
      color: var(--primary);
    }

    .breadcrumb .active {
      color: var(--text-primary);
      font-weight: 700;
    }

    .catalog-count-badge {
      font-size: 0.725rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.05em;
    }

    .catalog-count-badge strong {
      color: var(--secondary);
    }

    .py-6 {
      padding-top: 1.5rem;
      padding-bottom: 3rem;
    }

    .catalog-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 28px;
    }

    /* Filter Sidebar */
    .filter-box {
      background: #ffffff;
      border-radius: var(--radius-md);
      position: sticky;
      top: 90px;
    }

    .filter-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-main-title {
      font-size: 0.8125rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.08em;
    }

    .clear-all-btn {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      letter-spacing: 0.04em;
    }

    .filter-section {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }

    .filter-section.border-0 {
      border-bottom: none;
    }

    .filter-section-title {
      display: block;
      font-size: 0.725rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    .filter-options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filter-radio-row {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .filter-radio-row input {
      accent-color: var(--primary);
    }

    .filter-opt-text {
      font-weight: 600;
    }

    .price-pills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }

    .price-chip {
      background: #f5f5f6;
      border: 1px solid transparent;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 0.725rem;
      font-weight: 700;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .price-chip.active,
    .price-chip:hover {
      background: var(--primary-light);
      border-color: var(--primary-border);
      color: var(--primary);
    }

    .range-val {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: block;
      margin-bottom: 4px;
    }

    .range-slider {
      width: 100%;
      accent-color: var(--primary);
    }

    /* Main Toolbar */
    .catalog-toolbar {
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .results-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .active-chips-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-chip {
      background: var(--primary-light);
      color: var(--primary);
      border: 1px solid var(--primary-border);
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: 0.725rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .filter-chip button {
      background: none;
      border: none;
      color: var(--primary);
      cursor: pointer;
      font-size: 0.75rem;
    }

    .sort-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .sort-dropdown {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--secondary);
      outline: none;
      background: #ffffff;
      cursor: pointer;
    }

    /* Myntra Product Grid */
    .myntra-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 22px;
    }

    .myntra-card {
      border-radius: var(--radius-md);
      background: #ffffff;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: all 0.25s ease;
    }

    .myntra-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(40, 44, 63, 0.12);
      border-color: #dcdce0;
    }

    .myntra-img-box {
      position: relative;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #f8fafc;
    }

    .myntra-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .myntra-card:hover .myntra-img {
      transform: scale(1.06);
    }

    .wishlist-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      transition: transform 0.2s ease;
      z-index: 2;
    }

    .wishlist-btn:hover {
      transform: scale(1.15);
    }

    .card-rating-tag {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(6px);
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 0.725rem;
      font-weight: 800;
      color: #282c3f;
      display: flex;
      align-items: center;
      gap: 3px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      z-index: 2;
    }

    .card-rating-tag .star-icon {
      color: #14958f;
    }

    .card-rating-tag .sep {
      color: #d4d5d9;
    }

    .card-rating-tag .reviews-count {
      color: #94969f;
    }

    .myntra-card-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .brand-name {
      font-size: 0.6875rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .sku-tag {
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .product-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-name a:hover {
      color: var(--primary);
    }

    .product-desc {
      font-size: 0.775rem;
      color: var(--text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .card-action {
      margin-top: auto;
    }

    .add-bag-btn {
      letter-spacing: 0.03em;
    }

    /* Empty state */
    .empty-state {
      background: #ffffff;
      padding: 60px 20px;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .empty-title {
      font-size: 1.25rem;
      color: var(--secondary);
      margin-bottom: 6px;
    }

    .empty-sub {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* Skeleton */
    .skeleton-card { height: 380px; }
    .skeleton-img { height: 240px; }
    .skeleton-line { height: 16px; margin-bottom: 8px; }

    /* Pagination */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 40px;
    }

    .page-indicator {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--secondary);
    }

    /* Mobile */
    .mobile-filter-bar {
      display: none;
      margin-bottom: 16px;
    }

    @media (max-width: 991px) {
      .catalog-layout {
        grid-template-columns: 1fr;
      }
      .mobile-filter-bar {
        display: block;
      }
      .filter-sidebar {
        display: none;
      }
      .filter-sidebar.open {
        display: block;
        margin-bottom: 20px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories: Category[] = [];
  products: Product[] = [];
  wishlist: { [id: number]: boolean } = {};

  selectedCategoryId: number | null = null;
  maxPrice: number = 50000;
  keyword: string = '';
  sortBy: string = 'createdAt,desc';

  currentPage: number = 0;
  pageSize: number = 12;
  totalElements: number = 0;
  totalPages: number = 0;
  loading: boolean = false;
  mobileFiltersOpen: boolean = false;

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      }
    });

    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['categoryId'] ? Number(params['categoryId']) : null;
      this.keyword = params['keyword'] || '';
      if (params['maxPrice']) {
        this.maxPrice = Number(params['maxPrice']);
      }
      this.currentPage = params['page'] ? Number(params['page']) : 0;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    const [sortField, sortDirection] = this.sortBy.split(',');

    this.productService.searchProducts({
      categoryId: this.selectedCategoryId || undefined,
      keyword: this.keyword || undefined,
      maxPrice: this.maxPrice < 50000 ? this.maxPrice : undefined,
      page: this.currentPage,
      size: this.pageSize,
      sortBy: sortField,
      direction: sortDirection || 'desc'
    }).subscribe({
      next: res => {
        this.loading = false;
        if (res.success && res.data) {
          this.products = res.data.content;
          this.totalElements = res.data.totalElements;
          this.totalPages = res.data.totalPages;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        categoryId: this.selectedCategoryId || null,
        keyword: this.keyword || null,
        maxPrice: this.maxPrice < 50000 ? this.maxPrice : null,
        page: 0
      },
      queryParamsHandling: 'merge'
    });
    this.mobileFiltersOpen = false;
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.maxPrice = 50000;
    this.keyword = '';
    this.sortBy = 'createdAt,desc';
    this.applyFilters();
  }

  setPrice(price: number): void {
    this.maxPrice = price;
    this.applyFilters();
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(productId: number): void {
    this.cartService.addToCart(productId, 1).subscribe({
      next: res => {
        if (res.success) {
          this.notificationService.success('Added to your Shopping Bag!');
        }
      }
    });
  }

  toggleWishlist(productId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.wishlist[productId] = !this.wishlist[productId];
    if (this.wishlist[productId]) {
      this.notificationService.success('Saved to Wishlist!');
    } else {
      this.notificationService.show('info', 'Removed from Wishlist');
    }
  }

  getSelectedCategoryName(): string | null {
    if (!this.selectedCategoryId) return null;
    const found = this.categories.find(c => c.id === this.selectedCategoryId);
    return found ? found.name : null;
  }

  getOriginalPrice(currentPrice: number): number {
    return Math.round(currentPrice * 1.33);
  }

  getDiscountPercent(productId: number): number {
    return 25 + (productId % 20);
  }
}
