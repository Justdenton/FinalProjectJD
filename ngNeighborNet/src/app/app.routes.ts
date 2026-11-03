import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { NavigationbarComponent } from './components/navigationbar/navigationbar.component';
import { MapReportsComponent } from './components/map-reports/map-reports.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TestingComponent } from './components/testing/testing.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'landing', component: LandingComponent},
  {path: 'map', component: MapReportsComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'testing', component: TestingComponent},
  {path: 'admin', component: AdminComponent},
  {path: '**', redirectTo: 'home'},
];
