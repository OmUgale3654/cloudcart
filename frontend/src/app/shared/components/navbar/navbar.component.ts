import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
        <a routerLink="/" class="brand">
          <div class="brand-icon">CC</div>
          <span class="brand-name">Cloud<span>Cart</span></span>
        </a>

        <div class="search-box">
          <input
            type="text"
            placeholder="Search products by title, SKU, or keyword..."
            [(ngModel)]="searchKeyword"
            (keyup.enter)="onSearch()"
          />
          <button (click)="onSearch()" aria-label="Search">🔍</button>
        </div>

        <div class="nav-actions">
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
      </nav>
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
      font-size: 0.75rem;
      text-align: center;
      padding: 6px 12px;
    }
    .top-announcement strong { color: #38bdf8; }
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
      gap: 24px;
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
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.03em;
    }
    .brand-name span { color: var(--primary); }
    .search-box {
      flex: 1;
      max-width: 520px;
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
      gap: 18px;
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
  `]
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchKeyword = '';

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }
  }

  onSearch() {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/products'], { queryParams: { keyword: this.searchKeyword.trim() } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
