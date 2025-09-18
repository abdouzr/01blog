// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']})
export class NavbarComponent {

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Assuming you want to go to login after logout
  }

  // --- ADD THIS METHOD ---
  navigateToProfile(): void {
    // You'll need to decide the actual route based on your application structure
    // For example, if your profile route is '/profile' or '/user/:username'
    const username = this.authService.currentUserValue?.username;
    if (username) {
      this.router.navigate(['/profile', username]); // Example: /profile/abdon
    } else {
      // Fallback if username is not available, e.g., redirect to login
      this.router.navigate(['/login']);
    }
  }
}