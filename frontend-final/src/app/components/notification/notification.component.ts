// frontend/src/app/components/notification/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'like' | 'comment' | 'follow';
  relatedPostId?: number;
  fromUser: {
    id: number;
    username: string;
    profilePicture: string;
  };
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;

  constructor() {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    // Mock data - in real app, you'd call a service
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          message: 'liked your post',
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'like',
          relatedPostId: 123,
          fromUser: {
            id: 2,
            username: 'johndoe',
            profilePicture: 'assets/default-avatar.png'
          }
        },
        {
          id: 2,
          message: 'commented on your post: "Great content!"',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          type: 'comment',
          relatedPostId: 123,
          fromUser: {
            id: 3,
            username: 'janedoe',
            profilePicture: 'assets/default-avatar.png'
          }
        },
        {
          id: 3,
          message: 'started following you',
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'follow',
          fromUser: {
            id: 4,
            username: 'alexsmith',
            profilePicture: 'assets/default-avatar.png'
          }
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  markAsRead(notification: Notification): void {
    notification.isRead = true;
    // In real app, call service to update notification status
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => notification.isRead = true);
    // In real app, call service to update all notifications
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }
}