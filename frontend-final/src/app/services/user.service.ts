// frontend/src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) { }

  searchUsers(query: string): Observable<UserProfile[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<UserProfile[]>(`${this.apiUrl}/search`, { params });
  }

  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${id}`);
  }

  followUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/follow`, {});
  }

  unfollowUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}/follow`);
  }

  getFollowers(userId: number): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/${userId}/followers`);
  }

  getFollowing(userId: number): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/${userId}/following`);
  }
}