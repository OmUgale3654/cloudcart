import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar-wrapper">
      <!-- Myntra Style Top Offer / Architecture Bar -->
      <div class="top-announcement">
        <div class="container announcement-inner">
          <span class="announcement-pill">⚡ TECH CARNIVAL</span>
          <span class="announcement-text">
            Up to <strong>60% OFF</strong> on Audio, Smartwatches & Gear • Free Delivery on Orders Over ₹999
          </span>
          <span class="announcement-code">CODE: <strong>CLOUDCART500</strong></span>
        </div>
      </div>

      <nav class="navbar container">
        <!-- Brand Monogram & Name -->
        <a routerLink="/" class="brand" (click)="closeMobileMenu()">
          <div class="brand-badge">
            <span class="brand-monogram">CC</span>
          </div>
          <div class="brand-text">
            <span class="brand-title">CLOUD<span>CART</span></span>
            <span class="brand-tagline">LUXE TECH</span>
          </div>
        </a>

        <!-- Category Nav Links (Myntra Style Header Navigation) -->
        <div class="category-nav desktop-only">
          <a routerLink="/products" class="cat-nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            ALL PRODUCTS
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 1 }" class="cat-nav-link" routerLinkActive="active">
            AUDIO
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 2 }" class="cat-nav-link" routerLinkActive="active">
            WEARABLES
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 3 }" class="cat-nav-link" routerLinkActive="active">
            GAMING
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 4 }" class="cat-nav-link" routerLinkActive="active">
            ACCESSORIES
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 5 }" class="cat-nav-link hot-deal" routerLinkActive="active">
            SMART HOME <span class="hot-badge">NEW</span>
          </a>
        </div>

        <!-- Myntra Capsule Search Bar -->
        <div class="search-box desktop-only">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for headphones, smartwatches, gear..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
          />
          <button *ngIf="searchKeyword" (click)="searchKeyword = ''; onSearch()" class="clear-search-btn" title="Clear">✕</button>
        </div>

        <!-- Desktop Right Actions (Myntra Vertical Icon + Label Style) -->
        <div class="nav-actions desktop-only">
          <!-- Profile Dropdown Trigger -->
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestNav">
            <div class="action-item profile-dropdown-wrapper">
              <a routerLink="/orders" class="action-link">
                <span class="action-avatar">{{ user.firstName[0] }}</span>
                <span class="action-label">{{ user.firstName }}</span>
              </a>
              <!-- Hover Menu -->
              <div class="profile-dropdown-card">
                <div class="user-greeting-box">
                  <strong>Hello {{ user.firstName }} {{ user.lastName }}</strong>
                  <span class="user-email-text">{{ user.email }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/orders" class="dropdown-link">📦 My Orders & Tracking</a>
                <a *ngIf="authService.isAdmin()" routerLink="/admin" class="dropdown-link admin-link">
                  🛡️ Admin Management
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()" class="dropdown-logout-btn">Log Out</button>
              </div>
            </div>
          </ng-container>

          <ng-template #guestNav>
            <div class="action-item profile-dropdown-wrapper">
              <a routerLink="/auth/login" class="action-link">
                <span class="action-icon">👤</span>
                <span class="action-label">Profile</span>
              </a>
              <div class="profile-dropdown-card guest-card">
                <p class="guest-msg"><strong>Welcome to CloudCart</strong><br><small>To access wishlist & orders</small></p>
                <a routerLink="/auth/login" class="btn btn-sm btn-primary w-full text-center">LOGIN / SIGN UP</a>
              </div>
            </div>
          </ng-template>

          <!-- Orders Link -->
          <a routerLink="/orders" class="action-item action-link" routerLinkActive="active-action">
            <span class="action-icon">📦</span>
            <span class="action-label">Orders</span>
          </a>

          <!-- Admin Portal Link (if Admin) -->
          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="action-item action-link admin-pill-link" routerLinkActive="active-action">
            <span class="action-icon">🛡️</span>
            <span class="action-label">Admin</span>
          </a>

          <!-- Shopping Bag Link (Myntra Iconic Bag) -->
          <a routerLink="/cart" class="action-item action-link bag-link" routerLinkActive="active-action">
            <div class="bag-icon-wrapper">
              <span class="action-icon">🛍️</span>
              <span class="bag-badge" *ngIf="(cartService.cartCount$ | async) as count">{{ count }}</span>
            </div>
            <span class="action-label">Bag</span>
          </a>
        </div>

        <!-- Mobile Header Icons (Bag + Menu Hamburger) -->
        <div class="mobile-header-actions mobile-only">
          <a routerLink="/cart" class="mobile-bag-icon" (click)="closeMobileMenu()">
            🛍️
            <span class="bag-badge" *ngIf="(cartService.cartCount$ | async) as count">{{ count }}</span>
          </a>

          <button
            class="hamburger-btn"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen"
            aria-label="Toggle Navigation Menu"
          >
            <span class="hamburger-bar" [class.open]="isMobileMenuOpen"></span>
            <span class="hamburger-bar" [class.open]="isMobileMenuOpen"></span>
            <span class="hamburger-bar" [class.open]="isMobileMenuOpen"></span>
          </button>
        </div>
      </nav>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-menu-drawer mobile-only" [class.open]="isMobileMenuOpen">
        <!-- Search bar inside mobile drawer -->
        <div class="mobile-search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search 58+ Indian products..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
          />
          <button (click)="onSearch()" class="mobile-search-btn">Go</button>
        </div>

        <!-- User Status Card in Drawer -->
        <div class="mobile-user-card" *ngIf="authService.currentUser$ | async as user; else mobileGuestHeader">
          <div class="mobile-user-avatar">{{ user.firstName[0] }}</div>
          <div>
            <strong>{{ user.firstName }} {{ user.lastName }}</strong>
            <span class="mobile-user-email">{{ user.email }}</span>
          </div>
        </div>
        <ng-template #mobileGuestHeader>
          <div class="mobile-guest-header">
            <span>Welcome, Guest!</span>
            <div class="mobile-guest-btns">
              <a routerLink="/auth/login" class="btn btn-sm btn-outline-primary" (click)="closeMobileMenu()">Sign In</a>
              <a routerLink="/auth/register" class="btn btn-sm btn-primary" (click)="closeMobileMenu()">Register</a>
            </div>
          </div>
        </ng-template>

        <!-- Categories & Navigation Links -->
        <div class="mobile-nav-links">
          <div class="mobile-section-title">SHOP BY CATEGORY</div>
          <a routerLink="/products" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>🛍️</span> All Products (58 items)
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 1 }" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>🎧</span> Audio & Sound
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 2 }" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>⌚</span> Wearables & Smartwatches
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 3 }" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>💻</span> Computer & Gaming Gear
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 4 }" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>⚡</span> Mobile & Power Accessories
          </a>
          <a routerLink="/products" [queryParams]="{ categoryId: 5 }" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>🏠</span> Smart Home & IoT
          </a>

          <div class="mobile-section-title mt-4">MY ACCOUNT</div>
          <a routerLink="/orders" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>📦</span> My Orders & Tracking
          </a>
          <a routerLink="/cart" class="mobile-nav-link" (click)="closeMobileMenu()">
            <span>🛍️</span> Shopping Bag ({{ (cartService.cartCount$ | async) || 0 }})
          </a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="mobile-nav-link admin" (click)="closeMobileMenu()">
            <span>🛡️</span> Admin Dashboard
          </a>

          <div *ngIf="authService.currentUser$ | async" class="mobile-logout-wrapper">
            <button (click)="logout(); closeMobileMenu()" class="btn btn-outline btn-sm w-full">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(40, 44, 63, 0.08);
      border-bottom: 1px solid var(--border-color);
    }

    /* Top Announcement Bar (Myntra Campaign Style) */
    .top-announcement {
      background: #282c3f;
      color: #ffffff;
      font-size: 0.75rem;
      padding: 6px 0;
      letter-spacing: 0.02em;
    }

    .announcement-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .announcement-pill {
      background: var(--primary);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.6875rem;
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .announcement-text strong {
      color: #ff905a;
    }

    .announcement-code {
      background: rgba(255, 255, 255, 0.12);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
    }

    .announcement-code strong {
      color: #ff527b;
    }

    /* Main Navbar */
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 74px;
      gap: 20px;
    }

    /* Brand Logo */
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-badge {
      width: 42px;
      height: 42px;
      background: var(--primary-gradient);
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(255, 63, 108, 0.35);
      letter-spacing: -0.05em;
    }

    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .brand-title span {
      color: var(--primary);
    }

    .brand-tagline {
      display: block;
      font-size: 0.625rem;
      font-weight: 800;
      color: var(--accent-orange);
      letter-spacing: 0.22em;
    }

    /* Myntra Category Links in Header */
    .category-nav {
      display: flex;
      align-items: center;
      gap: 22px;
      height: 74px;
    }

    .cat-nav-link {
      font-size: 0.8125rem;
      font-weight: 800;
      color: #282c3f;
      letter-spacing: 0.04em;
      height: 100%;
      display: flex;
      align-items: center;
      position: relative;
      transition: color 0.2s ease;
    }

    .cat-nav-link:hover,
    .cat-nav-link.active {
      color: var(--primary);
    }

    .cat-nav-link.active::after,
    .cat-nav-link:hover::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary);
      border-radius: 4px 4px 0 0;
    }

    .hot-badge {
      background: var(--primary);
      color: #ffffff;
      font-size: 0.5625rem;
      padding: 1px 4px;
      border-radius: 3px;
      margin-left: 4px;
      vertical-align: top;
    }

    /* Myntra Capsule Search Bar */
    .search-box {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      background: #f5f5f6;
      border: 1px solid transparent;
      border-radius: 9999px;
      padding: 0 16px;
      height: 44px;
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      background: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(255, 63, 108, 0.12);
    }

    .search-icon {
      font-size: 0.95rem;
      color: #94969f;
      margin-right: 8px;
    }

    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.84rem;
      font-family: inherit;
      color: var(--text-primary);
    }

    .clear-search-btn {
      background: none;
      border: none;
      font-size: 0.75rem;
      color: #94969f;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 50%;
    }

    /* Right Action Items (Icon + Label underneath) */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      position: relative;
    }

    .action-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      color: #282c3f;
      transition: color 0.2s ease;
    }

    .action-link:hover,
    .active-action {
      color: var(--primary) !important;
    }

    .action-icon {
      font-size: 1.15rem;
      line-height: 1;
    }

    .action-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .action-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bag-icon-wrapper {
      position: relative;
      display: inline-block;
    }

    .bag-badge {
      position: absolute;
      top: -6px;
      right: -10px;
      background: var(--primary);
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      min-width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 6px rgba(255, 63, 108, 0.4);
    }

    /* Profile Dropdown Hover Card */
    .profile-dropdown-wrapper {
      position: relative;
      padding: 10px 0;
    }

    .profile-dropdown-card {
      position: absolute;
      top: 100%;
      right: -30px;
      width: 250px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(40, 44, 63, 0.15);
      border: 1px solid var(--border-color);
      padding: 16px;
      display: none;
      z-index: 1001;
      animation: fadeIn 0.2s ease forwards;
    }

    .profile-dropdown-wrapper:hover .profile-dropdown-card {
      display: block;
    }

    .user-greeting-box {
      margin-bottom: 8px;
    }

    .user-greeting-box strong {
      display: block;
      color: var(--secondary);
      font-size: 0.875rem;
    }

    .user-email-text {
      font-size: 0.75rem;
      color: var(--text-muted);
      word-break: break-all;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 10px 0;
    }

    .dropdown-link {
      display: block;
      padding: 8px 0;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #282c3f;
    }

    .dropdown-link:hover {
      color: var(--primary);
    }

    .admin-link {
      color: #8b5cf6;
    }

    .dropdown-logout-btn {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.8125rem;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 0;
    }

    .guest-card {
      text-align: center;
    }

    .guest-msg {
      font-size: 0.8125rem;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }

    /* Mobile Header Icons */
    .mobile-header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .mobile-bag-icon {
      font-size: 1.35rem;
      position: relative;
    }

    .hamburger-btn {
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 6px;
    }

    .hamburger-bar {
      width: 22px;
      height: 2.5px;
      background-color: var(--secondary);
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .hamburger-bar.open:nth-child(1) {
      transform: translateY(7.5px) rotate(45deg);
    }

    .hamburger-bar.open:nth-child(2) {
      opacity: 0;
    }

    .hamburger-bar.open:nth-child(3) {
      transform: translateY(-7.5px) rotate(-45deg);
    }

    /* Mobile Drawer */
    .mobile-menu-drawer {
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s ease-in-out;
      box-shadow: 0 10px 20px rgba(0,0,0,0.08);
    }

    .mobile-menu-drawer.open {
      max-height: 85vh;
      overflow-y: auto;
      padding: 16px 16px 28px;
    }

    .mobile-search-box {
      display: flex;
      align-items: center;
      background: #f5f5f6;
      border-radius: 8px;
      padding: 0 12px;
      margin-bottom: 16px;
    }

    .mobile-search-box input {
      flex: 1;
      padding: 10px 6px;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
    }

    .mobile-search-btn {
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 4px 10px;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .mobile-user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--primary-light);
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 16px;
    }

    .mobile-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    .mobile-user-email {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .mobile-guest-header {
      background: #f8fafc;
      padding: 12px;
      border-radius: 10px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mobile-guest-btns {
      display: flex;
      gap: 8px;
    }

    .mobile-section-title {
      font-size: 0.6875rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      margin-bottom: 8px;
      padding-left: 4px;
    }

    .mobile-nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 12px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      border-radius: 8px;
      transition: background 0.15s ease;
    }

    .mobile-nav-link:hover {
      background: var(--bg-main);
      color: var(--primary);
    }

    .mobile-logout-wrapper {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }

    /* Media Queries */
    @media (min-width: 992px) {
      .mobile-only { display: none !important; }
    }

    @media (max-width: 991px) {
      .desktop-only { display: none !important; }
      .navbar { height: 64px; }
      .brand-badge { width: 36px; height: 36px; font-size: 1.05rem; }
      .brand-title { font-size: 1.15rem; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchKeyword = '';
  isMobileMenuOpen = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe();
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  onSearch(): void {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { keyword: this.searchKeyword.trim() }
      });
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
