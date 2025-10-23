// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { FeedComponent } from './components/feed/feed.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard'; // <-- IMPORT NEW GUARD

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] },
  { path: 'create-post', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'profile/:id', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationComponent, canActivate: [AuthGuard] },
  
  // --- THIS ROUTE IS UPDATED ---
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [adminGuard] // <-- USE THE NEW ADMIN GUARD
  }, 
  
  { path: '**', redirectTo: '/feed' }
];