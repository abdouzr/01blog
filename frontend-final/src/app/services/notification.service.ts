// frontend/src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface NotificationUser {
  id: number;
  username: string;
  profilePicture: string;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'post';
  relatedPostId?: number;
  fromUser: NotificationUser;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8081/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  getNotifications(): Observable<Notification[]> {
    console.log('📬 Fetching notifications...');
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => console.log('✅ Received notifications:', notifications.length))
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    console.log('📬 Fetching unread notifications...');
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`).pipe(
      tap(notifications => console.log('✅ Received unread notifications:', notifications.length))
    );
  }

  getUnreadCount(): Observable<number> {
    console.log('🔢 Fetching unread count...');
    return this.http.get<number>(`${this.apiUrl}/count`).pipe(
      tap(count => {
        console.log('✅ Unread count:', count);
        this.unreadCountSubject.next(count);
      })
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAsUnread(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/unread`, {}).pipe(
      tap(() => this.loadUnreadCount())
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  private loadUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  // Method to refresh the unread count (call this after actions that might create notifications)
  refreshUnreadCount(): void {
    this.loadUnreadCount();
  }
}