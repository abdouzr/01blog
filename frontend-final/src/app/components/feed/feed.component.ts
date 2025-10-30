// frontend/src/app/components/feed/feed.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnDestroy
import { PostService, Post } from '../../services/post.service';
import { AuthService, User } from '../../services/auth.service'; // Import User
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs'; // Import Subject
import { takeUntil } from 'rxjs/operators'; // Import takeUntil

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostComponent, RouterModule],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit, OnDestroy { // Implement OnDestroy
  posts: Post[] = [];
  isLoading = true;
  currentUserId: number | null = null; // This is correct

  // --- ADDED ---
  // Subject to manage component unsubscription
  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // --- THIS IS THE FIX FOR ERROR 2 ---
    // We subscribe to the currentUser observable
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$)) // This prevents memory leaks
      .subscribe((user: User | null) => {
        // Assuming your User object has an 'id' property
        // If user exists, set currentUserId to user.id, otherwise set it to null
        this.currentUserId = user ? user.id : null;
      });
    // ------------------------------------

    this.loadFeed();
  }

  // --- ADDED ---
  ngOnDestroy(): void {
    // This cleans up the subscription when the component is destroyed
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
    if (post.likedByCurrentUser) {
      this.postService.unlikePost(post.id).subscribe({
        next: () => {
          post.likedByCurrentUser = false;
          post.likeCount--;
        },
        error: (error) => {
          this.snackBar.open('Error unliking post', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.postService.likePost(post.id).subscribe({
        next: () => {
          post.likedByCurrentUser = true;
          post.likeCount++;
        },
        error: (error) => {
          this.snackBar.open('Error liking post', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDeletePost(postId: number): void {
    // We assume your PostService has a 'deletePost' method
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting post:', err);
        this.snackBar.open('Failed to delete post. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}