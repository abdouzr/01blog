import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, PostComponent, ReportModalComponent, MatSnackBarModule],
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
  
  @ViewChild(ReportModalComponent) reportModal?: ReportModalComponent;

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
        this.isFollowing = user.isFollowedByCurrentUser ?? false;
      },
      error: (error) => {
        this.snackBar.open('Error loading user profile', 'Close', { duration: 3000 });
        this.user = {
          id: this.userId,
          username: `user${this.userId}`,
          email: `user${this.userId}@example.com`,
          bio: 'This user hasn\'t added a bio yet.',
          profile_picture: '',
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
        this.snackBar.open(
          this.isFollowing ? `Following ${this.user?.username}` : `Unfollowed ${this.user?.username}`, 
          'Close', 
          { duration: 2000 }
        );
        this.isProcessing = false;
      },
      error: (err) => {
        this.snackBar.open('Action failed', 'Close', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  openReportModal(): void {
    console.log('Opening report modal for user:', this.userId);
    if (this.reportModal) {
      this.reportModal.showModal();
    } else {
      // Fallback: Manual DOM manipulation
      const modalElement = document.getElementById('reportUserModal');
      if (modalElement) {
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = 'reportModalBackdrop';
        document.body.appendChild(backdrop);
        document.body.classList.add('modal-open');
        
        console.log('Modal opened manually');
      } else {
        console.error('Modal element not found');
      }
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