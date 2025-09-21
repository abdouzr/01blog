// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Add this import

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  searchQuery: string = '';
  notificationCount: number = 3; // You can get this from a service later

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Updated method to use the user ID instead of username
  navigateToProfile(): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.router.navigate(['/profile', userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Search functionality
  searchUsers(): void {
    if (this.searchQuery.trim()) {
      // For now, just log the search query
      // You can implement actual search functionality later
      console.log('Searching for:', this.searchQuery.trim());
      
      // Navigate to search results page (create this route later)
      // this.router.navigate(['/search'], { 
      //   queryParams: { q: this.searchQuery.trim() } 
      // });
      
      // Clear search after searching
      this.searchQuery = '';
    }
  }
}