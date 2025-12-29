// frontend/src/app/components/post-detail/post-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { CommentsComponent } from '../comments/comments.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, CommentsComponent, RouterModule],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  isLoading = true;
  currentUserId: number | null = null;
  isLiking = false;
  showReportModal = false;
  isSubmittingReport = false;
  currentCharCount = 0;
  // confirmation modal for deleting the post in detail view
  confirmDeleteVisible = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser.subscribe(user => {
      this.currentUserId = user ? (user as any).id : null;
    });

    // Get post ID from route
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      this.loadPost(parseInt(postId));
    }
  }

  loadPost(postId: number): void {
    this.isLoading = true;
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
        console.log('📝 Loaded full post:', post);
      },
      error: (error) => {
        console.error('❌ Error loading post:', error);
        this.snackBar.open('Error loading post', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/feed']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  onLike(): void {
    if (!this.post || this.isLiking) {
      console.log('⚠️ Like action blocked:', { hasPost: !!this.post, isLiking: this.isLiking });
      return;
    }

    const wasLiked = this.post.likedByCurrentUser;
    const previousLikeCount = this.post.likeCount;

    console.log('👍 Like action:', {
      postId: this.post.id,
      wasLiked,
      action: wasLiked ? 'unlike' : 'like',
      previousCount: previousLikeCount
    });

    this.isLiking = true;

    // Optimistic update
    this.post.likedByCurrentUser = !wasLiked;
    this.post.likeCount = wasLiked ? previousLikeCount - 1 : previousLikeCount + 1;

    const action$ = wasLiked
      ? this.postService.unlikePost(this.post.id)
      : this.postService.likePost(this.post.id);

    action$.subscribe({
      next: () => {
        console.log('✅ Like action successful:', {
          postId: this.post?.id,
          nowLiked: this.post?.likedByCurrentUser,
          newCount: this.post?.likeCount
        });
        this.isLiking = false;
      },
      error: (error) => {
        console.error('❌ Like action failed:', error);

        // Revert optimistic update on error
        if (this.post) {
          this.post.likedByCurrentUser = wasLiked;
          this.post.likeCount = previousLikeCount;
        }

        const message = wasLiked ? 'Error unliking post' : 'Error liking post';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.isLiking = false;
      }
    });
  }

  onEditPost(): void {
    if (!this.post) return;
    this.router.navigate(['/create-post'], { 
      state: { post: this.post }
    });
  }

  onDeletePost(): void {
    if (!this.post) return;
    this.confirmDeleteVisible = true;
  }

  cancelDelete(): void {
    this.confirmDeleteVisible = false;
  }

  confirmDelete(): void {
    if (!this.post) return;
    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
        this.confirmDeleteVisible = false;
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.snackBar.open('Error deleting post', 'Close', { duration: 3000 });
        this.confirmDeleteVisible = false;
      }
    });
  }

  toggleReportModal(): void {
    this.showReportModal = !this.showReportModal;
    if (this.showReportModal) {
      this.currentCharCount = 0;
    }
  }

  updateCharCount(text: string): void {
    this.currentCharCount = text.length;
  }

  submitReport(reason: string): void {
    if (!this.post || !reason.trim()) return;
    
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

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
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
      return 'Invalid date';
    }
  }

  getMediaUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
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

  getMediaGridClass(totalMedia: number, index: number): string {
    if (totalMedia === 1) return 'col-12';
    if (totalMedia === 2) return 'col-md-6 col-12';
    if (totalMedia === 3) return 'col-md-4 col-6';
    if (totalMedia === 4) return 'col-md-6 col-6';
    return 'col-md-4 col-6';
  }
}