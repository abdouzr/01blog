import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post;
  @Output() like = new EventEmitter<Post>();
  @Output() unlike = new EventEmitter<Post>();

  // Track like state to prevent double clicks
  isLiking = false;

  onLike(): void {
    if (this.isLiking) return;
    
    this.isLiking = true;
    if (this.post.likedByCurrentUser) {
      this.unlike.emit(this.post);
    } else {
      this.like.emit(this.post);
    }
    
    // Reset after a short delay to prevent rapid clicks
    setTimeout(() => {
      this.isLiking = false;
    }, 500);
  }
  

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // Show relative time for recent posts
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      // For older posts, show full date
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  // Get the complete media URL (Cloudinary URLs are already complete)
  getMediaUrl(url: string): string {
    if (!url) return '';
    
    // Handle Cloudinary URLs and local URLs
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    
    // For relative URLs, prepend backend URL
    return `http://localhost:8081${url}`;
  }

  // Helper to get file extension for video sources
  getFileExtension(url: string): string {
    if (!url) return '';
    
    try {
      const parts = url.split('.');
      const extension = parts[parts.length - 1].toLowerCase();
      
      // Remove any query parameters from the extension
      return extension.split('?')[0];
    } catch (error) {
      console.error('Error getting file extension:', error);
      return '';
    }
  }

  // Check if media is an image
  isImage(mediaType: string): boolean {
    return mediaType === 'image';
  }

  // Check if media is a video
  isVideo(mediaType: string): boolean {
    return mediaType === 'video';
  }
  
  // Handle image loading errors
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
  
  // Handle video loading errors
  onVideoError(event: Event): void {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.style.display = 'none';
  }
  
}
