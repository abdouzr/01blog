// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('Auth Interceptor - Token:', token);
  console.log('Auth Interceptor - Request URL:', req.url);
  
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Auth Interceptor - Adding Authorization header');
    return next(clonedReq);
  }
  
  console.log('Auth Interceptor - No token available');
  return next(req);
};