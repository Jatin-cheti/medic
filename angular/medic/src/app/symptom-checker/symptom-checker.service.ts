import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SymptomCheckerService {
  private apiUrl = 'https://api.example.com/symptom-checker'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  checkSymptoms(symptoms: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { symptoms });
  }
}
