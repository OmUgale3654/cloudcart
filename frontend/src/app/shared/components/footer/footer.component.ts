import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-wrapper">
      <div class="container footer-content">
        <div class="footer-col brand-col">
          <div class="brand">
            <div class="brand-icon">CC</div>
            <span class="brand-name">Cloud<span>Cart</span></span>
          </div>
          <p class="brand-desc">
            Production-grade, enterprise cloud-native microservices e-commerce platform built with Spring Boot 3, Spring Cloud, Angular, PostgreSQL, Docker, Kubernetes, and AWS ECS.
          </p>
          <div class="tech-tags">
            <span class="tech-tag">Java 21</span>
            <span class="tech-tag">Spring Boot 3</span>
            <span class="tech-tag">Spring Cloud Gateway</span>
            <span class="tech-tag">OpenFeign</span>
            <span class="tech-tag">Resilience4j</span>
            <span class="tech-tag">PostgreSQL</span>
            <span class="tech-tag">Angular 18</span>
            <span class="tech-tag">Docker</span>
            <span class="tech-tag">Kubernetes</span>
            <span class="tech-tag">AWS ECS</span>
          </div>
        </div>

        <div class="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><a routerLink="/products">Shop Catalog</a></li>
            <li><a routerLink="/cart">Shopping Cart</a></li>
            <li><a routerLink="/orders">Order History & Tracking</a></li>
            <li><a routerLink="/auth/login">Customer Login</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Microservices Architecture</h4>
          <ul>
            <li><span>API Gateway (Port 8080)</span></li>
            <li><span>User Service (Port 8081)</span></li>
            <li><span>Product Service (Port 8082)</span></li>
            <li><span>Cart Service (Port 8083)</span></li>
            <li><span>Order Service (Port 8084)</span></li>
            <li><span>Payment Service (Port 8085)</span></li>
            <li><span>Inventory Service (Port 8086)</span></li>
            <li><span>Notification Service (Port 8087)</span></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Security & Observability</h4>
          <ul>
            <li><span>Stateless JWT Authentication</span></li>
            <li><span>Pessimistic Concurrency Locks</span></li>
            <li><span>Distributed Correlation IDs</span></li>
            <li><span>Saga Compensating Rollbacks</span></li>
            <li><span>PCI-DSS Simulated Vault</span></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container bottom-inner">
          <p>© 2026 CloudCart Inc. Designed for Enterprise Developer Portfolio & Technical Evaluation.</p>
          <div class="bottom-links">
            <span>Built with Clean Architecture</span>
            <span>•</span>
            <span>Database-per-Service Pattern</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      background: #0f172a;
      color: #94a3b8;
      border-top: 1px solid #1e293b;
      margin-top: 80px;
    }
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      padding: 60px 1.5rem 40px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      background: #2563eb;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.95rem;
    }
    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
    }
    .brand-name span { color: #38bdf8; }
    .brand-desc {
      font-size: 0.85rem;
      line-height: 1.6;
      color: #64748b;
      margin-bottom: 20px;
    }
    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .tech-tag {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 8px;
      background: #1e293b;
      color: #38bdf8;
      border-radius: 4px;
      border: 1px solid #334155;
    }
    .footer-col h4 {
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 18px;
    }
    .footer-col ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-col ul li a, .footer-col ul li span {
      color: #94a3b8;
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .footer-col ul li a:hover { color: #38bdf8; }
    .footer-bottom {
      border-top: 1px solid #1e293b;
      padding: 20px 0;
      font-size: 0.8rem;
    }
    .bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #64748b;
    }
    .bottom-links {
      display: flex;
      gap: 10px;
    }
    @media (max-width: 900px) {
      .footer-wrapper { margin-top: 48px; }
      .footer-content { grid-template-columns: repeat(2, 1fr); gap: 30px; padding: 40px 1.25rem 30px; }
      .brand-col { grid-column: span 2; }
      .bottom-inner { flex-direction: column; gap: 10px; text-align: center; }
    }
    @media (max-width: 600px) {
      .footer-content { grid-template-columns: 1fr; gap: 24px; }
      .brand-col { grid-column: span 1; }
      .tech-tags { gap: 4px; }
    }
  `]
})
export class FooterComponent {}
