import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, Subject, of } from 'rxjs';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="search-container position-relative">
      <i class="bi bi-search search-icon"></i>
      <input 
        type="text" 
        class="search-input" 
        placeholder="Search for users..."
        [(ngModel)]="searchQuery"
        (input)="onSearchInput($event)"
        (focus)="showDropdown = true"
        (keydown.escape)="hideDropdown()"
        (keydown.arrowdown)="navigateDown($event)"
        (keydown.arrowup)="navigateUp($event)"
        (keydown.enter)="selectHighlighted($event)"
        #searchInput>
      
      <!-- Search Dropdown -->
      <div 
        *ngIf="showDropdown && (searchResults.length > 0 || isLoading || (searchQuery.length > 0 && searchResults.length === 0))"
        class="search-dropdown position-absolute w-100 bg-white border rounded shadow-lg mt-1"
        style="z-index: 1000; max-height: 300px; overflow-y: auto;">
        
        <!-- Loading state -->
        <div *ngIf="isLoading" class="p-3 text-center">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Searching...</span>
          </div>
        </div>
        
        <!-- No results -->
        <div *ngIf="!isLoading && searchQuery.length > 0 && searchResults.length === 0" class="p-3 text-muted text-center">
          <i class="bi bi-search me-2"></i>No users found
        </div>
        
        <!-- Search results -->
        <div *ngIf="!isLoading && searchResults.length > 0">
          <div 
            *ngFor="let user of searchResults; let i = index" 
            class="search-result-item d-flex align-items-center p-2 cursor-pointer"
            [class.highlighted]="i === highlightedIndex"
            (click)="selectUser(user)"
            (mouseenter)="highlightedIndex = i">
            
            <!-- FIX: Changed user.profilePicture to user.profile_picture -->
            <img 
              [src]="user.profile_picture || 'assets/default-avatar.png'" 
              alt="{{ user.username }}" 
              class="rounded-circle me-2" 
              width="32" 
              height="32"
              style="object-fit: cover;">
            
            <div class="flex-grow-1">
              <div class="fw-bold">{{ user.username }}</div>
              <small class="text-muted">{{ user.email }}</small>
            </div>
            
            <small class="text-muted">
              {{ user.followerCount }} followers
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container { position: relative; width: 100%; max-width: 400px; }
    .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6c757d; z-index: 1; }
    .search-input { width: 100%; padding: 8px 12px 8px 35px; border: 1px solid #ddd; border-radius: 20px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background-color: rgba(255, 255, 255, 0.9); }
    .search-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25); }
    .search-dropdown { border: 1px solid #ddd; border-top: none; }
    .search-result-item { transition: background-color 0.2s; cursor: pointer; border-bottom: 1px solid #f8f9fa; }
    .search-result-item:hover, .search-result-item.highlighted { background-color: #f8f9fa; }
    .search-result-item:last-child { border-bottom: none; }
    .cursor-pointer { cursor: pointer; }
    @media (max-width: 768px) { .search-container { max-width: 250px; } }
  `]
})
export class SearchDropdownComponent {
  searchQuery = '';
  searchResults: UserProfile[] = [];
  showDropdown = false;
  isLoading = false;
  highlightedIndex = -1;
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of([]);
        }
        this.isLoading = true;
        return this.userService.searchUsers(query);
      })
    ).subscribe({
      next: (users) => {
        this.searchResults = users;
        this.isLoading = false;
        this.highlightedIndex = -1;
      },
      error: (error) => {
        this.searchResults = [];
        this.isLoading = false;
        this.highlightedIndex = -1;
      }
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    this.searchQuery = query;
    
    if (query.length === 0) {
      this.searchResults = [];
      this.showDropdown = false;
      return;
    }
    
    this.showDropdown = true;
    this.searchSubject.next(query);
  }

  selectUser(user: UserProfile): void {
    this.hideDropdown();
    this.searchQuery = '';
    this.router.navigate(['/profile', user.id]);
  }

  hideDropdown(): void {
    this.showDropdown = false;
    this.highlightedIndex = -1;
  }

  navigateDown(event: Event): void {
    event.preventDefault();
    if (this.searchResults.length > 0) {
      this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.searchResults.length - 1);
    }
  }

  navigateUp(event: Event): void {
    event.preventDefault();
    if (this.searchResults.length > 0) {
      this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
    }
  }

  selectHighlighted(event: Event): void {
    event.preventDefault();
    if (this.highlightedIndex >= 0 && this.highlightedIndex < this.searchResults.length) {
      this.selectUser(this.searchResults[this.highlightedIndex]);
    } else if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { 
        queryParams: { q: this.searchQuery.trim() } 
      });
      this.hideDropdown();
      this.searchQuery = '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.hideDropdown();
    }
  }
}