// src/app/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in AND is an admin
  // This assumes you added the 'isAdmin()' method to your AuthService
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true; // User is an admin, allow access
  }
  
  // Not an admin, redirect to the main feed
  console.warn('Access denied: User is not an admin.');
  router.navigate(['/feed']);
  return false;
};