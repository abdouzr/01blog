import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar>
    <div class="container-fluid p-0">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'frontend';
  constructor(public authService: AuthService) {}
}
