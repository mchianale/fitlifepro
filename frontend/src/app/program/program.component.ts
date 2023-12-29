import {Component, OnInit} from '@angular/core';
import { AuthService} from "../services/auth.service";
import { Router } from '@angular/router';
import { ProgramService} from "./program.service";
@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css']
})
export class ProgramComponent implements OnInit{
  programs: any[] = [];
  currentPage: number = 0;
  pageSize: number = 6; //programs per pages
  errorMessage: string | null = null;
  constructor(private router: Router, private  programService : ProgramService, private authService: AuthService) {
  }
  ngOnInit(): void {
    const token = this.authService.getAuthToken()
    if (token !== null && token !== ''){
      this.getProgramsForPage(this.currentPage,token);
    }
    else {
      this.router.navigate(['/']);
    }
  }
  getProgramsForPage(page: number, token : string): void {
    this.programService.getProgramsForPage(page, this.pageSize, token)
      .subscribe((data: any[]) => {
        this.programs = data;
      });
  }
  //For each program
  CreateNewProgram(){
    this.router.navigate(['new-program']);
  }
  UpdateProgram(program: any) {
    this.router.navigate(['manage_program', program.id_program]);
  }
  DeleteProgram(program : any) {
    const token = this.authService.getAuthToken()
    if (token !== null && token !== ''){
      this.programService.DeleteProgramByID(token, program.id_program)
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

  //page navigation logical
  hasMorePages(): boolean {
    // Calculate the total number of pages
    const totalPages = Math.ceil(this.programs.length / this.pageSize);
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
}
