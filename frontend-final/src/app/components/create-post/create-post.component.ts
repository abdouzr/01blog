// frontend/src/app/components/create-post/create-post.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
  content: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  isUploading: boolean = false;

  constructor(
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  async createPost(): Promise<void> {
    if (!this.content.trim() && !this.selectedFile) {
      this.snackBar.open('Please add some content or upload a file', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      let mediaUrl = '';
      let mediaType = '';

      // Upload file if selected
      if (this.selectedFile) {
        this.isUploading = true;
        const uploadResult = await this.postService.uploadFile(this.selectedFile).toPromise();
        this.isUploading = false;
        
        if (uploadResult) {
          mediaUrl = uploadResult.fileUrl;
          mediaType = uploadResult.mediaType;
        }
      }

      // Create post
      const postData = {
        content: this.content.trim(),
        mediaUrl: mediaUrl,
        mediaType: mediaType
      };

      this.postService.createPost(postData).subscribe({
        next: (response) => {
          console.log('✅ Post created successfully:', response);
          this.snackBar.open('Post created successfully!', 'Close', { duration: 3000 });
          
          // Clear form
          this.content = '';
          this.selectedFile = null;
          this.previewUrl = null;
          this.isSubmitting = false;
          
          // Navigate to feed after a short delay
          setTimeout(() => {
            this.router.navigate(['/feed']);
          }, 500);
        },
        error: (error) => {
          console.error('❌ Error creating post:', error);
          this.snackBar.open('Error creating post. Please try again.', 'Close', { duration: 3000 });
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      this.snackBar.open('Error uploading file. Please try again.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/feed']);
  }
}