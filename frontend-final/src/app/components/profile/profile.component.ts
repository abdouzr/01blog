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
      
      const currentUser = this.authService.currentUserValue;
      this.isOwnProfile = currentUser ? currentUser.id === this.userId : false;
    });
  }

  loadUserProfile(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        // FIX: Safely handle the 'boolean | undefined' type error by defaulting to false
        this.isFollowing = user.isFollowedByCurrentUser ?? false;
      },
      error: (error) => {
        this.snackBar.open('Error loading user profile', 'Close', { duration: 3000 });
        // FIX: Fallback object now uses the correct property names
        this.user = {
          id: this.userId,
          username: `user${this.userId}`,
          email: `user${this.userId}@example.com`,
          bio: 'This user hasn\'t added a bio yet.',
          profile_picture: '', // Was profilePicture
          createdAt: new Date().toISOString(),
          followerCount: 0,
          followingCount: 0,
          isFollowedByCurrentUser: false,
          is_blocked: false,
          roles: []
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
    const action = this.isFollowing 
      ? this.userService.unfollowUser(this.user.id) 
      : this.userService.followUser(this.user.id);

    action.subscribe({
      next: () => {
        this.isFollowing = !this.isFollowing;
        if (this.user) {
          this.user.isFollowedByCurrentUser = this.isFollowing;
          this.user.followerCount += this.isFollowing ? 1 : -1;
        }
        this.snackBar.open(this.isFollowing ? `Following ${this.user?.username}` : `Unfollowed ${this.user?.username}`, 'Close', { duration: 2000 });
        this.isProcessing = false;
      },
      error: (err) => {
        this.snackBar.open('Action failed', 'Close', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  reportUser(): void {
    if (!this.user) return;
    if (confirm(`Are you sure you want to report ${this.user.username}?`)) {
      this.snackBar.open('User reported. Thank you for keeping our community safe.', 'Close', { duration: 4000 });
    }
  }

  handleLike(post: Post): void {
    const action = post.likedByCurrentUser 
      ? this.postService.unlikePost(post.id) 
      : this.postService.likePost(post.id);

    action.subscribe({
      next: () => {
        post.likedByCurrentUser = !post.likedByCurrentUser;
        post.likeCount += post.likedByCurrentUser ? 1 : -1;
      },
      error: (err) => {
        this.snackBar.open('Error updating like status', 'Close', { duration: 3000 });
      }
    });
  }
}
