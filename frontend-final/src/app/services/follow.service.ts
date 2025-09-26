// frontend/src/app/services/follow.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private apiUrl = 'http://localhost:8081/api/follows';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  followUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/follow/${userId}`, {}).pipe(
      tap(() => {
        // Refresh notifications count after following
        this.notificationService.refreshUnreadCount();
      })
    );
  }

  unfollowUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/unfollow/${userId}`);
  }

  getFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/followers/${userId}`);
  }

  getFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/following/${userId}`);
  }

  isFollowing(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-following/${userId}`);
  }
}