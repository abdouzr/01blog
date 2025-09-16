// frontend/src/app/components/create-post/create-post.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, PostRequest } from '../../services/post.service';
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
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        this.previewUrl = 'assets/video-placeholder.png'; // You'll need to add this asset
      }
    }
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      this.isLoading = true;
      
      const postRequest: PostRequest = {
        content: this.postForm.value.content,
        //mediaUrl: this.previewUrl, // In real app, you'd upload to server first
        mediaType: this.selectedFile?.type.startsWith('image/') ? 'image' : 
                  this.selectedFile?.type.startsWith('video/') ? 'video' : undefined
      };

      this.postService.createPost(postRequest).subscribe({
        next: () => {
          this.snackBar.open('Post created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/feed']);
          this.isLoading = false;
        },
        error: (error) => {
          this.snackBar.open('Error creating post', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  removeMedia(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.postForm.patchValue({ media: null });
  }
  
}