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
import { authGuard, noAuthGuard, adminGuard, superAdminGuard, adminNoAuthGuard } from './core/guards/auth-guard';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin/dashboard/dashboard.component';
import { DoctorListComponent } from './admin/doctor-list/doctor-list.component';
import { PatientListComponent } from './admin/patient-list/patient-list.component';
import { DocumentVerificationComponent } from './admin/document-verification/document-verification.component';
import { CreateAdminComponent } from './admin/create-admin/create-admin.component';
import { DoctorDetailComponent } from './admin/doctor-detail/doctor-detail.component';
import { AdminSymptomCheckerComponent } from './admin/symptom-checker/symptom-checker.component';

export const routes: Routes = [
  // Root redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Patient / Doctor auth routes
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'signup', component: PatientSignupComponent, canActivate: [noAuthGuard] },
  { path: 'patient-signup', component: PatientSignupComponent, canActivate: [noAuthGuard] },
  { path: 'doctor-signup', component: DoctorSignupComponent, canActivate: [noAuthGuard] },
  { path: 'doctor-login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'patient-login', component: PatientLoginComponent, canActivate: [noAuthGuard] },
  { path: 'auth/google-success', component: GoogleSuccessComponent },

  // Admin login
  { path: 'admin-login', component: AdminLoginComponent, canActivate: [adminNoAuthGuard] },

  // Admin dashboard routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'doctors/:id', component: DoctorDetailComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'documents', component: DocumentVerificationComponent },
      { path: 'symptom-checker', component: AdminSymptomCheckerComponent },
    ],
  },

  // Super Admin dashboard routes
  {
    path: 'super-admin',
    component: AdminLayoutComponent,
    canActivate: [superAdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'doctors', component: DoctorListComponent },
      { path: 'doctors/:id', component: DoctorDetailComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'documents', component: DocumentVerificationComponent },
      { path: 'create-admin', component: CreateAdminComponent },
      { path: 'symptom-checker', component: AdminSymptomCheckerComponent },
    ],
  },

  // Protected patient/doctor routes with layout
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
      { path: 'notifications', component: NotificationsComponent },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'patient-login', pathMatch: 'full' },
];
