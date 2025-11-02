// frontend/src/app/components/post/post.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { CommentsComponent } from '../comments/comments.component';
import { ReportService } from '../../services/report.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, CommentsComponent, RouterModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post;
  @Input() currentUserId: number | null = null;
  @Output() like = new EventEmitter<Post>();
  @Output() unlike = new EventEmitter<Post>();
  @Output() deletePost = new EventEmitter<number>();

  isLiking = false;
  showComments = false;
  showReportModal = false;
  isSubmittingReport = false;
  currentCharCount = 0;

  constructor(
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  updateCharCount(text: string): void {
    this.currentCharCount = text.length;
  }

  toggleReportModal(): void {
    this.showReportModal = !this.showReportModal;
    if (this.showReportModal) {
      this.currentCharCount = 0;
    }
  }

  submitReport(reason: string): void {
    if (!reason.trim()) return;
    this.isSubmittingReport = true;
    this.reportService.submitReport(this.post.id, 'POST', reason.trim()).subscribe({
      next: () => {
        this.snackBar.open('Report submitted successfully. Thank you!', 'Close', { duration: 5000 });
        this.toggleReportModal();
        this.isSubmittingReport = false;
      },
      error: (err) => {
        console.error('Report submission error:', err);
        this.snackBar.open('Failed to submit report. Please try again.', 'Close', { duration: 5000 });
        this.isSubmittingReport = false;
      }
    });
  }

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

  // --- FIXED EDIT METHOD ---
  onEditPost(): void {
    console.log('📝 Editing post:', this.post);
    
    // Navigate to create-post and pass the entire post object
    // using the router's 'state'
    this.router.navigate(['/create-post'], { 
      state: { post: this.post },
      replaceUrl: false // Keep navigation history so back button works
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

  // --- Utility functions ---
  
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
    (event.target as HTMLImageElement).style.display = 'none'; 
  }
  
  onVideoError(event: Event): void { 
    (event.target as HTMLVideoElement).style.display = 'none'; 
  }
}