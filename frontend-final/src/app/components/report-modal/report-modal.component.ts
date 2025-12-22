import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../services/report.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent implements OnInit, OnDestroy {
  @Input() reportTargetId!: number;
  @Input() reportType: 'POST' | 'USER' = 'POST';
  @Input() modalId: string = 'reportModal';
  @Input() postElementId?: string; // Optional: ID of the post element being reported

  reportForm: FormGroup;
  isLoading = false;
  private originalPostStyles: Map<HTMLElement, any> = new Map();
  private allPostsHidden = false;
  private reportedPostElement: HTMLElement | null = null;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.reportForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.initializeModalListeners();
  }

  /**
   * Programmatically show the modal (used when Bootstrap data attributes are not triggering)
   */
  showModal(): void {
    const modalElement: HTMLElement | null = document.getElementById(this.modalId);
    if (!modalElement) return;

    // Display modal
    modalElement.style.display = 'block';
    modalElement.classList.add('show');

    // Add backdrop
    let backdrop = document.querySelector('.modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
    }

    // Prevent body scroll
    document.body.classList.add('modal-open');

    // Trigger the same logic as if modal were shown
    try {
      this.hideOtherPosts(this.postElementId);
    } catch (e) {
      // ignore
    }
  }

  ngOnDestroy(): void {
    this.showAllPosts(); // Ensure posts are restored when component is destroyed
  }

  /**
   * Initialize modal event listeners
   */
  private initializeModalListeners(): void {
    // Listen for modal show event
    const modalElement = this.elementRef.nativeElement.querySelector('.modal');
    if (modalElement) {
      // Use Bootstrap modal events
      modalElement.addEventListener('show.bs.modal', (event: any) => {
        this.onModalShow(event);
      });

      modalElement.addEventListener('hide.bs.modal', () => {
        this.onModalHide();
      });

      modalElement.addEventListener('hidden.bs.modal', () => {
        this.onModalHidden();
      });
    }
  }

  /**
   * Handle modal show event
   */
  onModalShow(event: any): void {
    // Extract post ID from the clicked report button
    const triggerElement = event.relatedTarget;
    const postId = triggerElement?.getAttribute('data-post-id') || 
                   triggerElement?.closest('[data-post-id]')?.getAttribute('data-post-id') ||
                   this.postElementId;

    // Hide other posts
    this.hideOtherPosts(postId);
  }

  /**
   * Handle modal hide event
   */
  onModalHide(): void {
    // Start restoring posts when modal starts to hide
    this.showAllPosts();
  }

  /**
   * Handle modal hidden event (after animation completes)
   */
  onModalHidden(): void {
    // Ensure all posts are restored
    this.showAllPosts();
  }

  /**
   * Hides all posts except the one being reported
   */
  private hideOtherPosts(targetPostId?: string): void {
    if (this.allPostsHidden || this.reportType === 'USER') return;
    
    // Get all post elements - adjust selectors based on your application
    const postSelectors = [
      '[class*="post"]',
      '[id*="post-"]',
      '.post-card',
      '.post-item',
      '.post-container',
      'article.post',
      'div.post'
    ];
    
    let allPosts: HTMLElement[] = [];
    
    // Collect all posts
    postSelectors.forEach(selector => {
      const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      allPosts = [...allPosts, ...elements];
    });
    
    // Remove duplicates
    allPosts = Array.from(new Set(allPosts));
    
    // Find the reported post element
    this.reportedPostElement = null;
    if (targetPostId) {
      this.reportedPostElement = document.getElementById(targetPostId) || 
                                document.querySelector(`[data-post-id="${targetPostId}"]`) as HTMLElement;
    }
    
    // Hide all posts except the reported one
    allPosts.forEach((postElement: HTMLElement) => {
      if (postElement !== this.reportedPostElement) {
        this.hidePost(postElement);
      } else {
        // Highlight the reported post
        this.highlightReportedPost(postElement);
      }
    });
    
    this.allPostsHidden = true;
  }

  /**
   * Shows all posts that were previously hidden
   */
  private showAllPosts(): void {
    if (!this.allPostsHidden) return;
    
    // Restore all hidden posts
    this.originalPostStyles.forEach((originalStyle, postElement) => {
      this.restorePost(postElement, originalStyle);
    });
    
    // Remove highlight from reported post
    if (this.reportedPostElement) {
      this.renderer.removeClass(this.reportedPostElement, 'post-being-reported');
    }
    
    this.originalPostStyles.clear();
    this.reportedPostElement = null;
    this.allPostsHidden = false;
  }

  /**
   * Hides a single post with visual effects
   */
  private hidePost(postElement: HTMLElement): void {
    // Store original styles and classes
    const originalStyle = {
      opacity: postElement.style.opacity || '',
      filter: postElement.style.filter || '',
      pointerEvents: postElement.style.pointerEvents || '',
      transform: postElement.style.transform || '',
      transition: postElement.style.transition || ''
    };
    
    // Store original classes
    const originalClasses = Array.from(postElement.classList);
    
    this.originalPostStyles.set(postElement, { style: originalStyle, classes: originalClasses });
    
    // Apply hiding styles
    this.renderer.setStyle(postElement, 'transition', 'all 0.4s ease-in-out');
    this.renderer.setStyle(postElement, 'opacity', '0.3');
    this.renderer.setStyle(postElement, 'filter', 'blur(4px)');
    this.renderer.setStyle(postElement, 'pointerEvents', 'none');
    this.renderer.setStyle(postElement, 'transform', 'scale(0.98)');
    
    // Add blur class
    this.renderer.addClass(postElement, 'post-blur-active');
  }

  /**
   * Highlights the post being reported
   */
  private highlightReportedPost(postElement: HTMLElement): void {
    this.renderer.addClass(postElement, 'post-being-reported');
    this.renderer.setStyle(postElement, 'z-index', '100');
    this.renderer.setStyle(postElement, 'position', 'relative');
  }

  /**
   * Restores a post to its original state
   */
  private restorePost(postElement: HTMLElement, originalData: any): void {
    // Restore original styles
    Object.keys(originalData.style).forEach(property => {
      if (originalData.style[property]) {
        this.renderer.setStyle(postElement, property, originalData.style[property]);
      } else {
        this.renderer.removeStyle(postElement, property);
      }
    });
    
    // Restore original classes
    postElement.className = '';
    originalData.classes.forEach((className: string) => {
      this.renderer.addClass(postElement, className);
    });
  }

  /**
   * Handle escape key to close modal and restore posts
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    const modalElement = document.getElementById(this.modalId);
    if (modalElement && modalElement.classList.contains('show')) {
      this.showAllPosts();
    }
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const reason = this.reportForm.value.reason;

    this.reportService.submitReport(this.reportTargetId, this.reportType, reason).subscribe({
      next: () => {
        this.snackBar.open('Report submitted successfully. Thank you!', 'Close', { duration: 5000 });
        this.reportForm.reset();
        
        // Optionally remove the reported post from view after successful report
        if (this.reportedPostElement && this.reportType === 'POST') {
          this.removeReportedPostWithEffect();
        } else {
          this.closeModalAndRestore();
        }
      },
      error: (err) => {
        console.error('Report submission error:', err);
        this.snackBar.open('Failed to submit report. Please try again.', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Removes the reported post with a fade-out effect
   */
  private removeReportedPostWithEffect(): void {
    if (!this.reportedPostElement) {
      this.closeModalAndRestore();
      return;
    }

    // Fade out the reported post
    this.renderer.setStyle(this.reportedPostElement, 'transition', 'all 0.5s ease');
    this.renderer.setStyle(this.reportedPostElement, 'opacity', '0');
    this.renderer.setStyle(this.reportedPostElement, 'transform', 'scale(0.8) translateY(20px)');
    
    // Wait for animation to complete, then remove
    setTimeout(() => {
      if (this.reportedPostElement && this.reportedPostElement.parentNode) {
        this.reportedPostElement.parentNode.removeChild(this.reportedPostElement);
      }
      
      // Restore other posts
      this.originalPostStyles.forEach((originalData, postElement) => {
        if (postElement !== this.reportedPostElement) {
          this.restorePost(postElement, originalData);
        }
      });
      
      this.originalPostStyles.clear();
      this.closeModalAndRestore();
    }, 500);
  }

  /**
   * Closes the modal and restores the UI
   */
  private closeModalAndRestore(): void {
    // Close modal without Bootstrap JS
    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
    }
    
    this.isLoading = false;
    this.showAllPosts();
  }

  /**
   * Cancel button handler
   */
  onCancel(): void {
    this.showAllPosts();
  }
}