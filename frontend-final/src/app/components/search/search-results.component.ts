// frontend/src/app/components/search/search-results.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <h2 class="mb-4">Search Results for "{{ searchQuery }}"</h2>
          
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && users.length === 0" class="text-center py-4">
            <i class="bi bi-search display-4 text-muted mb-3"></i>
            <h4 class="text-muted">No users found</h4>
            <p class="text-muted">Try searching with different keywords.</p>
          </div>

          <div *ngFor="let user of users" class="card mb-3">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-auto">
                  <img [src]="user.profilePicture || 'assets/default-avatar.png'" 
                       alt="{{ user.username }}" 
                       class="rounded-circle" 
                       width="60" 
                       height="60"
                       style="object-fit: cover;">
                </div>
                <div class="col">
                  <h5 class="card-title mb-1">
                    <a [routerLink]="['/profile', user.id]" class="text-decoration-none">
                      {{ user.username }}
                    </a>
                  </h5>
                  <p class="text-muted mb-1">{{ user.email }}</p>
                  <p class="card-text mb-2" *ngIf="user.bio">{{ user.bio }}</p>
                  <small class="text-muted">
                    {{ user.followerCount }} followers • {{ user.followingCount }} following
                  </small>
                </div>
                <div class="col-auto" *ngIf="!isCurrentUser(user)">
                  <button 
                    class="btn btn-sm"
                    [class.btn-primary]="!user.isFollowedByCurrentUser"
                    [class.btn-outline-primary]="user.isFollowedByCurrentUser"
                    (click)="toggleFollow(user)"
                    [disabled]="isProcessing">
                    {{ user.isFollowedByCurrentUser ? 'Unfollow' : 'Follow' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transition: box-shadow 0.2s;
    }
    
    .card-title a:hover {
      color: #0d6efd !important;
    }
  `]
})
export class SearchResultsComponent implements OnInit {
  users: UserProfile[] = [];
  searchQuery: string = '';
  isLoading = false;
  isProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.searchUsers();
      }
    });
  }

  searchUsers(): void {
    this.isLoading = true;
    this.userService.searchUsers(this.searchQuery).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error searching users', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  toggleFollow(user: UserProfile): void {
    this.isProcessing = true;
    
    if (user.isFollowedByCurrentUser) {
      this.userService.unfollowUser(user.id).subscribe({
        next: () => {
          user.isFollowedByCurrentUser = false;
          user.followerCount--;
          this.isProcessing = false;
          this.snackBar.open(`Unfollowed ${user.username}`, 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error unfollowing user', 'Close', { duration: 3000 });
          this.isProcessing = false;
        }
      });
    } else {
      this.userService.followUser(user.id).subscribe({
        next: () => {
          user.isFollowedByCurrentUser = true;
          user.followerCount++;
          this.isProcessing = false;
          this.snackBar.open(`Following ${user.username}`, 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Error following user', 'Close', { duration: 3000 });
          this.isProcessing = false;
        }
      });
    }
  }

  isCurrentUser(user: UserProfile): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? currentUser.id === user.id : false;
  }
}