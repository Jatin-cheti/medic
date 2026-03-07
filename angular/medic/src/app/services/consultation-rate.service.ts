import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationRateService {
  private apiUrl = 'http://your-api-url.com/api/consultation-rates';

  constructor(private http: HttpClient) {}

  setConsultationRate(data: { rate: number; type: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
