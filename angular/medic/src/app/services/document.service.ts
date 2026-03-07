import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/api/documents';

  constructor(private http: HttpClient) {}

  getDocumentsForVerification(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/verification`);
  }

  updateDocumentStatus(documentId: string, action: string, comment?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${documentId}`, { action, comment });
  }
}
