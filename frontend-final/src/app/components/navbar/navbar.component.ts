import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchDropdownComponent],
  templateUrl: './navbar.component.html', // This now correctly points to its own template
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  notificationCount: number = 0;
  private notificationSubscription?: Subscription;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to notification count updates
    if (this.authService.isLoggedIn()) {
      this.notificationSubscription = this.notificationService.unreadCount$.subscribe(
        count => this.notificationCount = count
      );
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
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