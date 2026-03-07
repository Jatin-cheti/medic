import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService {
  private apiUrl = 'https://your-api-url.com/api/documents'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
