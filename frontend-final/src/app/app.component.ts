// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component'; // Add this import

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NavbarComponent], // Add NavbarComponent here
  template: `
    <app-navbar *ngIf="authService.isLoggedIn()"></app-navbar> <!-- Use the navbar component -->
    <div class="container-fluid p-0">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'frontend';
  constructor(public authService: AuthService) {}
}