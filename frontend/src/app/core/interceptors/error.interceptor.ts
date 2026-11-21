import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Session expired or invalid credentials. Please log in.';
        authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission for this action.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflict detected. Please review your request.';
      } else if (error.status === 402) {
        errorMessage = error.error?.message || 'Payment simulation failed.';
      } else if (error.status === 503) {
        errorMessage = 'Service temporarily unavailable. Please retry in a moment.';
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
