import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Address } from '../../models/address';
import { finalize, switchMap } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // newUser: User = new User();
  newUser: User = new User();
  errorMessage = '';
  submitting = false;


  constructor(
    private auth: AuthService,
    private router: Router
  ){

  }
  register(user: User) : void {
    if (this.submitting) return;
    this.errorMessage = '';
    this.submitting = true;
    let registered = false;
    this.auth.register(user).pipe(
      switchMap(() => {
        registered = true;
        return this.auth.login(user.username, user.password);
      }),
      finalize(() => this.submitting = false)
    ).subscribe({
      next: () => this.router.navigateByUrl('/landing'),
      error: () => {
        this.errorMessage = registered
          ? 'Your account was created. Please use the login page to sign in.'
          : 'Registration failed. Check your details or try a different username.';
      }
    });
  }

}
