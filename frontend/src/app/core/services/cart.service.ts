import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { AddToCartRequest, Cart } from '../models/cart.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  loadCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(`${environment.apiUrl}/cart`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.totalItems);
        }
      })
    );
  }

  addToCart(productId: number, quantity = 1): Observable<ApiResponse<Cart>> {
    const payload: AddToCartRequest = { productId, quantity };
    return this.http.post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.totalItems);
          this.notificationService.success('Item added to your shopping cart');
        }
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`, { quantity }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.totalItems);
        }
      })
    );
  }

  removeItem(itemId: number): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
          this.cartCountSubject.next(res.data.totalItems);
          this.notificationService.info('Item removed from cart');
        }
      })
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/cart/clear`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.cartCountSubject.next(0);
      })
    );
  }
}
