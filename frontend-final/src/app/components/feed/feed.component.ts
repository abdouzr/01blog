// frontend/src/app/components/feed/feed.component.ts
import { Component, OnInit } from '@angular/core';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../post/post.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostComponent, RouterModule], // Add RouterModule here
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  isLoading = true;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFeed();
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
}