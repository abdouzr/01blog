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
    console.log('🔔 FeedComponent initialized');
    
    // Get the current user ID and store it
    this.authService.currentUser.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      console.log('👤 Current user in feed:', user);
      // Assuming your user object has an 'id' property
      this.currentUserId = user ? (user as any).id : null; 
      console.log('🆔 Current user ID:', this.currentUserId);
    });

    this.loadFeed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFeed(): void {
    console.log('🔄 Starting to load feed...');
    this.isLoading = true;
    
    this.postService.getFeed().subscribe({
      next: (posts) => {
        console.log('✅ Feed loaded successfully from API');
        console.log('📦 Raw posts data from backend:', posts);
        console.log('🔢 Number of posts received:', posts.length);
        
        // Normalize posts to ensure consistent structure
        this.posts = this.postService.normalizePosts(posts);
        console.log('🔄 Normalized posts:', this.posts);
        console.log('🔢 Number of normalized posts:', this.posts.length);
        
        // Check each post structure
        this.posts.forEach((post, index) => {
          console.log(`📝 Post ${index + 1}:`, {
            id: post.id,
            content: post.content,
            mediaUrls: post.mediaUrls,
            mediaTypes: post.mediaTypes,
            author: post.authorUsername,
            hasMedia: post.mediaUrls && post.mediaUrls.length > 0
          });
        });
        
        this.isLoading = false;
        console.log('🏁 Feed loading completed');
      },
      error: (error) => {
        console.error('❌ Error loading feed:', error);
        console.error('🔍 Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.snackBar.open('Error loading feed', 'Close', { duration: 3000 });
        this.isLoading = false;
      },
      complete: () => {
        console.log('✅ Feed subscription completed');
      }
    });
  }

  handleLike(post: Post): void {
    console.log('❤️ Handling like for post:', post.id);
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
    console.log('🗑️ Deleting post:', postId);
    this.postService.deletePost(postId).subscribe({
      next: () => {
        console.log('✅ Post deleted successfully:', postId);
        this.posts = this.posts.filter(p => p.id !== postId);
        this.snackBar.open('Post deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('❌ Error deleting post:', error);
        this.snackBar.open('Error deleting post. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  // Debug method to check current state
  debugFeed(): void {
    console.log('🐛 DEBUG - Current feed state:');
    console.log('📊 Posts array:', this.posts);
    console.log('🔢 Posts length:', this.posts.length);
    console.log('⏳ Loading state:', this.isLoading);
    console.log('👤 Current user ID:', this.currentUserId);
  }

  // Add this method to feed.component.ts
trackByPostId(index: number, post: Post): number {
  return post.id;
}
}