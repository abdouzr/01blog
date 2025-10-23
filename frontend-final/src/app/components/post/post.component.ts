// Updated post.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from '../comments/comments.component';
import { ReportModalComponent } from '../report-modal/report-modal.component'; // NEW IMPORT

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, CommentsComponent, ReportModalComponent], // ADDED ReportModalComponent
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post;
  @Input() currentUserId!: number; // Added for delete button logic
  @Output() like = new EventEmitter<Post>();
  @Output() unlike = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<number>(); // New event for deletion

  isLiking = false;
  showComments = false;

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

  onDeletePost(): void {
    if (confirm('Are you sure you want to delete this post? This action is irreversible.')) {
      this.deletePost.emit(this.post.id);
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
  }

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
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  getMediaUrl(url: string): string {
    if (!url) return '';
    
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    
    return `http://localhost:8081${url}`;
  }

  getFileExtension(url: string): string {
    if (!url) return '';
    
    try {
      const parts = url.split('.');
      const extension = parts[parts.length - 1].toLowerCase();
      
      return extension.split('?')[0];
    } catch (error) {
      console.error('Error getting file extension:', error);
      return '';
    }
  }

  isImage(mediaType: string): boolean {
    return mediaType === 'image';
  }

  isVideo(mediaType: string): boolean {
    return mediaType === 'video';
  }
  
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
  
  onVideoError(event: Event): void {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.style.display = 'none';
  }
}
