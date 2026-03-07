import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationRatesService {
  private apiUrl = 'http://localhost:3000/api/consultation-rates'; // Update with your actual API endpoint

  constructor(private http: HttpClient) {}

  setConsultationRate(data: { rate: number; consultationType: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
