// Updated navbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchDropdownComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  notificationCount: number = 0;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to real notification count
    this.notificationService.unreadCount$.subscribe(count => {
      this.notificationCount = count;
    });

    // Load initial count
    this.notificationService.getUnreadCount().subscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.router.navigate(['/profile', userId]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}