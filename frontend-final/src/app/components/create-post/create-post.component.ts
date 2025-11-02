// frontend/src/app/components/create-post/create-post.component.ts
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, Post, PostRequest } from '../../services/post.service'; 
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  content: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  isUploading: boolean = false;

  // --- CRITICAL VARIABLE FOR EDIT MODE ---
  editingPost: Post | null = null;

  existingMediaUrl: string | null = null;
  existingMediaType: string | null = null;

  constructor(
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // --- FIXED ngOnInit ---
  ngOnInit(): void {
    // Try to get navigation state first
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['post']) {
      this.editingPost = navigation.extras.state['post'] as Post;
      this.loadPostData();
    } 
    // Fallback: Check if there's data in history state (for page refresh)
    else if (window.history.state && window.history.state['post']) {
      this.editingPost = window.history.state['post'] as Post;
      this.loadPostData();
    }
  }

  // --- NEW METHOD: Load post data into form ---
  private loadPostData(): void {
    if (this.editingPost) {
      console.log('📝 Loading post data for editing:', this.editingPost);
      
      // Populate the form with the existing post data
      this.content = this.editingPost.content || '';
      this.existingMediaUrl = this.editingPost.mediaUrl || null;
      this.existingMediaType = this.editingPost.mediaType || null;
      
      if (this.existingMediaUrl) {
        this.previewUrl = this.getMediaUrl(this.existingMediaUrl);
      }
    }
  }

  getMediaUrl(url: string): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8081${url}`; 
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // Clear existing media when new file is selected
      this.existingMediaUrl = null;
      this.existingMediaType = null;
      
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
    this.existingMediaUrl = null; 
    this.existingMediaType = null;

    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async createPost(): Promise<void> {
    // Validation
    if (!this.content.trim() && !this.selectedFile && !this.existingMediaUrl) {
      this.snackBar.open('Please add some content or upload a file', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      let mediaUrl = this.existingMediaUrl || '';
      let mediaType = this.existingMediaType || '';

      // Upload new file if selected
      if (this.selectedFile) {
        this.isUploading = true;
        const uploadResult = await this.postService.uploadFile(this.selectedFile).toPromise();
        this.isUploading = false;
        
        if (uploadResult) {
          mediaUrl = uploadResult.fileUrl;
          mediaType = uploadResult.mediaType;
        }
      } 
      // If no new file and no existing media, clear the fields
      else if (!this.existingMediaUrl) {
        mediaUrl = '';
        mediaType = '';
      }

      const postData: PostRequest = {
        content: this.content.trim(),
        mediaUrl: mediaUrl,
        mediaType: mediaType
      };

      // --- EDIT vs CREATE LOGIC ---
      if (this.editingPost) {
        console.log('✏️ Updating post:', this.editingPost.id);
        
        // UPDATE existing post
        this.postService.updatePost(this.editingPost.id, postData).subscribe({
          next: (response) => {
            console.log('✅ Post updated successfully:', response);
            this.snackBar.open('Post updated successfully!', 'Close', { duration: 3000 });
            this.resetFormAndNavigate();
          },
          error: (error) => {
            console.error('❌ Error updating post:', error);
            this.snackBar.open('Error updating post. Please try again.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      } else {
        console.log('📝 Creating new post');
        
        // CREATE new post
        this.postService.createPost(postData).subscribe({
          next: (response) => {
            console.log('✅ Post created successfully:', response);
            this.snackBar.open('Post created successfully!', 'Close', { duration: 3000 });
            this.resetFormAndNavigate();
          },
          error: (error) => {
            console.error('❌ Error creating post:', error);
            this.snackBar.open('Error creating post. Please try again.', 'Close', { duration: 3000 });
            this.isSubmitting = false;
          }
        });
      }
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      this.snackBar.open('Error uploading file. Please try again.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  private resetFormAndNavigate(): void {
    this.content = '';
    this.selectedFile = null;
    this.previewUrl = null;
    this.isSubmitting = false;
    this.editingPost = null; 
    this.existingMediaUrl = null;
    this.existingMediaType = null;
    
    setTimeout(() => {
      this.router.navigate(['/feed']);
    }, 500);
  }

  cancel(): void {
    this.resetFormAndNavigate();
  }
}