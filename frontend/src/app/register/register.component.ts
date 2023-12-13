// login.component.ts
import { Component } from '@angular/core';
import { RegisterService } from './register.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  mail: string = '';
  firstname: string= '';
  lastname: string= '';
  mdp: string = '';
  errorMessage: string | null = null;
  constructor(private registerService: RegisterService, private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.registerService.register(this.mail, this.firstname, this.lastname, this.mdp)
      .subscribe(
        (response: any) => {
          // Assuming the backend returns a token upon successful login
          const token = response.token;

          // You can now handle the token as needed (e.g., store it in local storage)
          console.log('Token:', token);
          this.authService.setAuthToken(token);
          // Redirect to private home
          this.router.navigate(['/']);
        },
        (error) => {
          if (error.status === 401) {
            this.errorMessage = `User already exists with mail: ${this.mail}`
          }
          else if (error.status === 404) {
            this.errorMessage = 'please input a valid password, with at least 6 characters and at least one special charactere'
          }
          else if (error.status === 406) {
            this.errorMessage =  'please input a valid firstname'
          }
          else if (error.status === 403) {
            this.errorMessage = 'please input a valid lastname'
          }
          else {
            this.errorMessage = "Din't manage to register a new account"
          }
        }
      );
  }
}

