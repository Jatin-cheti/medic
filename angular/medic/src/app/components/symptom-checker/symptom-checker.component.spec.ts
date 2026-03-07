import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SymptomCheckerComponent } from './symptom-checker.component';
import { SymptomCheckerService } from '../../services/symptom-checker.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('SymptomCheckerComponent', () => {
  let component: SymptomCheckerComponent;
  let fixture: ComponentFixture<SymptomCheckerComponent>;
  let symptomCheckerService: jasmine.SpyObj<SymptomCheckerService>;

  beforeEach(async () => {
    const symptomCheckerServiceSpy = jasmine.createSpyObj('SymptomCheckerService', ['checkSymptoms']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [SymptomCheckerComponent],
      providers: [{ provide: SymptomCheckerService, useValue: symptomCheckerServiceSpy }],
    }).compileComponents();

    symptomCheckerService = TestBed.inject(SymptomCheckerService) as jasmine.SpyObj<SymptomCheckerService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SymptomCheckerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.symptoms = [];
  });

  describe('checkSymptoms', () => {
    it('should call SymptomCheckerService and display diagnosis and recommendations', () => {
      const symptoms = ['fever', 'cough'];
      const mockResponse = {
        diagnosis: 'Flu',
        recommendations: ['Rest', 'Hydration', 'Consult a doctor if symptoms persist'],
      };

      symptomCheckerService.checkSymptoms.and.returnValue(of(mockResponse));
      component.symptoms = symptoms;

      component.checkSymptoms();

      expect(symptomCheckerService.checkSymptoms).toHaveBeenCalledWith(symptoms);
      expect(component.diagnosis).toBe(mockResponse.diagnosis);
      expect(component.recommendations).toEqual(mockResponse.recommendations);
    });

    it('should handle errors from the service', () => {
      const symptoms = ['fever'];
      symptomCheckerService.checkSymptoms.and.returnValue(throwError('Service error'));
      component.symptoms = symptoms;

      component.checkSymptoms();

      expect(symptomCheckerService.checkSymptoms).toHaveBeenCalledWith(symptoms);
      expect(component.errorMessage).toBe('An error occurred while checking symptoms.');
    });
  });

  describe('UI Tests', () => {
    it('should display diagnosis and recommendations when symptoms are checked', () => {
      component.diagnosis = 'Flu';
      component.recommendations = ['Rest', 'Hydration'];
      fixture.detectChanges();

      const diagnosisElement = fixture.debugElement.query(By.css('.diagnosis')).nativeElement;
      const recommendationsElement = fixture.debugElement.query(By.css('.recommendations')).nativeElement;

      expect(diagnosisElement.textContent).toContain('Flu');
      expect(recommendationsElement.textContent).toContain('Rest');
      expect(recommendationsElement.textContent).toContain('Hydration');
    });
  });
});
