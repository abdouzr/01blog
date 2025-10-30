import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Post, PostService } from '../../services/post.service'; 
import { AdminService, UserDto } from '../../services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Report {
  id: number;
  reporter: {
    id: number;
    username: string;
  } | null;
  targetType: 'POST' | 'USER';
  targetId: number;
  reason: string;
  createdAt: string;
  status: 'NEW' | 'REVIEWED';
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  users: UserDto[] = [];
  posts: Post[] = [];
  reports: Report[] = [];
  isLoadingUsers = true;
  isLoadingPosts = true;
  isLoadingReports = true;

  constructor(
    private adminService: AdminService,
    private postService: PostService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadPosts();
    this.loadReports();
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Failed to load user list.', 'Close', { duration: 5000 });
        this.isLoadingUsers = false;
      }
    });
  }

  loadPosts(): void {
    this.isLoadingPosts = true;
    this.adminService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoadingPosts = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.snackBar.open('Failed to load post list.', 'Close', { duration: 3000 });
        this.isLoadingPosts = false;
      }
    });
  }

  loadReports(): void {
    this.isLoadingReports = true;
    this.adminService.getAllReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.isLoadingReports = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.snackBar.open('Failed to load reports.', 'Close', { duration: 3000 });
        this.isLoadingReports = false;
      }
    });
  }

  banUser(user: UserDto): void {
    if (confirm(`Are you sure you want to BAN user ${user.username}?`)) {
      this.adminService.banUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.username} has been banned.`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error banning user:', err);
          this.snackBar.open(`Failed to ban user.`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  unbanUser(user: UserDto): void {
    if (confirm(`Are you sure you want to UNBAN user ${user.username}?`)) {
      this.adminService.unbanUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.username} has been unbanned.`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error unbanning user:', err);
          this.snackBar.open(`Failed to unban user.`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: UserDto): void {
    if (confirm(`DELETE user ${user.username}? This is IRREVERSIBLE.`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.username} has been deleted.`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.snackBar.open(`Failed to delete user.`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  hidePost(postId: number): void {
    if (confirm('Are you sure you want to hide this post?')) {
      // If your AdminService has a hidePost method, use it
      // Otherwise, you might need to add this endpoint to your backend
      this.snackBar.open('Hide post functionality - implement in backend if needed', 'Close', { duration: 3000 });
      
      // Example implementation if you have the service method:
      // this.adminService.hidePost(postId).subscribe({
      //   next: () => {
      //     this.snackBar.open('Post hidden successfully.', 'Close', { duration: 3000 });
      //     this.loadPosts();
      //   },
      //   error: (err) => {
      //     console.error('Error hiding post:', err);
      //     this.snackBar.open('Failed to hide post.', 'Close', { duration: 3000 });
      //   }
      // });
    }
  }

  deletePost(postId: number): void {
    if (confirm('Are you sure you want to delete this post? This action is IRREVERSIBLE.')) {
      this.adminService.deletePost(postId).subscribe({
        next: () => {
          this.snackBar.open('Post deleted successfully.', 'Close', { duration: 3000 });
          this.loadPosts();
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          this.snackBar.open('Failed to delete post.', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  reviewReport(report: Report): void {
    this.adminService.resolveReport(report.id).subscribe({
      next: () => {
        this.snackBar.open(`Report #${report.id} marked as reviewed.`, 'Close', { duration: 3000 });
        this.loadReports();
      },
      error: (err) => {
        console.error('Error reviewing report:', err);
        this.snackBar.open('Failed to review report.', 'Close', { duration: 3000 });
      }
    });
  }

  // Helper method to get reporter username safely
  getReporterUsername(report: Report): string {
    return report.reporter?.username || 'Unknown';
  }
}