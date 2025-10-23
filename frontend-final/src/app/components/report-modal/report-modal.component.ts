// frontend/src/app/components/report-modal/report-modal.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportService } from '../../services/report.service'; // New service

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent {
  @Input() reportTargetId!: number;
  @Input() reportType: 'POST' | 'USER' = 'POST';
  @Input() modalId: string = 'reportModal';

  reportForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
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
        // Manually close modal (requires Bootstrap JS, assumed available)
        const modalElement = document.getElementById(this.modalId);
        if (modalElement) {
            // @ts-ignore
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to submit report. Please try again.', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }
}