import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface ReportRequest {
  targetId: number;
  targetType: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8081/api/reports';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  submitReport(targetId: number, targetType: 'POST' | 'USER', reason: string): Observable<any> {
    const reportRequest: ReportRequest = {
      targetId: targetId,
      targetType: targetType,
      reason: reason
    };

    console.log('Submitting report:', reportRequest);

    return this.http.post(this.apiUrl, reportRequest, { 
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}