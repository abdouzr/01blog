// frontend/src/app/components/comments/comments.component.ts
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentService, Comment } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, OnChanges {
  @Input() postId!: number;
  @Input() isExpanded: boolean = false;
  
  comments: Comment[] = [];
  newComment: string = '';
  isLoading = false;
  isSubmitting = false;

  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Don't load comments automatically, wait for user to expand
  }

  ngOnChanges(): void {
    if (this.isExpanded && this.comments.length === 0) {
      this.loadComments();
    }
  }

  loadComments(): void {
    this.isLoading = true;
    this.commentService.getCommentsByPost(this.postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading comments', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;

    this.isSubmitting = true;
    this.commentService.createComment(this.postId, this.newComment.trim()).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
        this.isSubmitting = false;
      },
      error: (error) => {
        this.snackBar.open('Error adding comment', 'Close', { duration: 3000 });
        this.isSubmitting = false;
      }
    });
  }

  deleteComment(commentId: number): void {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
          this.snackBar.open('Comment deleted', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error deleting comment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? currentUser.id === comment.authorId : false;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      }
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  }
}