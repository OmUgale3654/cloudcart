import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, durationMs = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, message };

    this.toastsSubject.next([...this.toastsSubject.value, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message, 5000);
  }

  info(message: string) {
    this.show('info', message);
  }

  warning(message: string) {
    this.show('warning', message);
  }

  remove(id: string) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
