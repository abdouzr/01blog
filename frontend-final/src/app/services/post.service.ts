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
  isHidden?: boolean; // ✅ Already added
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

  // FIXED: All methods now use proper normalization
  getAllPosts(): Observable<Post[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(posts => this.normalizePosts(posts)),
      catchError(error => {
        console.error('❌ Error fetching all posts:', error);
        return throwError(() => error);
      })
    );
  }

  getUserPosts(userId: number): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(posts => this.normalizePosts(posts)),
      catchError(error => {
        console.error('❌ Error fetching user posts:', error);
        return throwError(() => error);
      })
    );
  }

  getFeed(): Observable<Post[]> {
    return this.http.get<any[]>(`${this.apiUrl}/feed`).pipe(
      map(posts => this.normalizePosts(posts)),
      catchError(error => {
        console.error('❌ Error fetching feed:', error);
        return throwError(() => error);
      })
    );
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(post => this.normalizePost(post)),
      catchError(error => {
        console.error('❌ Error fetching post by ID:', error);
        return throwError(() => error);
      })
    );
  }

  // Get single post by ID
  getPostById(postId: number): Observable<Post> {
    const url = `${this.apiUrl}/${postId}`;
    console.log('🔍 Fetching single post:', url);
    
    return this.http.get<any>(url).pipe(
      map(post => {
        console.log('📦 Raw post data:', post);
        const normalized = this.normalizePost(post);
        console.log('✅ Single post loaded:', normalized);
        return normalized;
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

  // ================================================
  // FIXED: IMPROVED NORMALIZE POST METHOD
  // ✅ NOW INCLUDES isHidden
  // ================================================
  private normalizePost(post: any): Post {
    console.log('🔍 Normalizing post - RAW DATA:', post);
    
    // Extract media information - handle all possible cases
    let mediaUrls: string[] = [];
    let mediaTypes: string[] = [];
    
    // CASE 1: New structure with arrays (plural)
    if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
      console.log('📂 Using mediaUrls array');
      mediaUrls = post.mediaUrls.filter((url: string) => url && url.trim() !== '');
      mediaTypes = post.mediaTypes || [];
    }
    // CASE 2: Old structure with singular fields
    else if (post.mediaUrl) {
      console.log('📂 Using singular mediaUrl field');
      mediaUrls = [post.mediaUrl].filter((url: string) => url && url.trim() !== '');
      mediaTypes = post.mediaType ? [post.mediaType] : ['image'];
    }
    // CASE 3: Check for cloudinary URLs
    else if (post.cloudinaryUrl) {
      console.log('📂 Using cloudinaryUrl field');
      mediaUrls = [post.cloudinaryUrl].filter((url: string) => url && url.trim() !== '');
      mediaTypes = ['image']; // Default to image for cloudinary
    }
    // CASE 4: Fallback to empty arrays
    else {
      console.log('📂 No media URLs found');
      mediaUrls = [];
      mediaTypes = [];
    }
    
    // Ensure mediaTypes array matches mediaUrls length
    if (mediaUrls.length > 0) {
      if (mediaUrls.length > mediaTypes.length) {
        console.log(`⚠️ Filling missing media types. URLs: ${mediaUrls.length}, Types: ${mediaTypes.length}`);
        // Fill missing types with 'image' as default
        for (let i = mediaTypes.length; i < mediaUrls.length; i++) {
          mediaTypes.push('image');
        }
      }
    }
    
    // Extract author information - handle different field names
    let authorUsername = 'Anonymous';
    let authorId = 0;
    let authorProfilePicture = 'assets/default-avatar.png';
    
    if (post.authorUsername) {
      authorUsername = post.authorUsername;
    } else if (post.author && post.author.username) {
      authorUsername = post.author.username;
    } else if (post.user && post.user.username) {
      authorUsername = post.user.username;
    }
    
    if (post.authorId) {
      authorId = post.authorId;
    } else if (post.author && post.author.id) {
      authorId = post.author.id;
    } else if (post.user && post.user.id) {
      authorId = post.user.id;
    }
    
    if (post.authorProfilePicture) {
      authorProfilePicture = post.authorProfilePicture;
    } else if (post.author && post.author.profilePicture) {
      authorProfilePicture = post.author.profilePicture;
    } else if (post.user && post.user.profilePicture) {
      authorProfilePicture = post.user.profilePicture;
    }
    
    // Handle date fields with different names
    const createdAt = post.createdAt || post.created_at || post.createdDate || new Date().toISOString();
    const updatedAt = post.updatedAt || post.updated_at || post.updatedDate || createdAt;
    
    const normalizedPost: Post = {
      id: post.id,
      content: post.content || '',
      mediaUrls: mediaUrls,
      mediaTypes: mediaTypes,
      authorUsername: authorUsername,
      authorId: authorId,
      authorProfilePicture: authorProfilePicture,
      createdAt: createdAt,
      updatedAt: updatedAt,
      likeCount: post.likeCount || post.like_count || post.likesCount || 0,
      commentCount: post.commentCount || post.comment_count || post.commentsCount || 0,
      likedByCurrentUser: post.likedByCurrentUser || post.liked_by_current_user || false,
      isHidden: post.isHidden || post.is_hidden || false // ✅ NEW: Include isHidden
    };
    
    console.log('✅ Normalized post:', {
      id: normalizedPost.id,
      mediaCount: normalizedPost.mediaUrls.length,
      mediaUrls: normalizedPost.mediaUrls,
      mediaTypes: normalizedPost.mediaTypes,
      author: normalizedPost.authorUsername,
      isHidden: normalizedPost.isHidden // ✅ Log isHidden status
    });
    
    return normalizedPost;
  }

  // Helper method to normalize an array of posts
  normalizePosts(posts: any[]): Post[] {
    return posts.map(post => this.normalizePost(post));
  }
}

// Utility function to get full image URL
export function getFullImageUrl(url: string | null): string {
  if (!url || url.trim() === '') {
    console.warn('⚠️ Empty media URL');
    return '/assets/default-image.png';
  }
  
  // If it's already a full URL (starts with http/https or data:)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  // Handle Cloudinary URLs (they might start with something else)
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    // Ensure it has protocol
    if (!url.startsWith('http')) {
      return `https://${url}`;
    }
    return url;
  }
  
  // If it starts with /uploads, /media, /images, it's a backend path
  if (url.startsWith('/uploads') || url.startsWith('/media') || url.startsWith('/images') || url.startsWith('/static')) {
    return `http://localhost:8081${url}`;
  }
  
  // If it doesn't start with /, add it
  if (!url.startsWith('/')) {
    return `http://localhost:8081/${url}`;
  }
  
  // Default case
  return `http://localhost:8081${url}`;
}