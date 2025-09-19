import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, PostRequest, UploadResponse, Post } from '../../services/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
  postForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  fileType: string = '';
  publicId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
      media: [null]
    });
  }

  onFileSelected(event: any): void {
    const fileInput = event.target;
    const file = fileInput.files[0];
    
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        this.snackBar.open('File size must be less than 50MB', 'Close', { duration: 3000 });
        fileInput.value = '';
        return;
      }

      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        this.snackBar.open('Please select a valid image or video file', 'Close', { duration: 3000 });
        fileInput.value = '';
        return;
      }

      this.selectedFile = file;
      this.fileType = file.type.split('/')[0];
      
      if (this.fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrl = e.target.result;
        };
        reader.onerror = (error: any) => {
          this.snackBar.open('Error loading image preview', 'Close', { duration: 3000 });
        };
        reader.readAsDataURL(file);
      } else if (this.fileType === 'video') {
        this.previewUrl = URL.createObjectURL(file);
      }
    }
  }

  isImageFile(): boolean {
    return this.fileType === 'image';
  }

  isVideoFile(): boolean {
    return this.fileType === 'video';
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.valid) {
      this.isLoading = true;
      
      try {
        let mediaUrl: string | undefined;
        let mediaType: string | undefined;

        if (this.selectedFile) {
          this.isUploading = true;
          const uploadResponse = await this.postService.uploadFile(this.selectedFile).toPromise();
          if (uploadResponse) {
            mediaUrl = uploadResponse.fileUrl;
            mediaType = uploadResponse.mediaType;
            this.publicId = uploadResponse.publicId || null;
          }
          this.isUploading = false;
        }

        const postRequest: PostRequest = {
          content: this.postForm.value.content,
          mediaUrl: mediaUrl,
          mediaType: mediaType
        };

        this.postService.createPost(postRequest).subscribe({
          next: (response: Post) => {
            this.snackBar.open('Post created successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/feed']);
            this.isLoading = false;
            this.cleanupPreview();
          },
          error: (error: any) => {
            if (this.publicId) {
              this.cleanupUploadedFile();
            }
            this.snackBar.open('Error creating post. Please try again.', 'Close', { duration: 3000 });
            this.isLoading = false;
            this.isUploading = false;
            this.cleanupPreview();
          }
        });
      } catch (error: any) {
        if (this.publicId) {
          this.cleanupUploadedFile();
        }
        this.snackBar.open('Error uploading file. Please try again.', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.isUploading = false;
        this.cleanupPreview();
      }
    }
  }

  private async cleanupUploadedFile(): Promise<void> {
    if (this.publicId) {
      try {
        await this.postService.deleteFile(this.publicId).toPromise();
      } catch (error: any) {
        console.error('Error cleaning up uploaded file:', error);
      }
    }
  }

  removeMedia(): void {
    if (this.publicId) {
      this.cleanupUploadedFile();
    }
    this.cleanupPreview();
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileType = '';
    this.publicId = null;
    
    const fileInput = document.getElementById('media') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private cleanupPreview(): void {
    if (this.fileType === 'video' && this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  ngOnDestroy(): void {
    this.cleanupPreview();
    if (this.publicId && !this.isLoading) {
      this.cleanupUploadedFile();
    }
  }
}