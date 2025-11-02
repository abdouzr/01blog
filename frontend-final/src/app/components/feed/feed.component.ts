// frontend/src/app/components/feed/feed.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostComponent, RouterModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = true;
  currentUserId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get the current user ID and store it
    this.authService.currentUser.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      // Assuming your user object has an 'id' property
      this.currentUserId = user ? (user as any).id : null; 
    });

    this.loadFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeed(): void {
    this.isLoading = true;
    this.postService.getFeed().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading feed', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  handleLike(post: Post): void {
    const originalLiked = post.likedByCurrentUser;
    const originalCount = post.likeCount;

    if (post.likedByCurrentUser) {
      post.likedByCurrentUser = false;
      post.likeCount--;
      this.postService.unlikePost(post.id).subscribe({
        error: () => {
          post.likedByCurrentUser = originalLiked;
          post.likeCount = originalCount;
          this.snackBar.open('Error unliking post', 'Close', { duration: 3000 });
        }
      });
    } else {
      post.likedByCurrentUser = true;
      post.likeCount++;
      this.postService.likePost(post.id).subscribe({
        error: () => {
          post.likedByCurrentUser = originalLiked;
          post.likeCount = originalCount;
          this.snackBar.open('Error liking post', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // This function removes the post from the feed after deletion
  handleDeletePost(postId: number): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        this.snackBar.open('Error deleting post. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}