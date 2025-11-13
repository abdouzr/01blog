// frontend/src/app/components/create-post/create-post.component.ts
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService, Post, PostRequest, UploadResponse } from '../../services/post.service'; 
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
  selectedFiles: File[] = [];
  previewUrls: {url: string, type: string, file: File}[] = [];
  isSubmitting: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;

  editingPost: Post | null = null;

  constructor(
    private postService: PostService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['post']) {
      this.editingPost = navigation.extras.state['post'] as Post;
      this.loadPostData();
    } 
    else if (window.history.state && window.history.state['post']) {
      this.editingPost = window.history.state['post'] as Post;
      this.loadPostData();
    }
  }

  private loadPostData(): void {
    if (this.editingPost) {
      console.log('📝 Loading post data for editing:', this.editingPost);
      
      this.content = this.editingPost.content || '';
      
      // Load existing media
      if (this.editingPost.mediaUrls && this.editingPost.mediaUrls.length > 0) {
        this.previewUrls = this.editingPost.mediaUrls.map((url, index) => ({
          url: this.getMediaUrl(url),
          type: this.editingPost!.mediaTypes[index],
          file: null as any // Existing files don't have File objects
        }));
      }
    }
  }

  getMediaUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8081${url}`; 
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      // Check total files (existing + new)
      const totalFiles = this.previewUrls.length + files.length;
      if (totalFiles > 10) {
        this.snackBar.open('Maximum 10 files allowed per post', 'Close', { duration: 3000 });
        return;
      }

      files.forEach(file => {
        // Check file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          this.snackBar.open(`File ${file.name} is too large (max 50MB)`, 'Close', { duration: 3000 });
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          this.snackBar.open(`File ${file.name} is not an image or video`, 'Close', { duration: 3000 });
          return;
        }

        this.selectedFiles.push(file);
        
        const reader = new FileReader();
        reader.onload = (e: any) => { 
          this.previewUrls.push({
            url: e.target.result,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            file: file
          });
        };
        reader.readAsDataURL(file);
      });

      // Reset file input
      input.value = '';
    }
  }

  removeFile(index: number): void {
    const removed = this.previewUrls.splice(index, 1)[0];
    
    // Remove from selectedFiles if it's a new file
    if (removed.file) {
      this.selectedFiles = this.selectedFiles.filter(f => f !== removed.file);
    }
  }

  async createPost(): Promise<void> {
    // Validation
    if (!this.content.trim() && this.previewUrls.length === 0) {
      this.snackBar.open('Please add some content or upload files', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    try {
      const mediaUrls: string[] = [];
      const mediaTypes: string[] = [];
      const cloudinaryPublicIds: string[] = [];

      // Upload new files
      if (this.selectedFiles.length > 0) {
        this.isUploading = true;
        
        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file = this.selectedFiles[i];
          try {
            const uploadResult = await this.postService.uploadFile(file).toPromise();
            if (uploadResult) {
              mediaUrls.push(uploadResult.fileUrl);
              mediaTypes.push(uploadResult.mediaType);
              cloudinaryPublicIds.push(uploadResult.publicId);
            }
            
            // Update progress
            this.uploadProgress = ((i + 1) / this.selectedFiles.length) * 100;
          } catch (error) {
            console.error('❌ Error uploading file:', error);
            this.snackBar.open(`Error uploading ${file.name}. Please try again.`, 'Close', { duration: 3000 });
            this.isSubmitting = false;
            this.isUploading = false;
            return;
          }
        }
        
        this.isUploading = false;
      }

      // Add existing media URLs (for edit mode)
      if (this.editingPost && this.editingPost.mediaUrls) {
        this.editingPost.mediaUrls.forEach((url, index) => {
          // Only add if it's not a new file (files without File objects)
          const isExistingFile = !this.previewUrls.find(p => p.url === this.getMediaUrl(url) && !p.file);
          if (isExistingFile) {
            mediaUrls.push(url);
            mediaTypes.push(this.editingPost!.mediaTypes[index]);
            // Note: For existing files, we might not have cloudinaryPublicIds
            // You may need to handle this differently based on your backend
            cloudinaryPublicIds.push(''); // or get from editingPost if available
          }
        });
      }

      const postData: PostRequest = {
        content: this.content.trim(),
        mediaUrls: mediaUrls,
        mediaTypes: mediaTypes,
        cloudinaryPublicIds: cloudinaryPublicIds
      };

      // EDIT vs CREATE LOGIC
      if (this.editingPost) {
        console.log('✏️ Updating post:', this.editingPost.id);
        
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
      console.error('❌ Error in post creation:', error);
      this.snackBar.open('Error creating post. Please try again.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      this.isUploading = false;
    }
  }

  private resetFormAndNavigate(): void {
    this.content = '';
    this.selectedFiles = [];
    this.previewUrls = [];
    this.isSubmitting = false;
    this.isUploading = false;
    this.uploadProgress = 0;
    this.editingPost = null;
    
    setTimeout(() => {
      this.router.navigate(['/feed']);
    }, 500);
  }

  cancel(): void {
    this.resetFormAndNavigate();
  }

  // Helper method to check if preview is an existing file (not newly uploaded)
  isExistingFile(preview: any): boolean {
    return !preview.file;
  }
}