// login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewSessionService {

  constructor(private http: HttpClient) { }

  createNewSession(title : string, description : string, id_program: string, token : string): Observable<any> {
    const body = {
     title : title,
      description : description
    };
    return this.http.post(`http://localhost:3000/api/new_session/${token}/${id_program}`, body);
  }
}
