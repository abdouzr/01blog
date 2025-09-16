// frontend/src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';
import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, PostComponent], // Import PostComponent
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userId!: number;
  user: any = null;
  posts: Post[] = [];
  isLoading = true;
  isOwnProfile = false;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
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
    // In a real app, you'd have a UserService to get user details
    // For now, we'll use mock data or get from AuthService
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.id === this.userId) {
      this.user = {
        id: currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        bio: 'This is a sample bio. Update your profile to add your own bio!',
        profilePicture: 'assets/default-avatar.png'
      };
    } else {
      // Mock data for other users
      this.user = {
        id: this.userId,
        username: 'user' + this.userId,
        email: `user${this.userId}@example.com`,
        bio: 'This user hasn\'t added a bio yet.',
        profilePicture: 'assets/default-avatar.png'
      };
    }
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