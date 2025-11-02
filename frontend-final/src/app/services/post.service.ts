// frontend/src/app/services/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  content: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorUsername: string;
  authorProfilePicture: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

export interface PostRequest {
  content: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface UploadResponse {
  fileUrl: string;
  mediaType: string;
  publicId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8081/api/posts';
  private uploadUrl = 'http://localhost:8081/api/upload';

  constructor(private http: HttpClient) { }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  getUserPosts(userId: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${userId}`);
  }

  getFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/feed`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(post: PostRequest): Observable<Post> {
    console.log('📤 Sending POST request to:', this.apiUrl);
    console.log('📦 Post data:', post);
    return this.http.post<Post>(this.apiUrl, post);
  }

  updatePost(id: number, post: PostRequest): Observable<Post> {
    console.log('📤 Sending PUT request to:', `${this.apiUrl}/${id}`);
    console.log('📦 Post data:', post);
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  likePost(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${postId}/like`, {});
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${postId}/like`);
  }

  uploadFile(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    console.log('📤 Uploading file:', file.name);
    return this.http.post<UploadResponse>(this.uploadUrl, formData);
  }

  deleteFile(publicId: string): Observable<any> {
    return this.http.delete(`${this.uploadUrl}/${publicId}`);
  }
}

export function getFullImageUrl(url: string | null): string {
  if (!url) return '/assets/default-image.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  return `http://localhost:8081${url}`;
}