import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';
import { CartViewComponent } from './features/cart/cart-view.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderHistoryComponent } from './features/orders/order-history.component';
import { OrderDetailComponent } from './features/orders/order-detail.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'CloudCart | Home' },
  { path: 'products', component: ProductListComponent, title: 'CloudCart | Catalog' },
  { path: 'products/:id', component: ProductDetailComponent, title: 'CloudCart | Product Detail' },
  { path: 'cart', component: CartViewComponent, title: 'CloudCart | Shopping Cart' },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard], title: 'CloudCart | Checkout' },
  { path: 'orders', component: OrderHistoryComponent, canActivate: [authGuard], title: 'CloudCart | Order History' },
  { path: 'orders/:orderNumber', component: OrderDetailComponent, canActivate: [authGuard], title: 'CloudCart | Order Tracking' },
  { path: 'auth/login', component: LoginComponent, title: 'CloudCart | Sign In' },
  { path: 'auth/register', component: RegisterComponent, title: 'CloudCart | Register' },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard], title: 'CloudCart | Operations Console' },
  { path: '**', redirectTo: '' }
];
