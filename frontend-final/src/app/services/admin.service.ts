import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8081/api/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/users`);
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/ban/${userId}`, {}, { 
      responseType: 'text' 
    });
  }

  unbanUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/unban/${userId}`, {}, { 
      responseType: 'text' 
    });
  }

  // FIXED: Correct endpoint /users/{id} instead of /delete/user/{id}
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`, { 
      responseType: 'text' 
    });
  }

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/posts`);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/posts/${postId}`, { 
      responseType: 'text' 
    });
  }

  getAllReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`);
  }

  resolveReport(reportId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/${reportId}/resolve`, {}, { 
      responseType: 'text' 
    });
  }
}