// frontend/src/app/services/post.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Post {
  id: number;
  content: string;
  mediaUrls: string[];
  mediaTypes: string[];
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorUsername: string;
  authorProfilePicture: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  mediaUrl?: string;
  mediaType?: string;
}

export interface PostRequest {
  content: string;
  mediaUrls: string[];
  mediaTypes: string[];
  cloudinaryPublicIds: string[];
}

export interface UploadResponse {
  fileUrl: string;
  mediaType: string;
  publicId: string;
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

  // Get single post by ID
  getPostById(postId: number): Observable<Post> {
    const url = `${this.apiUrl}/${postId}`;
    console.log('🔍 Fetching single post:', url);
    
    return this.http.get<Post>(url).pipe(
      map(post => {
        console.log('✅ Single post loaded:', post);
        return this.normalizePost(post);
      }),
      catchError(error => {
        console.error('❌ Error fetching post:', error);
        return throwError(() => error);
      })
    );
  }

  createPost(post: PostRequest): Observable<Post> {
    console.log('📤 Sending POST request to:', this.apiUrl);
    console.log('📦 Post data:', post);
    
    const safePost: PostRequest = {
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      mediaTypes: post.mediaTypes || [],
      cloudinaryPublicIds: post.cloudinaryPublicIds || []
    };
    
    return this.http.post<Post>(this.apiUrl, safePost);
  }

  updatePost(id: number, post: PostRequest): Observable<Post> {
    console.log('📤 Sending PUT request to:', `${this.apiUrl}/${id}`);
    console.log('📦 Post data:', post);
    
    const safePost: PostRequest = {
      content: post.content,
      mediaUrls: post.mediaUrls || [],
      mediaTypes: post.mediaTypes || [],
      cloudinaryPublicIds: post.cloudinaryPublicIds || []
    };
    
    return this.http.put<Post>(`${this.apiUrl}/${id}`, safePost);
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

  // Single normalizePost method that handles both cases
  private normalizePost(post: any): Post {
    // If it's already normalized, return as is
    if (post.mediaUrls !== undefined && post.mediaTypes !== undefined) {
      return {
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls || [],
        mediaTypes: post.mediaTypes || [],
        authorUsername: post.authorUsername,
        authorId: post.authorId,
        authorProfilePicture: post.authorProfilePicture,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likeCount: post.likeCount || 0,
        commentCount: post.commentCount || 0,
        likedByCurrentUser: post.likedByCurrentUser || false
      };
    }
    
    // Convert from old structure to new structure
    return {
      ...post,
      mediaUrls: post.mediaUrl ? [post.mediaUrl] : [],
      mediaTypes: post.mediaType ? [post.mediaType] : [],
      authorUsername: post.authorUsername,
      authorId: post.authorId,
      authorProfilePicture: post.authorProfilePicture,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post.likeCount || 0,
      commentCount: post.commentCount || 0,
      likedByCurrentUser: post.likedByCurrentUser || false
    };
  }

  // Helper method to normalize an array of posts
  normalizePosts(posts: any[]): Post[] {
    return posts.map(post => this.normalizePost(post));
  }
}

export function getFullImageUrl(url: string | null): string {
  if (!url) return '/assets/default-image.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  return `http://localhost:8081${url}`;
}