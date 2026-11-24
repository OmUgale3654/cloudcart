import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-wrapper">
      <!-- Trust & Value Proposition Strip (Myntra Guarantee) -->
      <div class="guarantee-strip">
        <div class="container guarantee-grid">
          <div class="guarantee-item">
            <span class="guarantee-icon">🛡️</span>
            <div>
              <strong>100% ORIGINAL GUARANTEE</strong>
              <p>Authentic tech curated directly from certified distributors</p>
            </div>
          </div>
          <div class="guarantee-item">
            <span class="guarantee-icon">🔄</span>
            <div>
              <strong>7-DAY EASY REPLACEMENT</strong>
              <p>Hassle-free replacement for all gadgets & accessories</p>
            </div>
          </div>
          <div class="guarantee-item">
            <span class="guarantee-icon">🚚</span>
            <div>
              <strong>FREE EXPRESS SHIPPING</strong>
              <p>On all Indian orders over ₹999 across 20,000+ pincodes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Columns -->
      <div class="container footer-content">
        <!-- Brand & Mission Column -->
        <div class="footer-col brand-col">
          <div class="brand">
            <div class="brand-badge">CC</div>
            <div class="brand-text">
              <span class="brand-title">CLOUD<span>CART</span></span>
              <span class="brand-sub">ENTERPRISE E-COMMERCE</span>
            </div>
          </div>
          <p class="brand-desc">
            India's cloud-native microservices tech storefront. Engineered with Spring Boot 3, Spring Cloud Gateway, distributed Saga checkout, and Angular 18 for performance, resilience, and scale.
          </p>

          <div class="tech-pills">
            <span class="tech-pill">Java 21</span>
            <span class="tech-pill">Spring Boot 3</span>
            <span class="tech-pill">Spring Cloud Gateway</span>
            <span class="tech-pill">OpenFeign</span>
            <span class="tech-pill">PostgreSQL 16</span>
            <span class="tech-pill">Angular 18</span>
            <span class="tech-pill">Docker & K8s</span>
          </div>
        </div>

        <!-- Online Shopping Column -->
        <div class="footer-col">
          <h4>ONLINE SHOPPING</h4>
          <ul>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 1 }">Audio & Headphones</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 2 }">Smartwatches & Bands</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 3 }">Gaming Gear & Mice</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 4 }">Fast GaN Chargers</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 5 }">Smart Home Automation</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 6 }">Creator Gear & Mics</a></li>
            <li><a routerLink="/products" [queryParams]="{ categoryId: 7 }">Weatherproof Tech Bags</a></li>
          </ul>
        </div>

        <!-- Customer Policies Column -->
        <div class="footer-col">
          <h4>CUSTOMER POLICIES</h4>
          <ul>
            <li><a routerLink="/orders">Track Your Order</a></li>
            <li><a routerLink="/cart">My Shopping Bag</a></li>
            <li><a routerLink="/auth/login">Account Sign In</a></li>
            <li><a routerLink="/auth/register">New Customer Register</a></li>
            <li><span>Simulated UPI & Card Gateway</span></li>
            <li><span>Saga Compensating Rollback</span></li>
            <li><span>PCI-DSS Simulated Vault</span></li>
          </ul>
        </div>

        <!-- Cloud Architecture Column -->
        <div class="footer-col">
          <h4>DISTRIBUTED SYSTEM</h4>
          <ul class="arch-list">
            <li><span>API Gateway <code>:8080</code></span></li>
            <li><span>User Auth <code>:8081</code></span></li>
            <li><span>Product Catalog <code>:8082</code></span></li>
            <li><span>Cart Engine <code>:8083</code></span></li>
            <li><span>Order Saga <code>:8084</code></span></li>
            <li><span>Payment Service <code>:8085</code></span></li>
            <li><span>Inventory Lock <code>:8086</code></span></li>
            <li><span>Notifications <code>:8087</code></span></li>
          </ul>
        </div>
      </div>

      <!-- Payment Gateways & Copyright Bar -->
      <div class="footer-bottom">
        <div class="container bottom-inner">
          <div class="payment-methods">
            <span class="pay-label">100% SECURE SIMULATED PAYMENTS:</span>
            <span class="pay-chip">UPI</span>
            <span class="pay-chip">RuPay</span>
            <span class="pay-chip">Visa</span>
            <span class="pay-chip">Mastercard</span>
            <span class="pay-chip">NetBanking</span>
          </div>

          <div class="copyright-text">
            © 2026 CloudCart Inc. Designed with Myntra & Amazon inspired aesthetics for Enterprise Developer Portfolio.
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background: #282c3f;
      color: #94969f;
      border-top: 1px solid #3e4152;
      margin-top: auto;
    }

    /* Trust Strip */
    .guarantee-strip {
      background: #1b1e2b;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 24px 0;
    }

    .guarantee-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .guarantee-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .guarantee-icon {
      font-size: 2rem;
      background: rgba(255, 255, 255, 0.05);
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .guarantee-item strong {
      display: block;
      color: #ffffff;
      font-size: 0.8125rem;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .guarantee-item p {
      font-size: 0.75rem;
      color: #94969f;
      line-height: 1.4;
    }

    /* Main Content */
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.2fr;
      gap: 40px;
      padding: 50px 1.5rem 40px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .brand-badge {
      width: 36px;
      height: 36px;
      background: var(--primary-gradient);
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .brand-title span {
      color: var(--primary);
    }

    .brand-sub {
      display: block;
      font-size: 0.5625rem;
      font-weight: 800;
      color: #ff905a;
      letter-spacing: 0.2em;
    }

    .brand-desc {
      font-size: 0.8125rem;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #a9abb3;
    }

    .tech-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tech-pill {
      background: rgba(255, 255, 255, 0.06);
      color: #d4d5d9;
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .footer-col h4 {
      font-size: 0.75rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }

    .footer-col ul {
      list-style: none;
    }

    .footer-col li {
      margin-bottom: 10px;
      font-size: 0.8125rem;
    }

    .footer-col a {
      color: #a9abb3;
      transition: color 0.2s ease;
    }

    .footer-col a:hover {
      color: var(--primary);
    }

    .arch-list li span {
      display: flex;
      justify-content: space-between;
      color: #a9abb3;
    }

    .arch-list code {
      color: #38bdf8;
      font-size: 0.75rem;
    }

    /* Bottom strip */
    .footer-bottom {
      border-top: 1px solid #3e4152;
      padding: 24px 0;
      font-size: 0.75rem;
    }

    .bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }

    .payment-methods {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pay-label {
      font-weight: 800;
      color: #ffffff;
      font-size: 0.6875rem;
      letter-spacing: 0.05em;
    }

    .pay-chip {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 700;
    }

    .copyright-text {
      color: #7e818c;
    }

    @media (max-width: 991px) {
      .guarantee-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
    }

    @media (max-width: 640px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
      .bottom-inner {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
