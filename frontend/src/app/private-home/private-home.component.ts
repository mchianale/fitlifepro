import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DisconnectService} from "./disconnect.service";

@Component({
  selector: 'app-private-home',
  templateUrl: './private-home.component.html',
  styleUrls: ['./private-home.component.css']
})
export class PrivateHomeComponent implements OnInit{
  errorMessage: string | null = null;
  constructor(private authService: AuthService, private router: Router, private disconnectService : DisconnectService) {
  }

  ngOnInit() {
    const token = this.authService.getAuthToken();
    if (token === null || token === '') {
      this.router.navigate(['/']);
    }
    else{
      this.router.navigate(['/time-table']);
    }

  }

  navigateToUserWithToken(): void {
    const currentToken = this.authService.getAuthToken();

    if (currentToken) {
      // If a token exists, navigate to the user route with the current token
      this.router.navigate(['/user', currentToken]);
    } else {}
  }

  onButtonClick() {
    const currentToken = this.authService.getAuthToken();
    if (currentToken && currentToken != '') {
      this.disconnectService.disconnect(currentToken)
        .subscribe(
          (response: any) => {
            this.authService.clearAuthToken()
            this.router.navigate(['/']);
          },
        );
    }
  }
}
