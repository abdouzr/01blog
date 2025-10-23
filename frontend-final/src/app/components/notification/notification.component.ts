// frontend/src/app/components/notification/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading: boolean = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  get allRead(): boolean {
    // This is the computed property that moves the complex logic out of the template
    return this.notifications.length === 0 || this.notifications.every(n => n.isRead);
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Renamed from 'markAsRead' to 'onMarkAsRead' to avoid the name conflict with the service,
   * though the original issue was likely a caching problem. Using a different name for clarity.
   */
  onMarkAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          // Refresh the notifications list to update the badge/read status
          this.notifications = [...this.notifications];
        },
        error: (error) => console.error('Error marking notification as read:', error)
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(notification => notification.isRead = true);
        this.notifications = [...this.notifications];
      },
      error: (error) => console.error('Error marking all notifications as read:', error)
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
