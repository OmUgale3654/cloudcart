import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header text-center">
          <div class="brand-badge-box mx-auto">
            <span class="monogram">CC</span>
          </div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-sub">Join CloudCart Luxe for member deals & tracking</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form mt-6">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">First Name *</label>
              <input type="text" formControlName="firstName" class="form-control" placeholder="Aarav" />
            </div>
            <div class="form-group">
              <label class="form-label">Last Name *</label>
              <input type="text" formControlName="lastName" class="form-control" placeholder="Sharma" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" formControlName="email" class="form-control" placeholder="aarav.sharma@example.com" />
            <span class="form-error" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Valid email is required.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Password * (Min 6 characters)</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" />
            <span class="form-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 6 characters.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number (Optional)</label>
            <input type="tel" formControlName="phone" class="form-control" placeholder="+91 98765 43210" />
          </div>

          <div class="form-group">
            <label class="form-label">Street Address</label>
            <input type="text" formControlName="street" class="form-control" placeholder="12 Brigade Road" />
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">City</label>
              <input type="text" formControlName="city" class="form-control" placeholder="Bengaluru" />
            </div>
            <div class="form-group">
              <label class="form-label">State</label>
              <input type="text" formControlName="state" class="form-control" placeholder="Karnataka" />
            </div>
            <div class="form-group">
              <label class="form-label">Pincode</label>
              <input type="text" formControlName="zipCode" class="form-control" placeholder="560001" />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="btn btn-primary btn-lg w-full submit-auth-btn mt-4"
          >
            <span *ngIf="!loading">CREATE ACCOUNT →</span>
            <span *ngIf="loading">Creating account in User Service...</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p class="footer-msg">
            Already have an account?
            <a routerLink="/auth/login" class="login-link font-bold">Sign In</a>
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
      max-width: 520px;
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

    .submit-auth-btn {
      height: 48px;
      letter-spacing: 0.04em;
    }

    .footer-msg {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .login-link {
      color: var(--primary);
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 28px 20px;
      }
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loading = false;

  registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    street: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    country: ['India']
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.notificationService.success('Registration successful! Please sign in with your credentials.');
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
