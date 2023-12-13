// login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewprogramService {

  constructor(private http: HttpClient) { }

  createNewProgram(token : string, title : string, goal : string, description : string ): Observable<any> {

    const body = {
     title : title,
      goal : goal,
      description : description,
    };
    return this.http.post(`http://localhost:3000/api/new_program/${token}`, body);
  }
}
