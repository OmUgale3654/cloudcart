import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api.model';
import { Order, OrderCreateRequest, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  checkout(request: OrderCreateRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${environment.apiUrl}/orders/checkout`, request);
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${environment.apiUrl}/orders`);
  }

  getOrderByNumber(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderNumber}`);
  }

  cancelOrder(orderNumber: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${environment.apiUrl}/orders/${orderNumber}/cancel`, {});
  }

  getAllOrders(page = 0, size = 10): Observable<ApiResponse<PageResponse<Order>>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<ApiResponse<PageResponse<Order>>>(`${environment.apiUrl}/orders/admin/all`, { params });
  }

  updateOrderStatus(orderNumber: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${environment.apiUrl}/orders/admin/${orderNumber}/status`, { status });
  }
}
