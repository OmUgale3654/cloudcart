import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <!-- Brand Header with Myntra Gradient Badge -->
        <div class="auth-header text-center">
          <div class="brand-badge-box mx-auto">
            <span class="monogram">CC</span>
          </div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-sub">Sign in to your CloudCart Luxe account</p>
        </div>

        <!-- Quick Demo Fill Pills for Testing & Evaluation -->
        <div class="demo-pills-card">
          <span class="demo-title">⚡ 1-CLICK DEMO CREDENTIALS</span>
          <div class="pills-grid mt-2">
            <button type="button" (click)="fillCustomerDemo()" class="pill-btn customer">
              👤 Customer Demo
            </button>
            <button type="button" (click)="fillAdminDemo()" class="pill-btn admin">
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        <!-- Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form mt-6">
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="e.g. customer@cloudcart.com"
            />
            <span class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Valid email is required.
            </span>
          </div>

          <div class="form-group">
            <div class="label-flex">
              <label class="form-label">Password *</label>
              <span class="password-hint">Min 6 characters</span>
            </div>
            <input
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="••••••••"
            />
            <span class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password must be at least 6 characters.
            </span>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="btn btn-primary btn-lg w-full submit-auth-btn mt-4"
          >
            <span *ngIf="!loading">SIGN IN →</span>
            <span *ngIf="loading">Authenticating with User Service...</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p class="footer-msg">
            Don't have an account?
            <a routerLink="/auth/register" class="register-link font-bold">Register Now</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 160px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      background: radial-gradient(circle at 50% 20%, #fff0f3 0%, #f5f5f6 60%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: 36px 32px;
      box-shadow: 0 16px 40px rgba(40, 44, 63, 0.1);
      border: 1px solid var(--border-color);
    }

    .brand-badge-box {
      width: 50px;
      height: 50px;
      background: var(--primary-gradient);
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.4rem;
      box-shadow: 0 4px 16px rgba(255, 63, 108, 0.35);
      margin-bottom: 12px;
    }

    .mx-auto {
      margin-left: auto;
      margin-right: auto;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--secondary);
      letter-spacing: -0.02em;
    }

    .auth-sub {
      font-size: 0.84rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Demo Pills */
    .demo-pills-card {
      background: #fafafb;
      border: 1.5px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      margin-top: 20px;
    }

    .demo-title {
      display: block;
      font-size: 0.6875rem;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.08em;
    }

    .pills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .pill-btn {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.775rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .pill-btn.customer {
      background: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary-border);
    }

    .pill-btn.customer:hover {
      background: var(--primary);
      color: #ffffff;
    }

    .pill-btn.admin {
      background: #f3e8ff;
      color: #7e22ce;
      border-color: #d8b4fe;
    }

    .pill-btn.admin:hover {
      background: #7e22ce;
      color: #ffffff;
    }

    .label-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .password-hint {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .submit-auth-btn {
      height: 48px;
      letter-spacing: 0.04em;
    }

    .footer-msg {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .register-link {
      color: var(--primary);
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 28px 20px;
      }
      .pills-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;

  loginForm: FormGroup = this.fb.group({
    email: ['customer@cloudcart.com', [Validators.required, Validators.email]],
    password: ['Customer123!', [Validators.required, Validators.minLength(6)]]
  });

  fillCustomerDemo(): void {
    this.loginForm.patchValue({
      email: 'customer@cloudcart.com',
      password: 'Customer123!'
    });
    this.notificationService.show('info', 'Customer credentials populated');
  }

  fillAdminDemo(): void {
    this.loginForm.patchValue({
      email: 'admin@cloudcart.com',
      password: 'Admin123!'
    });
    this.notificationService.show('info', 'Admin credentials populated');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.success && res.data) {
          this.notificationService.success(`Welcome back, ${res.data.firstName}!`);
          this.cartService.loadCart().subscribe();

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
