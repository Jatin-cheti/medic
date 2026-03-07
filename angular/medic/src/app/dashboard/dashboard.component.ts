import { Component } from '@angular/core';
import { SymptomCheckerService } from '../services/symptom-checker.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  symptomData$: Observable<any>;

  constructor(private symptomCheckerService: SymptomCheckerService) {
    this.symptomData$ = this.symptomCheckerService.getSymptomData();
  }
}
