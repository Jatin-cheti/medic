import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { PatientLoginComponent } from './auth/patient-login/patient-login.component';
import { PatientSignupComponent } from './auth/patient-signup/patient-signup.component';
import { DoctorSignupComponent } from './auth/doctor-signup/doctor-signup.component';
import { HomeScreenComponent } from './dashboard/home-screen/home-screen.component';
import { AuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'patient-login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: PatientSignupComponent },
  { path: 'patient-signup', component: PatientSignupComponent },
  { path: 'doctor-signup', component: DoctorSignupComponent },
  { path: 'doctor-login', component: LoginComponent },
  { path: 'patient-login', component: PatientLoginComponent },
  {
    path: 'home',
    component: HomeScreenComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];
