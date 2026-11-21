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
      <div class="auth-card card p-8">
        <div class="auth-header text-center mb-6">
          <div class="brand-icon mx-auto mb-2">CC</div>
          <h1>Welcome Back</h1>
          <p class="text-muted">Sign in to your CloudCart account</p>
        </div>

        <!-- Quick Demo Fill Pills -->
        <div class="demo-pills mb-6">
          <span class="demo-label">Demo Quick-Fill:</span>
          <div class="pills-row">
            <button type="button" (click)="fillCustomerDemo()" class="pill customer">
              👤 Customer Demo
            </button>
            <button type="button" (click)="fillAdminDemo()" class="pill admin">
              🛡️ Admin Demo
            </button>
          </div>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" formControlName="email" class="form-control" placeholder="user@example.com" />
            <span class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Valid email is required.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
            <span class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password must be at least 6 characters.
            </span>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn btn-primary btn-lg w-full mt-4">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading">Authenticating with User Service...</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p>Don't have an account? <a routerLink="/auth/register" class="text-primary font-bold">Register</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
    }
    .p-8 { padding: 2rem; }
    @media (max-width: 480px) {
      .auth-page { padding: 24px 12px; }
      .p-8 { padding: 1.5rem 1.25rem; }
      .pills-row { flex-direction: column; gap: 6px; }
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: var(--primary);
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
    }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .auth-header h1 { font-size: 1.5rem; color: var(--secondary); margin-bottom: 4px; }
    .demo-pills {
      background: #f8fafc;
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px;
    }
    .demo-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 8px;
    }
    .pills-row { display: flex; gap: 8px; }
    .pill {
      flex: 1;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
    }
    .pill.customer { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .pill.customer:hover { background: #dbeafe; }
    .pill.admin { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .pill.admin:hover { background: #fde68a; }
    .auth-footer { font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .w-full { width: 100%; }
    .font-bold { font-weight: 700; }
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

  fillCustomerDemo() {
    this.loginForm.patchValue({
      email: 'customer@cloudcart.com',
      password: 'Customer123!'
    });
  }

  fillAdminDemo() {
    this.loginForm.patchValue({
      email: 'admin@cloudcart.com',
      password: 'Admin123!'
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.notificationService.success(`Welcome back, ${res.data.firstName}!`);
          this.cartService.loadCart().subscribe({ error: () => {} });

          const redirect = this.route.snapshot.queryParams['redirect'];
          if (redirect) {
            this.router.navigateByUrl(redirect);
          } else if (res.data.role === 'ROLE_ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
