import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of (notificationService.toasts$ | async) || []"
        class="toast-item"
        [ngClass]="'toast-' + toast.type"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
        <button class="toast-close" (click)="notificationService.remove(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 420px;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      font-size: 0.875rem;
      font-weight: 500;
      animation: slideIn 0.25s ease-out;
    }
    .toast-icon {
      font-weight: 700;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    .toast-success { border-left: 4px solid #10b981; }
    .toast-success .toast-icon { background: #ecfdf5; color: #10b981; }
    .toast-error { border-left: 4px solid #ef4444; }
    .toast-error .toast-icon { background: #fef2f2; color: #ef4444; }
    .toast-warning { border-left: 4px solid #f59e0b; }
    .toast-warning .toast-icon { background: #fffbeb; color: #f59e0b; }
    .toast-info { border-left: 4px solid #3b82f6; }
    .toast-info .toast-icon { background: #eff6ff; color: #3b82f6; }
    .toast-content { flex: 1; color: #1e293b; }
    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
