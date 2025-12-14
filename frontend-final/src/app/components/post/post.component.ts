import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from '../comments/comments.component';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, CommentsComponent, RouterModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Input() currentUserId: number | null = null;
  @Output() like = new EventEmitter<Post>();
  @Output() unlike = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<number>();

  isLiking = false;
  showComments = false;

  // Add these properties
  maxContentLength = 200; // Show only 200 characters in feed
  maxMediaToShow = 3; // Show only 3 images in feed

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    // Debug media URLs on component init
    if (this.post.mediaUrls && this.post.mediaUrls.length > 0) {
      console.log('🖼️ Post media URLs:', this.post.mediaUrls);
      console.log('📝 Post media types:', this.post.mediaTypes);
      this.post.mediaUrls.forEach((url, index) => {
        const fullUrl = this.getMediaUrl(url);
        console.log(`Media ${index + 1}: ${fullUrl}`);
      });
    }
  }

  // === ADD THESE MISSING METHODS ===

  viewFullPost(): void {
    this.router.navigate(['/post', this.post.id]);
  }

  getTruncatedContent(): string {
    if (!this.post.content) return '';
    if (this.post.content.length <= this.maxContentLength) {
      return this.post.content;
    }
    return this.post.content.substring(0, this.maxContentLength) + '...';
  }

  isTruncated(): boolean {
    // FIX: Ensure we return only boolean, not string | boolean
    return !!(this.post.content && this.post.content.length > this.maxContentLength);
  }

  getVisibleMediaUrls(): string[] {
    if (!this.post.mediaUrls || this.post.mediaUrls.length === 0) {
      return [];
    }
    return this.post.mediaUrls.slice(0, this.maxMediaToShow);
  }

  hasMoreMedia(): boolean {
    return !!(this.post.mediaUrls && this.post.mediaUrls.length > this.maxMediaToShow);
  }

  getRemainingMediaCount(): number {
    if (!this.post.mediaUrls) return 0;
    return this.post.mediaUrls.length - this.maxMediaToShow;
  }

  // === END OF MISSING METHODS ===

  onLike(): void {
    if (this.isLiking) return;
    this.isLiking = true;
    if (this.post.likedByCurrentUser) {
      this.unlike.emit(this.post);
    } else {
      this.like.emit(this.post);
    }
    setTimeout(() => {
      this.isLiking = false;
    }, 500);
  }

  onEditPost(): void {
    console.log('✏️ Editing post:', this.post);
    this.router.navigate(['/create-post'], {
      state: { post: this.post },
      replaceUrl: false
    });
  }

  onDeletePost(): void {
    if (confirm('Are you sure you want to delete this post? This action is irreversible.')) {
      this.deletePost.emit(this.post.id);
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

  // --- Media display functions ---

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Just now';
      }
      if (diffInSeconds < 3600) {
        const m = Math.floor(diffInSeconds / 60);
        return `${m} minute${m !== 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 86400) {
        const h = Math.floor(diffInSeconds / 3600);
        return `${h} hour${h !== 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 604800) {
        const d = Math.floor(diffInSeconds / 86400);
        return `${d} day${d !== 1 ? 's' : ''} ago`;
      }

      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  getMediaUrl(url: string): string {
    if (!url) {
      console.warn('⚠️ Empty media URL');
      return '';
    }

    // If it's already a full URL (starts with http/https or data:)
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      console.log('✅ Full URL:', url);
      return url;
    }

    // If it starts with /uploads, it's a backend path
    if (url.startsWith('/uploads')) {
      const fullUrl = `http://localhost:8081${url}`;
      console.log('🔗 Backend URL:', fullUrl);
      return fullUrl;
    }

    // If it doesn't start with /, add it
    if (!url.startsWith('/')) {
      const fullUrl = `http://localhost:8081/${url}`;
      console.log('🔗 Constructed URL:', fullUrl);
      return fullUrl;
    }

    // Default case
    const fullUrl = `http://localhost:8081${url}`;
    console.log('🔗 Default URL:', fullUrl);
    return fullUrl;
  }

  getFileExtension(url: string): string {
    if (!url) return '';
    try {
      const parts = url.split('.');
      const extension = parts[parts.length - 1].toLowerCase();
      // Remove query parameters if any
      return extension.split('?')[0];
    } catch (error) {
      console.error('Error getting file extension:', error);
      return '';
    }
  }

  isImage(mediaType: string): boolean {
    const result = mediaType === 'image';
    console.log(`🖼️ Is image? ${mediaType} => ${result}`);
    return result;
  }

  isVideo(mediaType: string): boolean {
    const result = mediaType === 'video';
    console.log(`🎥 Is video? ${mediaType} => ${result}`);
    return result;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('❌ Image failed to load:', img.src);
    img.style.display = 'none';

    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning mt-2';
    errorDiv.innerHTML = `
      <i class="bi bi-exclamation-triangle"></i> 
      <strong>Image failed to load</strong><br>
      <small>${img.src}</small>
    `;
    img.parentElement?.appendChild(errorDiv);
  }

  onVideoError(event: Event): void {
    const video = event.target as HTMLVideoElement;
    console.error('❌ Video failed to load:', video.src);
    video.style.display = 'none';

    // Show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning mt-2';
    errorDiv.innerHTML = `
      <i class="bi bi-exclamation-triangle"></i> 
      <strong>Video failed to load</strong><br>
      <small>${video.src}</small>
    `;
    video.parentElement?.appendChild(errorDiv);
  }

  // Grid layout for multiple media
  getMediaGridClass(totalMedia: number, index: number): string {
    if (totalMedia === 1) return 'col-12';
    if (totalMedia === 2) return 'col-6';
    if (totalMedia === 3) return 'col-4';
    if (totalMedia === 4) return 'col-6';
    return 'col-4'; // For 5+ media, use 3-column layout
  }
}