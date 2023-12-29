import {Component, OnInit} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NewSessionService} from "./new-session.service";


@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.css']
})
export class NewSessionComponent implements OnInit{
  id_program = ''
  title = ''
  description : string = ''
  errorMessage: string | null = null;
  constructor(private newSessionService : NewSessionService, private authService: AuthService, private router: Router,private route: ActivatedRoute) {}
  ngOnInit(): void {
    const token = this.authService.getAuthToken();
    if (token === null || token === '') {
      this.router.navigate(['/']);
    }
    this.route.params.subscribe(params => {
      this.id_program= params['id_program'];
      console.log('program id:', this.id_program);
    });
  }
  onSubmit() {
    const token = this.authService.getAuthToken();
    if (token !== null && token !=='') {
      this.newSessionService.createNewSession(this.title, this.description, this.id_program, token)
        .subscribe(
          (response: any) => {
            this.router.navigate(['/update-session', response.id]);
          },
          (error) => {
              this.errorMessage = error.error.message;
          }
      );
  }}
}

