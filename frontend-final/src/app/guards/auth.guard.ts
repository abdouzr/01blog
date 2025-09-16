// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // List of public routes that don't require authentication
    const publicRoutes = ['/login', '/register'];
    
    // Check if the current route is public
    const isPublicRoute = publicRoutes.includes(route.routeConfig?.path || '');

    if (isPublicRoute) {
      // If user is already logged in and trying to access login/register, redirect to feed
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/feed']);
        return false;
      }
      // Allow access to public routes for non-authenticated users
      return true;
    }

    // For protected routes, check if user is authenticated
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}