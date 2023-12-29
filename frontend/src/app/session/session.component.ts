import {Component, OnInit} from '@angular/core';
import { AuthService} from "../services/auth.service";
import {ActivatedRoute, Router} from '@angular/router';
import {SessionService} from "./session.service";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css']
})
export class SessionComponent implements OnInit{
  id_program: string = '';
  current_program: any = {}
  sessions: any[] = [];
  exercises_per_session = [];

  currentPage: number = 0;
  pageSize: number = 6; //sessions per pages
  errorMessage: string | null = null;
  constructor(private route: ActivatedRoute, private router: Router, private sessionService : SessionService, private authService: AuthService) {
  }
  ngOnInit(): void {
    const token = this.authService.getAuthToken()
    if (token !== null && token !== ''){
      this.route.params.subscribe(params => {
        this.id_program= params['id_program'];
      });
      this.getSessionsForPage(this.currentPage);
    }
    else {
      this.router.navigate(['/']);
    }
  }
  getSessionsForPage(page: number): void {
    this.sessionService.getSessionForPage(page, this.pageSize, this.id_program)
      .subscribe((data: any) => {
        this.sessions = data.sessions;
        this.current_program = data.current_program;
        console.log(this.sessions);
        this.sessionService.getExercisesForSessions(this.sessions)
          .subscribe(((data: any) : void => {
            this.exercises_per_session = data.exercises_per_session;
            console.log(this.exercises_per_session);
          }))
      });
  }
  //For each session
  UpdateSession(session: any) {
    this.router.navigate(['update-session', session.id_session])
  }
  DeleteSession(session: any) {
    const token = this.authService.getAuthToken()
    if (token !== null && token !== ''){
      this.sessionService.DeleteSessionByID(this.id_program, session.id_session)
        .subscribe(
          (response: any) => {
            this.ngOnInit();
          },
          (error) => {
            this.errorMessage = error.error.message;
          });
    }
    else {
      this.router.navigate(['/']);
    }

  }

  CreateNewSession() {
    this.router.navigate(['/new-session',this.id_program]);
  }

  AddDescription() {

  }

  //page navigation logical
  hasMorePages(): boolean {
    // Calculate the total number of pages
    const totalPages = Math.ceil(this.sessions.length / this.pageSize);
    // Check if there are more pages
    return this.currentPage < totalPages - 1;
  }
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
  nextPage(): void {
    this.currentPage++;
  }

  GoBack() {
    this.router.navigate(['my_programs']);
  }

  navigateToExercise(exerciseId: string): void {
    this.router.navigate(['/exercises', exerciseId]);
  }
}
