import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Category, Product } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-page">
      <!-- 1. Myntra Circular Category Story Bubbles -->
      <section class="category-bubbles-section">
        <div class="container bubbles-container">
          <div
            *ngFor="let cat of categoryBubbles"
            class="bubble-item"
            [routerLink]="['/products']"
            [queryParams]="cat.id ? { categoryId: cat.id } : { maxPrice: 2000 }"
          >
            <div class="bubble-avatar-wrapper" [class.highlight]="cat.isHighlight">
              <img [src]="cat.imageUrl" [alt]="cat.name" class="bubble-img" />
              <span class="bubble-emoji">{{ cat.emoji }}</span>
            </div>
            <span class="bubble-label">{{ cat.name }}</span>
          </div>
        </div>
      </section>

      <!-- 2. Mega Promotional Hero Banner (Myntra + Amazon Style) -->
      <section class="hero-banner-section">
        <div class="container">
          <div class="hero-card">
            <div class="hero-content">
              <div class="hero-badge-row">
                <span class="badge-deal">⚡ GRAND TECH FESTIVAL</span>
                <span class="badge badge-success">✓ 100% GENUINE INDIAN STOCKS</span>
              </div>
              <h1 class="hero-headline">
                Upgrade to Next-Gen Audio, Smartwatches & Creator Gear
              </h1>
              <p class="hero-subtext">
                Explore 58+ curated gadgets with authentic INR pricing. Powered by Spring Cloud microservices, distributed Saga checkout, and 24/7 cloud resilience.
              </p>
              
              <!-- Offer code capsule -->
              <div class="promo-capsule">
                <span class="promo-text">FLAT ₹500 OFF ON FIRST ORDER</span>
                <span class="promo-code">USE CODE: <strong>CLOUDCART500</strong></span>
              </div>

              <div class="hero-cta-group">
                <a routerLink="/products" class="btn btn-primary btn-lg">
                  SHOP ALL PRODUCTS →
                </a>
                <a routerLink="/products" [queryParams]="{ categoryId: 1 }" class="btn btn-outline btn-lg">
                  🎧 Explore Audio
                </a>
              </div>
            </div>

            <!-- Hero Feature Graphic Showcase -->
            <div class="hero-visual">
              <div class="hero-showcase-box">
                <div class="showcase-glow"></div>
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700"
                  alt="Premium Audio Gear"
                  class="showcase-img"
                />
                <div class="floating-badge rating">
                  <span class="star">★</span> 4.8 | 3.4k Reviews
                </div>
                <div class="floating-badge price">
                  <span class="price-drop">PRICE DROP</span>
                  <strong>₹14,999</strong> <del>₹19,999</del> <span class="disc">(25% OFF)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Amazon / Myntra Flash Sale & Deal Countdown Ticker -->
      <section class="container mt-6">
        <div class="deal-ticker-bar card">
          <div class="deal-ticker-left">
            <span class="deal-flame">🔥</span>
            <div>
              <h3 class="deal-heading">DEAL OF THE DAY</h3>
              <p class="deal-sub">Handpicked discounts on high-performance gaming & wearables</p>
            </div>
          </div>

          <div class="deal-timer-box">
            <span class="timer-label">ENDS IN:</span>
            <div class="timer-digits">
              <span class="digit-box">{{ hours }}h</span> :
              <span class="digit-box">{{ minutes }}m</span> :
              <span class="digit-box">{{ seconds }}s</span>
            </div>
            <a routerLink="/products" class="btn btn-sm btn-primary ml-4">VIEW DEALS</a>
          </div>
        </div>
      </section>

      <!-- 4. Shop By Category Grid (Myntra Visual Cards) -->
      <section class="container mt-8">
        <div class="section-title-bar">
          <div>
            <h2 class="section-main-title">SHOP BY CATEGORY</h2>
            <p class="section-sub-title">Explore certified hardware categories with real-time stock</p>
          </div>
          <a routerLink="/products" class="explore-all-link">View All Categories →</a>
        </div>

        <div class="category-cards-grid">
          <div
            *ngFor="let cat of categories"
            class="cat-tile card"
            [routerLink]="['/products']"
            [queryParams]="{ categoryId: cat.id }"
          >
            <div class="cat-tile-img-box">
              <img [src]="cat.imageUrl" [alt]="cat.name" class="cat-tile-img" />
              <div class="cat-tile-gradient"></div>
            </div>
            <div class="cat-tile-info">
              <span class="cat-mini-tag">EXPLORE</span>
              <h3 class="cat-tile-title">{{ cat.name }}</h3>
              <p class="cat-tile-desc">{{ cat.description }}</p>
              <span class="cat-arrow-btn">Shop Now →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. Featured Trending Products (Myntra Style Cards) -->
      <section class="container mt-8 mb-8">
        <div class="section-title-bar">
          <div>
            <h2 class="section-main-title">TRENDING IN INDIA</h2>
            <p class="section-sub-title">Best selling electronics with instant stock reservation</p>
          </div>
          <a routerLink="/products" class="explore-all-link">See All 58 Products →</a>
        </div>

        <div class="myntra-product-grid" *ngIf="products.length > 0; else loadingSkeleton">
          <div *ngFor="let product of products" class="myntra-card card">
            <!-- Product Image & Badges -->
            <div class="myntra-img-box">
              <a [routerLink]="['/products', product.id]">
                <img [src]="product.imageUrl" [alt]="product.name" class="myntra-img" />
              </a>

              <!-- Wishlist Heart Button -->
              <button
                class="wishlist-btn"
                [class.active]="wishlist[product.id]"
                (click)="toggleWishlist(product.id, $event)"
                title="Save to Wishlist"
              >
                {{ wishlist[product.id] ? '❤️' : '🤍' }}
              </button>

              <!-- Star Rating Tag -->
              <div class="card-rating-tag">
                <span class="star-icon">★</span>
                <span class="score">4.4</span>
                <span class="sep">|</span>
                <span class="reviews-count">1.2k</span>
              </div>
            </div>

            <!-- Card Content Body -->
            <div class="myntra-card-body">
              <div class="product-brand-line">
                <span class="brand-name">{{ product.categoryName || 'TECH' }}</span>
                <span class="sku-tag">{{ product.sku }}</span>
              </div>

              <h3 class="product-name" [title]="product.name">
                <a [routerLink]="['/products', product.id]">{{ product.name }}</a>
              </h3>

              <p class="product-short-desc">{{ product.description }}</p>

              <!-- Price Row (Current ₹, MRP Strikethrough, Discount %) -->
              <div class="price-container mt-2">
                <span class="current-price">₹{{ product.price | number:'1.2-2' }}</span>
                <span class="original-price">₹{{ getOriginalPrice(product.price) | number:'1.2-2' }}</span>
                <span class="discount-badge">({{ getDiscountPercent(product.id) }}% OFF)</span>
              </div>

              <!-- Quick Action Button -->
              <div class="myntra-card-actions mt-4">
                <button (click)="addToCart(product.id)" class="btn btn-sm btn-primary w-full add-bag-btn">
                  🛍️ ADD TO BAG
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <ng-template #loadingSkeleton>
          <div class="myntra-product-grid">
            <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="card skeleton-card">
              <div class="skeleton-img skeleton"></div>
              <div class="skeleton-content p-4">
                <div class="skeleton-line skeleton w-1-2 mb-2"></div>
                <div class="skeleton-line skeleton w-full mb-3"></div>
                <div class="skeleton-line skeleton w-3-4"></div>
              </div>
            </div>
          </div>
        </ng-template>
      </section>

      <!-- 6. Cloud Architecture & Enterprise Credibility Banner -->
      <section class="arch-banner-section">
        <div class="container">
          <div class="arch-box">
            <div class="arch-header text-center">
              <span class="badge badge-primary mb-2">MICROSERVICES BACKEND TOPOLOGY</span>
              <h2>Engineered for Enterprise Performance & Scale</h2>
              <p>Each service operates independently with database-per-service isolation, resilience and Saga orchestration</p>
            </div>

            <div class="arch-services-row">
              <div class="arch-svc-card">
                <span class="svc-icon">🌐</span>
                <strong>API Gateway</strong>
                <small>Port 8080 • Netty Routing</small>
              </div>
              <div class="arch-svc-card">
                <span class="svc-icon">🔐</span>
                <strong>User Service</strong>
                <small>Port 8081 • JWT Auth</small>
              </div>
              <div class="arch-svc-card">
                <span class="svc-icon">📦</span>
                <strong>Product Service</strong>
                <small>Port 8082 • 58+ SKUs</small>
              </div>
              <div class="arch-svc-card">
                <span class="svc-icon">🛒</span>
                <strong>Cart Engine</strong>
                <small>Port 8083 • Persistent</small>
              </div>
              <div class="arch-svc-card highlight">
                <span class="svc-icon">🔄</span>
                <strong>Order Saga</strong>
                <small>Port 8084 • Compensating</small>
              </div>
              <div class="arch-svc-card">
                <span class="svc-icon">💳</span>
                <strong>Payment Svc</strong>
                <small>Port 8085 • Simulation</small>
              </div>
              <div class="arch-svc-card">
                <span class="svc-icon">📊</span>
                <strong>Inventory Svc</strong>
                <small>Port 8086 • Lock Guard</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      padding-bottom: 40px;
    }

    /* 1. Category Bubbles Strip (Myntra Circular Stories) */
    .category-bubbles-section {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 14px 0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .bubbles-container {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 0 1rem;
    }

    .bubble-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      text-decoration: none;
      flex-shrink: 0;
      transition: transform 0.2s ease;
    }

    .bubble-item:hover {
      transform: translateY(-2px);
    }

    .bubble-avatar-wrapper {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      border: 2px solid #eaeaec;
      padding: 2px;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .bubble-avatar-wrapper.highlight {
      border: 2px solid var(--primary);
      box-shadow: 0 0 0 2px var(--primary-light);
    }

    .bubble-item:hover .bubble-avatar-wrapper {
      border-color: var(--primary);
    }

    .bubble-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .bubble-emoji {
      position: absolute;
      bottom: -2px;
      right: -2px;
      font-size: 1rem;
      background: #ffffff;
      border-radius: 50%;
      padding: 1px;
    }

    .bubble-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-primary);
      text-align: center;
      max-width: 80px;
      line-height: 1.2;
    }

    /* 2. Mega Promotional Hero Banner */
    .hero-banner-section {
      padding: 24px 0 16px;
    }

    .hero-card {
      background: linear-gradient(135deg, #1b1e2b 0%, #282c3f 60%, #3e1b2f 100%);
      border-radius: var(--radius-xl);
      padding: 48px;
      color: #ffffff;
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      align-items: center;
      gap: 40px;
      box-shadow: 0 16px 40px rgba(40, 44, 63, 0.2);
      position: relative;
      overflow: hidden;
    }

    .hero-card::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 63, 108, 0.2) 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-badge-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .hero-headline {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 16px;
      letter-spacing: -0.03em;
    }

    .hero-subtext {
      font-size: 1rem;
      color: #d4d5d9;
      line-height: 1.6;
      margin-bottom: 24px;
      max-width: 560px;
    }

    .promo-capsule {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px dashed rgba(255, 144, 90, 0.6);
      padding: 8px 16px;
      border-radius: var(--radius-full);
      margin-bottom: 28px;
      font-size: 0.8125rem;
    }

    .promo-text {
      color: #ffffff;
      font-weight: 700;
    }

    .promo-code strong {
      color: #ff905a;
      letter-spacing: 0.05em;
    }

    .hero-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hero-cta-group .btn-outline {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }

    .hero-cta-group .btn-outline:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #ffffff;
    }

    /* Hero Showcase Image */
    .hero-visual {
      display: flex;
      justify-content: center;
      position: relative;
    }

    .hero-showcase-box {
      position: relative;
      width: 100%;
      max-width: 380px;
    }

    .showcase-img {
      width: 100%;
      height: 380px;
      object-fit: cover;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      display: block;
    }

    .floating-badge {
      position: absolute;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 8px 14px;
      border-radius: var(--radius-md);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
      color: var(--text-primary);
      font-size: 0.8125rem;
      animation: pulseGlow 4s infinite ease-in-out;
    }

    .floating-badge.rating {
      top: 16px;
      right: -12px;
      font-weight: 800;
    }

    .floating-badge .star {
      color: #14958f;
    }

    .floating-badge.price {
      bottom: 20px;
      left: -16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .price-drop {
      background: var(--primary);
      color: #ffffff;
      font-size: 0.625rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .floating-badge del {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .floating-badge .disc {
      color: var(--accent-orange);
      font-weight: 800;
      font-size: 0.75rem;
    }

    /* 3. Deal Countdown Bar */
    .deal-ticker-bar {
      background: #ffffff;
      border: 1.5px solid #ffe1e8;
      border-radius: var(--radius-lg);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      box-shadow: 0 4px 16px rgba(255, 63, 108, 0.08);
    }

    .deal-ticker-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .deal-flame {
      font-size: 2rem;
      animation: pulseGlow 2s infinite ease-in-out;
    }

    .deal-heading {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.02em;
    }

    .deal-sub {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .deal-timer-box {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .timer-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.05em;
    }

    .timer-digits {
      font-family: monospace;
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .digit-box {
      background: #282c3f;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 6px;
    }

    /* Section Headers */
    .section-title-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-main-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: 0.02em;
    }

    .section-sub-title {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .explore-all-link {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.02em;
    }

    .explore-all-link:hover {
      text-decoration: underline;
    }

    /* 4. Category Visual Cards Grid */
    .category-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .cat-tile {
      border-radius: var(--radius-lg);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .cat-tile:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(40, 44, 63, 0.12);
    }

    .cat-tile-img-box {
      height: 180px;
      position: relative;
      overflow: hidden;
    }

    .cat-tile-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .cat-tile:hover .cat-tile-img {
      transform: scale(1.08);
    }

    .cat-tile-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(40, 44, 63, 0.7) 100%);
    }

    .cat-tile-info {
      padding: 16px 20px;
      background: #ffffff;
    }

    .cat-mini-tag {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: 0.08em;
    }

    .cat-tile-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--secondary);
      margin: 2px 0 6px;
    }

    .cat-tile-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .cat-arrow-btn {
      font-size: 0.8125rem;
      font-weight: 800;
      color: var(--primary);
    }

    /* 5. Myntra Style Product Grid */
    .myntra-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 24px;
    }

    .myntra-card {
      border-radius: var(--radius-md);
      background: #ffffff;
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .myntra-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(40, 44, 63, 0.12);
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
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .myntra-card:hover .myntra-img {
      transform: scale(1.06);
    }

    /* Wishlist Button */
    .wishlist-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
      transition: transform 0.2s ease, background 0.2s ease;
      z-index: 2;
    }

    .wishlist-btn:hover {
      transform: scale(1.15);
      background: #ffffff;
    }

    .card-rating-tag {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(6px);
      padding: 2px 8px;
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
      font-size: 0.8rem;
    }

    .card-rating-tag .sep {
      color: #d4d5d9;
    }

    .card-rating-tag .reviews-count {
      color: #94969f;
      font-weight: 600;
    }

    .myntra-card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .product-brand-line {
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
      font-size: 0.95rem;
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

    .product-short-desc {
      font-size: 0.775rem;
      color: var(--text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .myntra-card-actions {
      margin-top: auto;
    }

    .add-bag-btn {
      letter-spacing: 0.03em;
    }

    /* Skeleton loader */
    .skeleton-card {
      height: 380px;
    }
    .skeleton-img {
      height: 240px;
    }
    .skeleton-line {
      height: 16px;
      margin-bottom: 8px;
    }
    .w-1-2 { width: 50%; }
    .w-3-4 { width: 75%; }
    .w-full { width: 100%; }

    /* 6. Architecture Banner */
    .arch-banner-section {
      background: #1b1e2b;
      padding: 48px 0;
      margin-top: 40px;
      border-radius: var(--radius-xl);
    }

    .arch-box {
      color: #ffffff;
    }

    .arch-header h2 {
      color: #ffffff;
      font-size: 1.6rem;
      margin-bottom: 8px;
    }

    .arch-header p {
      color: #94969f;
      font-size: 0.875rem;
      max-width: 650px;
      margin: 0 auto 32px;
    }

    .arch-services-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
    }

    .arch-svc-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      padding: 16px;
      text-align: center;
      transition: all 0.2s ease;
    }

    .arch-svc-card.highlight {
      background: rgba(255, 63, 108, 0.12);
      border-color: rgba(255, 63, 108, 0.4);
    }

    .svc-icon {
      font-size: 1.6rem;
      display: block;
      margin-bottom: 8px;
    }

    .arch-svc-card strong {
      display: block;
      font-size: 0.8125rem;
      margin-bottom: 4px;
      color: #ffffff;
    }

    .arch-svc-card small {
      font-size: 0.6875rem;
      color: #7dd3fc;
    }

    /* Responsive */
    @media (max-width: 991px) {
      .hero-card {
        grid-template-columns: 1fr;
        padding: 32px 24px;
        text-align: center;
      }
      .hero-headline { font-size: 1.85rem; }
      .hero-subtext { margin: 0 auto 20px; }
      .promo-capsule { margin: 0 auto 24px; }
      .hero-cta-group { justify-content: center; }
      .hero-visual { display: none; }
      .deal-ticker-bar {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  categories: Category[] = [];
  products: Product[] = [];
  wishlist: { [id: number]: boolean } = {};

  // Deal countdown timer state
  hours = 4;
  minutes = 38;
  seconds = 12;
  private timerInterval: any;

  // Circular Category Story Avatars (Myntra Style)
  categoryBubbles = [
    { id: 1, name: 'Audio', emoji: '🎧', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200', isHighlight: true },
    { id: 2, name: 'Watches', emoji: '⌚', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200', isHighlight: false },
    { id: 3, name: 'Gaming', emoji: '💻', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200', isHighlight: false },
    { id: 4, name: 'Chargers', emoji: '⚡', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200', isHighlight: false },
    { id: 5, name: 'Smart Home', emoji: '🏠', imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200', isHighlight: false },
    { id: 6, name: 'Creator', emoji: '📸', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200', isHighlight: false },
    { id: 7, name: 'Tech Bags', emoji: '🎒', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200', isHighlight: false },
    { id: null, name: 'Under ₹2K', emoji: '🏷️', imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=200', isHighlight: true },
  ];

  ngOnInit(): void {
    this.productService.getCategories().subscribe({
      next: res => {
        if (res.success && res.data) {
          this.categories = res.data;
        }
      }
    });

    this.productService.searchProducts({ page: 0, size: 8, sortBy: 'createdAt', direction: 'desc' }).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.products = res.data.content;
        }
      }
    });

    // Start live countdown timer
    this.timerInterval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        this.seconds = 59;
        if (this.minutes > 0) {
          this.minutes--;
        } else {
          this.minutes = 59;
          if (this.hours > 0) {
            this.hours--;
          }
        }
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
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
      this.notificationService.success('Saved to your Wishlist!');
    } else {
      this.notificationService.show('info', 'Removed from Wishlist');
    }
  }

  getOriginalPrice(currentPrice: number): number {
    return Math.round(currentPrice * 1.33);
  }

  getDiscountPercent(productId: number): number {
    return 25 + (productId % 20);
  }
}
