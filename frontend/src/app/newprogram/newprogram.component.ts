import { Component } from '@angular/core';
import { NewprogramService} from "./newprogram.service";
import { AuthService} from "../services/auth.service";
import { Router} from "@angular/router";


@Component({
  selector: 'app-newprogram',
  templateUrl: './newprogram.component.html',
  styleUrls: ['./newprogram.component.css']
})
export class NewprogramComponent {
  title: string = '';
  goal: string= '';
  category: string= '';
  description: string = '';
  errorMessage: string | null = null;

  constructor(private newprogramService : NewprogramService, private authService: AuthService, private router: Router) {}
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
            console.log(`succes create new program ${id_program}`)
            this.errorMessage = ''
            this.router.navigate(['/new-session', id_program]);
          },
          (error) => {
            if (error.status === 401) {
              this.errorMessage = `Please provided a title`
            }
            else {
              this.errorMessage = 'Failed to create a new program'
            }
          })
    } else {
      this.errorMessage = 'Failed to load your session'
    }
  }
}
