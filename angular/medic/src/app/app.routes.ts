import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { PatientLoginComponent } from './auth/patient-login/patient-login.component';
import { PatientSignupComponent } from './auth/patient-signup/patient-signup.component';
import { DoctorSignupComponent } from './auth/doctor-signup/doctor-signup.component';
import { GoogleSuccessComponent } from './auth/google-success/google-success.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeScreenComponent } from './dashboard/home-screen/home-screen.component';
import { DoctorsComponent } from './pages/doctors/doctors.component';
import { AppointmentsComponent } from './pages/appointments/appointments.component';
import { SymptomCheckerComponent } from './pages/symptom-checker/symptom-checker.component';
import { ChatHistoryComponent } from './pages/chat-history/chat-history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { authGuard, noAuthGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Root redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Auth routes — redirect to /home if already logged in
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'signup', component: PatientSignupComponent, canActivate: [noAuthGuard] },
  { path: 'patient-signup', component: PatientSignupComponent, canActivate: [noAuthGuard] },
  { path: 'doctor-signup', component: DoctorSignupComponent, canActivate: [noAuthGuard] },
  { path: 'doctor-login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'patient-login', component: PatientLoginComponent, canActivate: [noAuthGuard] },
  { path: 'auth/google-success', component: GoogleSuccessComponent },

  // Protected routes with layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeScreenComponent },
      { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' },
      { path: 'patient-dashboard', redirectTo: 'home', pathMatch: 'full' },
      { path: 'doctors', component: DoctorsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'symptom-checker', component: SymptomCheckerComponent },
      { path: 'chat-history', component: ChatHistoryComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'edit-profile', component: EditProfileComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'prescriptions', component: PrescriptionsComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'notifications', component: NotificationsComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'patient-login', pathMatch: 'full' }
];
