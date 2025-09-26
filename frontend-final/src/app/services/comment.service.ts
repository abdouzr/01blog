// frontend/src/app/services/comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  authorProfilePicture: string;
  postId: number;
  author: {
    id: number;
    username: string;
    profilePicture: string;
  };
}

export interface CommentRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8081/api/comments';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/post/${postId}`);
  }

  createComment(postId: number, content: string): Observable<Comment> {
    const commentRequest: CommentRequest = { content };
    return this.http.post<Comment>(`${this.apiUrl}/post/${postId}`, commentRequest);
  }

  updateComment(commentId: number, content: string): Observable<Comment> {
    const commentRequest: CommentRequest = { content };
    return this.http.put<Comment>(`${this.apiUrl}/${commentId}`, commentRequest);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}