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
      <div class="auth-card card p-8">
        <div class="auth-header text-center mb-6">
          <div class="brand-icon mx-auto mb-2">CC</div>
          <h1>Create Your Account</h1>
          <p class="text-muted">Register to start shopping on CloudCart</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
            <label class="form-label">Password *</label>
            <input type="password" formControlName="password" class="form-control" placeholder="At least 6 characters" />
            <span class="form-error" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 6 characters.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Phone Number</label>
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
              <label class="form-label">PIN Code</label>
              <input type="text" formControlName="zipCode" class="form-control" placeholder="560001" />
            </div>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || loading" class="btn btn-primary btn-lg w-full mt-4">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading">Creating account in User Service...</span>
          </button>
        </form>

        <div class="auth-footer text-center mt-6">
          <p>Already have an account? <a routerLink="/auth/login" class="text-primary font-bold">Sign In</a></p>
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
      max-width: 520px;
      background: #ffffff;
    }
    .p-8 { padding: 2rem; }
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
    .form-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .auth-footer { font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .w-full { width: 100%; }
    .font-bold { font-weight: 700; }
    @media (max-width: 540px) {
      .auth-page { padding: 24px 12px; }
      .p-8 { padding: 1.5rem 1.25rem; }
      .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; gap: 10px; }
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
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: [''],
    street: [''],
    city: [''],
    state: [''],
    zipCode: [''],
    country: ['India']
  });

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.notificationService.success('Account created successfully! Welcome to CloudCart.');
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
