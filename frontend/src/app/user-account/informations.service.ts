// login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InformationsService {
  private apiUrl = 'http://localhost:3000/api'; // Replace with your actual backend URL

  constructor(private http: HttpClient) { }

  getInformation(token : string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/informations/${token}`);
  }
}
