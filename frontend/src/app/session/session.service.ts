import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) {
  }

  getSessionForPage(page: number, pageSize: number, id_program : string): Observable<any> {
    const startIndex = page * pageSize;
    return this.http.get(`http://localhost:3000/api/program/sessions/${id_program}`).pipe(
      map((response: any) => {
        const sessions = response?.program_sessions;
        const current_program = response?.program;
        if (Array.isArray(sessions)) {
          return {
            sessions : sessions.slice(startIndex, startIndex + pageSize),
            current_program : current_program
          };
        } else {
          // Handle the case where exercises is not an array
          console.error('Unexpected data format for exercises:', response);
          return {};
        }
      })
    );
  }

  DeleteSessionByID(id_program: string, id_session : string): Observable<any> {
    return this.http.put(`http://localhost:3000/api/program/${id_program}/delete/${id_session}`, {});
  }

getExercisesForSessions(sessions : any[]): Observable<any>{
    const body = {
      sessions :sessions
    };
  return this.http.put(`http://localhost:3000/api/program/sessions/exercises`, body);
}

}

