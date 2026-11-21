import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api.model';
import { Category, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`);
  }

  searchProducts(params?: {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }): Observable<ApiResponse<PageResponse<Product>>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
      if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId.toString());
      if (params.minPrice != null) httpParams = httpParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice != null) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
      if (params.size != null) httpParams = httpParams.set('size', params.size.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.direction) httpParams = httpParams.set('direction', params.direction);
    }

    return this.http.get<ApiResponse<PageResponse<Product>>>(`${environment.apiUrl}/products`, { params: httpParams });
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`);
  }

  getProductBySku(sku: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiUrl}/products/sku/${sku}`);
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/products/${id}`);
  }
}
