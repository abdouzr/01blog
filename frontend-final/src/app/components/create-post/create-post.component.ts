// frontend/src/app/components/create-post/create-post.component.ts
import { Component, OnInit } from '@angular/core'; // <-- Import OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, Post, PostRequest } from '../../services/post.service'; // <-- Import Post & PostRequest
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit { // <-- Implement OnInit
  content: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSubmitting: boolean = false;
  isUploading: boolean = false;

  // --- NEW PROPERTIES FOR EDITING ---
  editingPost: Post | null = null;
  existingMediaUrl: string | null = null;
  existingMediaType: string | null = null;
  // ------------------------------------

  constructor(
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // --- THIS IS THE KEY NEW METHOD ---
  ngOnInit(): void {
    // Check if the router passed us any 'state' data
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['post']) {
      this.editingPost = navigation.extras.state['post'] as Post;
      
      // Populate the form with the existing post data
      this.content = this.editingPost.content;
      this.existingMediaUrl = this.editingPost.mediaUrl;
      this.existingMediaType = this.editingPost.mediaType;
      
      // If there's an existing media, show its preview
      if (this.existingMediaUrl) {
        this.previewUrl = this.getMediaUrl(this.existingMediaUrl);
      }
    }
  }

  // Helper to build the full media URL
  getMediaUrl(url: string): string | null {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8081${url}`; // Using the base URL from your service
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // A new file selection *overrides* any existing media
      this.existingMediaUrl = null;
      this.existingMediaType = null;
      
      // Create a local preview for the *new* file
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
    this.existingMediaUrl = null; // Mark existing media for removal
    this.existingMediaType = null;

    // Reset the file input visually
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // --- THIS METHOD NOW HANDLES BOTH CREATE AND UPDATE ---
  async createPost(): Promise<void> {
    // Updated check: allow saving if there is content OR a new file OR existing media
    if (!this.content.trim() && !this.selectedFile && !this.existingMediaUrl) {
      this.snackBar.open('Please add some content or upload a file', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      // Start with existing media, if any
      let mediaUrl = this.existingMediaUrl || '';
      let mediaType = this.existingMediaType || '';

      // If a *new* file was selected, upload it and overwrite old media
      if (this.selectedFile) {
        this.isUploading = true;
        const uploadResult = await this.postService.uploadFile(this.selectedFile).toPromise();
        this.isUploading = false;
        
        if (uploadResult) {
          mediaUrl = uploadResult.fileUrl;
          mediaType = uploadResult.mediaType;
        }
      } 
      // If no new file and no existing media (it was removed)
      else if (!this.existingMediaUrl) {
        mediaUrl = '';
        mediaType = '';
      }

      // This object holds the final data, matching 'PostRequest'
      const postData: PostRequest = {
        content: this.content.trim(),
        mediaUrl: mediaUrl,
        mediaType: mediaType
      };

      // --- CHOOSE ACTION: UPDATE OR CREATE ---
      if (this.editingPost) {
        // --- UPDATE LOGIC ---
        this.postService.updatePost(this.editingPost.id, postData).subscribe({
          next: (response) => {
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
        // --- CREATE LOGIC (Original) ---
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

  // Helper to reset form and navigate
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
    this.resetFormAndNavigate(); // Use the new helper
  }
}