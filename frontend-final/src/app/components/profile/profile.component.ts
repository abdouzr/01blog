// frontend/src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, PostComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId!: number;
  user: UserProfile | null = null;
  posts: Post[] = [];
  isLoading = true;
  isOwnProfile = false;
  isFollowing = false;
  isProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUserProfile();
      this.loadUserPosts();
      
      // Check if this is the current user's profile
      const currentUser = this.authService.currentUserValue;
      this.isOwnProfile = currentUser ? currentUser.id === this.userId : false;
    });
  }

  loadUserProfile(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.isFollowing = user.isFollowedByCurrentUser;
      },
      error: (error) => {
        this.snackBar.open('Error loading user profile', 'Close', { duration: 3000 });
        // Fallback to mock data if API fails
        this.user = {
          id: this.userId,
          username: `user${this.userId}`,
          email: `user${this.userId}@example.com`,
          bio: 'This user hasn\'t added a bio yet.',
          profilePicture: '',
          createdAt: new Date().toISOString(),
          followerCount: 0,
          followingCount: 0,
          isFollowedByCurrentUser: false
        };
      }
    });
  }

  loadUserPosts(): void {
    this.isLoading = true;
    this.postService.getUserPosts(this.userId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading posts', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleFollow(): void {
    if (!this.user || this.isProcessing) return;

    this.isProcessing = true;

    if (this.isFollowing) {
      this.userService.unfollowUser(this.user.id).subscribe({
        next: () => {
          this.isFollowing = false;
          this.user!.isFollowedByCurrentUser = false;
          this.user!.followerCount--;
          this.isProcessing = false;
          this.snackBar.open(`Unfollowed ${this.user!.username}`, 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error unfollowing user', 'Close', { duration: 3000 });
          this.isProcessing = false;
        }
      });
    } else {
      this.userService.followUser(this.user.id).subscribe({
        next: () => {
          this.isFollowing = true;
          this.user!.isFollowedByCurrentUser = true;
          this.user!.followerCount++;
          this.isProcessing = false;
          this.snackBar.open(`Following ${this.user!.username}`, 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error following user', 'Close', { duration: 3000 });
          this.isProcessing = false;
        }
      });
    }
  }

  reportUser(): void {
    if (!this.user) return;

    // Simple confirmation dialog
    if (confirm(`Are you sure you want to report ${this.user.username}?`)) {
      // For now, just show a message. You can implement actual reporting later
      this.snackBar.open('User reported. Thank you for keeping our community safe.', 'Close', { duration: 4000 });
      
      // TODO: Implement actual reporting functionality
      // this.reportService.reportUser(this.user.id, reason).subscribe(...)
    }
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
}