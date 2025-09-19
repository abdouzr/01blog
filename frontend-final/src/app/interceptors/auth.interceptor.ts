import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token directly from localStorage
  const token = localStorage.getItem('token');
  
  console.log('Auth Interceptor - Raw token from localStorage:', token);
  console.log('Auth Interceptor - Request URL:', req.url);
  
  // Only add Authorization header if token exists and is valid
  if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
    console.log('Auth Interceptor - Adding valid Authorization header');
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  
  console.log('Auth Interceptor - No valid token available, skipping Authorization header');
  return next(req);
};