import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  constructor(private http: HttpClient) {
  }

  getProgramsForPage(page: number, pageSize: number, token: string): Observable<any> {
    const startIndex = page * pageSize;
    return this.http.get(`http://localhost:3000/api/programs/${token}`).pipe(
      map((response: any) => {
        const exercises = response?.user_programs;

        if (Array.isArray(exercises)) {
          return exercises.slice(startIndex, startIndex + pageSize);
        } else {
          // Handle the case where exercises is not an array
          console.error('Unexpected data format for exercises:', response);
          return [];
        }
      })
    );
  }

  DeleteProgramByID(token : string, id_program: string): Observable<any> {
    return this.http.put(`http://localhost:3000/api/delete_program/${token}/${id_program}`, {});
  }
}


