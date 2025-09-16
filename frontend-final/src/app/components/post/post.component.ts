// frontend/src/app/components/post/post.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../../services/post.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  @Input() post!: Post;
  @Output() like = new EventEmitter<Post>();

  onLike(): void {
    this.like.emit(this.post);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}