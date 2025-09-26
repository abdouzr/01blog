// frontend/src/app/services/like.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private apiUrl = 'http://localhost:8081/api/likes';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/${postId}`, {}).pipe(
      tap(() => {
        // Refresh notifications count after liking
        this.notificationService.refreshUnreadCount();
      })
    );
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/post/${postId}`);
  }

  getLikesByPost(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/post/${postId}`);
  }

  getUserLikes(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }
}