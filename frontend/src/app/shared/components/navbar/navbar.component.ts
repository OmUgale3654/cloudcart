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
      <div class="top-announcement">
        <span>🚀 <strong>CloudCart Cloud-Native Architecture</strong>: Spring Cloud Gateway • PostgreSQL • OpenFeign • Resilience4j</span>
      </div>

      <nav class="navbar container">
        <a routerLink="/" class="brand" (click)="closeMobileMenu()">
          <div class="brand-icon">CC</div>
          <span class="brand-name">Cloud<span>Cart</span></span>
        </a>

        <!-- Desktop Search Box -->
        <div class="search-box desktop-only">
          <input
            type="text"
            placeholder="Search products by title, SKU, or keyword..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
          />
          <button (click)="onSearch()" aria-label="Search">🔍</button>
        </div>

        <!-- Desktop Navigation Actions -->
        <div class="nav-actions desktop-only">
          <a routerLink="/products" class="nav-link" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Catalog</a>

          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="admin-pill" routerLinkActive="active">
            🛡️ Admin Portal
          </a>

          <a routerLink="/cart" class="cart-btn" routerLinkActive="active">
            <span class="cart-icon">🛒</span>
            <span class="cart-label">Cart</span>
            <span class="cart-badge" *ngIf="(cartService.cartCount$ | async) as count">{{ count }}</span>
          </a>

          <ng-container *ngIf="authService.currentUser$ | async as user; else guestNav">
            <div class="user-menu">
              <a routerLink="/orders" class="user-greeting">
                <span class="user-avatar">{{ user.firstName[0] }}</span>
                <span class="user-name">{{ user.firstName }}</span>
              </a>
              <button (click)="logout()" class="btn-logout" title="Sign Out">Sign Out</button>
            </div>
          </ng-container>

          <ng-template #guestNav>
            <div class="auth-buttons">
              <a routerLink="/auth/login" class="btn btn-sm btn-outline">Sign In</a>
              <a routerLink="/auth/register" class="btn btn-sm btn-primary">Register</a>
            </div>
          </ng-template>
        </div>

        <!-- Mobile Header Quick Actions (Cart + Hamburger Toggle) -->
        <div class="mobile-header-actions mobile-only">
          <a routerLink="/cart" class="mobile-cart-icon" (click)="closeMobileMenu()">
            🛒
            <span class="cart-badge" *ngIf="(cartService.cartCount$ | async) as count">{{ count }}</span>
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
        <div class="mobile-search-box">
          <input
            type="text"
            placeholder="Search products..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
          />
          <button (click)="onSearch()" aria-label="Search">🔍</button>
        </div>

        <div class="mobile-nav-links">
          <a routerLink="/products" class="mobile-nav-link" routerLinkActive="active" (click)="closeMobileMenu()">
            🛍️ All Products Catalog
          </a>

          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="mobile-nav-link admin" routerLinkActive="active" (click)="closeMobileMenu()">
            🛡️ Admin Portal
          </a>

          <ng-container *ngIf="authService.currentUser$ | async as user; else mobileGuestNav">
            <a routerLink="/orders" class="mobile-nav-link" routerLinkActive="active" (click)="closeMobileMenu()">
              📦 My Orders & Tracking ({{ user.firstName }})
            </a>
            <div class="mobile-auth-footer">
              <button (click)="logout(); closeMobileMenu()" class="btn btn-outline btn-sm w-full">Sign Out</button>
            </div>
          </ng-container>

          <ng-template #mobileGuestNav>
            <div class="mobile-guest-buttons">
              <a routerLink="/auth/login" class="btn btn-outline w-full text-center" (click)="closeMobileMenu()">Sign In</a>
              <a routerLink="/auth/register" class="btn btn-primary w-full text-center" (click)="closeMobileMenu()">Register</a>
            </div>
          </ng-template>
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
      border-bottom: 1px solid var(--border-color);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .top-announcement {
      background: #0f172a;
      color: #94a3b8;
      font-size: 0.725rem;
      text-align: center;
      padding: 6px 12px;
      line-height: 1.4;
    }
    .top-announcement strong { color: #38bdf8; }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
    }
    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }
    .brand-name {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.03em;
    }
    .brand-name span { color: var(--primary); }
    .search-box {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      padding: 4px 6px 4px 16px;
      transition: all 0.2s ease;
    }
    .search-box:focus-within {
      background: #ffffff;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }
    .search-box input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      font-family: inherit;
      color: var(--text-primary);
    }
    .search-box button {
      background: #ffffff;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .nav-link {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .nav-link:hover, .nav-link.active { color: var(--primary); }
    .admin-pill {
      font-size: 0.8rem;
      font-weight: 700;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 5px 12px;
      border-radius: 9999px;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .admin-pill:hover { background: #fde68a; }
    .cart-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.9rem;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      transition: background 0.15s ease;
    }
    .cart-btn:hover { background: #f1f5f9; }
    .cart-badge {
      background: var(--primary);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-greeting {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-primary);
      font-size: 0.875rem;
      font-weight: 600;
    }
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e0e7ff;
      color: #3730a3;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .btn-logout {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 4px 8px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .btn-logout:hover { background: #f1f5f9; color: var(--danger); }
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Mobile Header Controls */
    .mobile-header-actions {
      display: none;
      align-items: center;
      gap: 14px;
    }
    .mobile-cart-icon {
      position: relative;
      font-size: 1.4rem;
      text-decoration: none;
      color: var(--text-primary);
      display: flex;
      align-items: center;
    }
    .mobile-cart-icon .cart-badge {
      position: absolute;
      top: -6px;
      right: -10px;
      font-size: 0.65rem;
      min-width: 18px;
      height: 18px;
    }
    .hamburger-btn {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      padding: 4px;
      border-radius: 6px;
    }
    .hamburger-bar {
      width: 100%;
      height: 2.5px;
      background-color: var(--secondary);
      border-radius: 2px;
      transition: all 0.25s ease;
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
      display: none;
      background: #ffffff;
      border-top: 1px solid var(--border-color);
      padding: 16px 20px 24px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      animation: fadeIn 0.2s ease-out;
    }
    .mobile-menu-drawer.open {
      display: block;
    }
    .mobile-search-box {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 4px 8px 4px 12px;
      margin-bottom: 16px;
    }
    .mobile-search-box input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.9rem;
      padding: 6px 0;
    }
    .mobile-search-box button {
      background: none;
      border: none;
      font-size: 1rem;
      cursor: pointer;
    }
    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .mobile-nav-link {
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.95rem;
      transition: background 0.15s ease;
    }
    .mobile-nav-link:hover, .mobile-nav-link.active {
      background: var(--primary-light);
      color: var(--primary);
    }
    .mobile-nav-link.admin {
      background: #fffbeb;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .mobile-guest-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .mobile-auth-footer {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #f1f5f9;
    }
    .w-full { width: 100%; }
    .text-center { text-align: center; }

    /* Responsive Breakpoints */
    .mobile-only { display: none; }
    .desktop-only { display: flex; }

    @media (max-width: 900px) {
      .desktop-only { display: none !important; }
      .mobile-only { display: flex; }
      .mobile-menu-drawer.open { display: block; }
      .navbar { height: 60px; }
      .brand-icon { width: 34px; height: 34px; font-size: 1rem; }
      .brand-name { font-size: 1.2rem; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchKeyword = '';
  isMobileMenuOpen = false;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }

    // Auto-close mobile menu on any navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeMobileMenu();
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onSearch() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/products'], { queryParams: { keyword: this.searchKeyword.trim() } });
      this.closeMobileMenu();
    } else {
      this.router.navigate(['/products']);
      this.closeMobileMenu();
    }
  }

  logout() {
    this.authService.logout();
  }
}
