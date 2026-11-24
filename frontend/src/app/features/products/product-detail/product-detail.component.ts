import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="product-page" *ngIf="product; else loadingState">
      <!-- Breadcrumb Bar -->
      <div class="breadcrumb-strip">
        <div class="container">
          <nav class="breadcrumb">
            <a routerLink="/">Home</a>
            <span class="sep">/</span>
            <a routerLink="/products">Products</a>
            <span class="sep">/</span>
            <a [routerLink]="['/products']" [queryParams]="{ categoryId: product.categoryId }">
              {{ product.categoryName || 'Tech' }}
            </a>
            <span class="sep">/</span>
            <span class="active">{{ product.name }}</span>
          </nav>
        </div>
      </div>

      <div class="container py-8">
        <div class="product-detail-layout">
          <!-- Left: Image Showcase & Guarantee Badges -->
          <div class="gallery-col">
            <div class="main-img-card card">
              <img [src]="product.imageUrl" [alt]="product.name" class="main-product-img" />

              <!-- Floating Rating Pill -->
              <div class="img-rating-pill">
                <span class="star">★</span> 4.4
                <span class="divider">|</span>
                <span class="count">2.4k Ratings</span>
              </div>

              <!-- Wishlist Toggle -->
              <button
                class="wishlist-float-btn"
                [class.active]="isWishlisted"
                (click)="toggleWishlist()"
                title="Save to Wishlist"
              >
                {{ isWishlisted ? '❤️' : '🤍' }}
              </button>
            </div>

            <!-- Guarantee Perks Strip (Myntra Trust Icons) -->
            <div class="trust-perks-card card p-4 mt-4">
              <div class="perk-row">
                <span class="perk-icon">🛡️</span>
                <div>
                  <strong>100% Genuine Tech</strong>
                  <p>Sourced directly from verified brands</p>
                </div>
              </div>
              <div class="perk-row">
                <span class="perk-icon">🔄</span>
                <div>
                  <strong>7 Days Easy Replacement</strong>
                  <p>Covers any hardware or transit defects</p>
                </div>
              </div>
              <div class="perk-row">
                <span class="perk-icon">⚡</span>
                <div>
                  <strong>Real-time Stock Guard</strong>
                  <p>Guaranteed inventory lock via pessimistic Saga</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Product Specifications & Purchase Box -->
          <div class="info-col">
            <!-- Brand & SKU -->
            <div class="brand-badge-line">
              <span class="category-pill">{{ product.categoryName || 'ELECTRONICS' }}</span>
              <span class="sku-text">SKU: {{ product.sku }}</span>
            </div>

            <!-- Title -->
            <h1 class="product-full-title">{{ product.name }}</h1>

            <!-- Price Breakdown -->
            <div class="price-box mt-3">
              <div class="price-row">
                <span class="p-current">₹{{ product.price | number:'1.2-2' }}</span>
                <span class="p-mrp">MRP ₹{{ getOriginalPrice(product.price) | number:'1.2-2' }}</span>
                <span class="p-discount">({{ getDiscountPercent() }}% OFF)</span>
              </div>
              <span class="tax-note">Inclusive of all taxes & GST</span>
            </div>

            <!-- Real-time Stock Status Indicator -->
            <div class="stock-status-box mt-4">
              <span *ngIf="product.stockQuantity != null && product.stockQuantity > 10" class="badge badge-success">
                ✓ In Stock ({{ product.stockQuantity }} units ready to ship)
              </span>
              <span *ngIf="product.stockQuantity != null && product.stockQuantity > 0 && product.stockQuantity <= 10" class="badge badge-warning">
                🔥 Hurry! Only {{ product.stockQuantity }} items left in stock
              </span>
              <span *ngIf="product.stockQuantity != null && product.stockQuantity === 0" class="badge badge-danger">
                ✕ Currently Sold Out
              </span>
            </div>

            <!-- Best Offers Card (Myntra Signature Coupon Box) -->
            <div class="coupon-offer-card mt-4">
              <div class="offer-header">
                <span class="tag-icon">🏷️</span>
                <strong>BEST OFFERS FOR YOU</strong>
              </div>
              <ul class="offers-list">
                <li>
                  <strong>Special Price:</strong> Get flat ₹500 off using code <span class="coupon-chip">CLOUDCART500</span>
                </li>
                <li>
                  <strong>Bank Offer:</strong> 10% Instant Discount on HDFC & ICICI Credit Cards
                </li>
                <li>
                  <strong>Partner Offer:</strong> Free express doorstep shipping on orders above ₹999
                </li>
              </ul>
            </div>

            <!-- Purchase Controls (Qty + Add to Bag + Buy Now) -->
            <div class="purchase-action-panel mt-6" *ngIf="product.active && (product.stockQuantity == null || product.stockQuantity > 0); else outOfStockTemplate">
              <div class="qty-selector-row">
                <span class="qty-label">Quantity:</span>
                <div class="qty-pill">
                  <button (click)="decreaseQty()" [disabled]="quantity <= 1">-</button>
                  <span class="qty-val">{{ quantity }}</span>
                  <button (click)="increaseQty()" [disabled]="product.stockQuantity != null && quantity >= product.stockQuantity">+</button>
                </div>
                <span class="subtotal-hint">
                  Subtotal: <strong>₹{{ (product.price * quantity) | number:'1.2-2' }}</strong>
                </span>
              </div>

              <!-- Primary Action Buttons (Add to Bag + Buy Now) -->
              <div class="cta-buttons-grid mt-4">
                <button (click)="addToCart()" class="btn btn-primary btn-lg add-bag-cta">
                  🛍️ ADD TO BAG
                </button>
                <button (click)="buyNow()" class="btn btn-buy-now btn-lg buy-now-cta">
                  ⚡ BUY NOW
                </button>
              </div>
            </div>

            <ng-template #outOfStockTemplate>
              <div class="out-of-stock-card card p-4 mt-6">
                <h3 class="sold-out-title">Currently Sold Out</h3>
                <p>All stock has been reserved. Check back soon as cancelled orders automatically release stock.</p>
              </div>
            </ng-template>

            <!-- Pincode Delivery Estimator (Myntra Classic) -->
            <div class="pincode-card card p-4 mt-6">
              <div class="pincode-header">
                <span class="pin-icon">📍</span>
                <strong>DELIVERY OPTIONS</strong>
              </div>
              <div class="pincode-input-row mt-2">
                <input
                  type="text"
                  [(ngModel)]="pincode"
                  placeholder="Enter 6-digit Pincode"
                  maxlength="6"
                  class="form-control pincode-input"
                />
                <button (click)="checkPincode()" class="btn btn-outline-primary btn-sm check-pin-btn">
                  Check
                </button>
              </div>

              <div class="delivery-result mt-3" *ngIf="pincodeChecked">
                <div class="check-success">
                  <span class="green-tick">✓</span>
                  <div>
                    <strong>Delivery by Tomorrow, 5:00 PM</strong>
                    <p>Free delivery on this order • Cash on Delivery eligible</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Description & Specifications -->
            <div class="product-description-section mt-6">
              <h3 class="specs-title">PRODUCT DETAILS</h3>
              <p class="product-long-desc">{{ product.description }}</p>

              <div class="specs-table-wrapper mt-4">
                <div class="spec-row">
                  <span class="spec-name">Brand / Category</span>
                  <span class="spec-value">{{ product.categoryName || 'General Tech' }}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-name">Model SKU</span>
                  <span class="spec-value">{{ product.sku }}</span>
                </div>
                <div class="spec-row">
                  <span class="spec-name">Currency & Region</span>
                  <span class="spec-value">Indian Rupee (INR ₹) • Pan India</span>
                </div>
                <div class="spec-row">
                  <span class="spec-name">Warranty</span>
                  <span class="spec-value">1 Year Brand Replacement Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <ng-template #loadingState>
      <div class="container py-8">
        <div class="product-detail-layout">
          <div class="skeleton-img skeleton" style="height: 480px; border-radius: 16px;"></div>
          <div class="p-4">
            <div class="skeleton-line skeleton w-1-2 mb-4" style="height: 24px;"></div>
            <div class="skeleton-line skeleton w-full mb-4" style="height: 36px;"></div>
            <div class="skeleton-line skeleton w-3-4 mb-4" style="height: 28px;"></div>
            <div class="skeleton-line skeleton w-full mb-4" style="height: 120px;"></div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-page {
      background: var(--bg-main);
      min-height: calc(100vh - 140px);
    }

    .breadcrumb-strip {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 10px 0;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-muted);
      flex-wrap: wrap;
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

    .py-8 {
      padding: 2rem 0 4rem;
    }

    .product-detail-layout {
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 48px;
      align-items: start;
    }

    /* Left Gallery */
    .gallery-col {
      position: sticky;
      top: 90px;
    }

    .main-img-card {
      position: relative;
      background: #ffffff;
      border-radius: var(--radius-lg);
      overflow: hidden;
      aspect-ratio: 1 / 1;
    }

    .main-product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    .main-product-img:hover {
      transform: scale(1.04);
    }

    .img-rating-pill {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 800;
      color: var(--secondary);
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .img-rating-pill .star {
      color: #14958f;
    }

    .img-rating-pill .divider {
      color: #d4d5d9;
    }

    .img-rating-pill .count {
      color: #94969f;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .wishlist-float-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
    }

    .wishlist-float-btn:hover {
      transform: scale(1.15);
    }

    /* Trust Perks */
    .trust-perks-card {
      background: #ffffff;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .perk-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .perk-icon {
      font-size: 1.35rem;
      flex-shrink: 0;
    }

    .perk-row strong {
      display: block;
      font-size: 0.8125rem;
      color: var(--secondary);
    }

    .perk-row p {
      font-size: 0.725rem;
      color: var(--text-muted);
      margin: 0;
    }

    /* Right Info Column */
    .info-col {
      background: #ffffff;
      padding: 32px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-xs);
    }

    .brand-badge-line {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .category-pill {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .sku-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .product-full-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--secondary);
      line-height: 1.3;
      letter-spacing: -0.02em;
    }

    /* Price Section */
    .price-box {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .p-current {
      font-size: 2rem;
      font-weight: 800;
      color: var(--secondary);
    }

    .p-mrp {
      font-size: 1.1rem;
      color: var(--text-muted);
      text-decoration: line-through;
    }

    .p-discount {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--accent-orange);
    }

    .tax-note {
      display: block;
      font-size: 0.75rem;
      color: #03a685;
      font-weight: 700;
      margin-top: 4px;
    }

    /* Coupon Offer Box */
    .coupon-offer-card {
      background: #fff8fa;
      border: 1px dashed var(--primary);
      border-radius: var(--radius-md);
      padding: 16px;
    }

    .offer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      color: var(--secondary);
      margin-bottom: 8px;
    }

    .offers-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.775rem;
      color: var(--text-secondary);
    }

    .coupon-chip {
      background: var(--primary);
      color: #ffffff;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    /* Quantity & CTAs */
    .qty-selector-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .qty-label {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--secondary);
    }

    .qty-pill {
      display: flex;
      align-items: center;
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .qty-pill button {
      background: #f8fafc;
      border: none;
      width: 36px;
      height: 36px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--secondary);
      transition: background 0.15s ease;
    }

    .qty-pill button:hover:not(:disabled) {
      background: var(--primary-light);
      color: var(--primary);
    }

    .qty-val {
      padding: 0 16px;
      font-weight: 800;
      font-size: 0.95rem;
    }

    .subtotal-hint {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .subtotal-hint strong {
      color: var(--primary);
    }

    .cta-buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .add-bag-cta,
    .buy-now-cta {
      height: 52px;
      font-size: 1rem;
      letter-spacing: 0.03em;
    }

    /* Sold Out */
    .sold-out-card {
      background: var(--danger-light);
      border: 1px solid var(--primary-border);
    }

    .sold-out-title {
      color: var(--danger);
      font-size: 1.1rem;
      margin-bottom: 4px;
    }

    /* Pincode */
    .pincode-card {
      background: #fafafb;
    }

    .pincode-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      color: var(--secondary);
    }

    .pincode-input-row {
      display: flex;
      gap: 8px;
    }

    .pincode-input {
      max-width: 220px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .check-pin-btn {
      padding: 0 16px;
      font-weight: 800;
    }

    .delivery-result {
      font-size: 0.8125rem;
    }

    .check-success {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .green-tick {
      color: #03a685;
      font-weight: 800;
      font-size: 1.1rem;
    }

    .check-success p {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 2px 0 0;
    }

    /* Product Specs Table */
    .specs-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .product-long-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .specs-table-wrapper {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .spec-row {
      display: grid;
      grid-template-columns: 180px 1fr;
      padding: 10px 16px;
      font-size: 0.8125rem;
      border-bottom: 1px solid var(--border-color);
    }

    .spec-row:last-child {
      border-bottom: none;
    }

    .spec-name {
      color: var(--text-muted);
      font-weight: 600;
    }

    .spec-value {
      color: var(--text-primary);
      font-weight: 700;
    }

    /* Responsive */
    @media (max-width: 991px) {
      .product-detail-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .gallery-col {
        position: static;
      }
      .info-col {
        padding: 24px;
      }
      .cta-buttons-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  product: Product | null = null;
  quantity: number = 1;
  isWishlisted: boolean = false;

  pincode: string = '560103';
  pincodeChecked: boolean = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(Number(id)).subscribe({
        next: res => {
          if (res.success && res.data) {
            this.product = res.data;
          }
        }
      });
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQty(): void {
    if (this.product && (this.product.stockQuantity == null || this.quantity < this.product.stockQuantity)) {
      this.quantity++;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: res => {
          if (res.success) {
            this.notificationService.success(`Added ${this.quantity} item(s) to your Shopping Bag!`);
          }
        }
      });
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.quantity).subscribe({
        next: res => {
          if (res.success) {
            this.router.navigate(['/checkout']);
          }
        }
      });
    }
  }

  toggleWishlist(): void {
    this.isWishlisted = !this.isWishlisted;
    if (this.isWishlisted) {
      this.notificationService.success('Saved to your Wishlist!');
    } else {
      this.notificationService.show('info', 'Removed from Wishlist');
    }
  }

  checkPincode(): void {
    if (this.pincode && this.pincode.length === 6) {
      this.pincodeChecked = true;
      this.notificationService.success(`Express delivery confirmed for pincode ${this.pincode}`);
    } else {
      this.notificationService.show('warning', 'Please enter a valid 6-digit Indian PIN code');
    }
  }

  getOriginalPrice(price: number): number {
    return Math.round(price * 1.33);
  }

  getDiscountPercent(): number {
    return this.product ? (25 + (this.product.id % 20)) : 25;
  }
}
