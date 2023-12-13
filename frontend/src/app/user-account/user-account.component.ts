import { Component,  OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {InformationsService} from "./informations.service";

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent implements OnInit {
  errorMessage: string | null = null;
  userInformation = {
    mail: '',
    firstname: '',
    lastname : ''
  }

  constructor(private informationsService: InformationsService, private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    const currentToken = this.authService.getAuthToken();
    if (currentToken) {
      this.informationsService.getInformation(currentToken)
        .subscribe(
          (response: any) => {
            this.userInformation = response;
          },
          (error) => {
            this.errorMessage = 'Error';
          }
        );
    } else {
      this.errorMessage = 'Invalid Access'
    }
  }
}
