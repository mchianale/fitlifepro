import {Component, OnInit} from '@angular/core';
import { NewprogramService} from "./newprogram.service";
import { AuthService} from "../services/auth.service";
import { Router} from "@angular/router";


@Component({
  selector: 'app-newprogram',
  templateUrl: './newprogram.component.html',
  styleUrls: ['./newprogram.component.css']
})
export class NewprogramComponent implements OnInit{
  title: string = '';
  goal: string= '';
  category: string= '';
  description: string = '';
  errorMessage: string | null = null;

  constructor(private newprogramService : NewprogramService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    //Avoid to go to this page without be log
    const token = this.authService.getAuthToken();
    if (token === null || token === '') {
      this.router.navigate(['/']);
    }

  }

  onSubmit() {
    const token = this.authService.getAuthToken();
    console.log('Selected Goal:', this.goal);
    console.log('Description:', this.description);
    console.log(token);
    if (token !== null && token !== ''){
      this.newprogramService.createNewProgram(token, this.title, this.goal, this.description)
        .subscribe(
          (response: any) => {
            const id_program = response.id
            console.log(`success create new program ${id_program}`)
            this.errorMessage = ''
            this.router.navigate(['/new-session', id_program]);
          },
          (error) => {
            this.errorMessage = error.error.message;
          })
    } else {
      this.errorMessage = 'Failed to load your session'
    }
  }
}
