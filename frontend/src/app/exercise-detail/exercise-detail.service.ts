// exercise-list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExerciseDetailService {
  constructor(private http: HttpClient) { }

  getExerciseById(id: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/exercises/${id}`);
  }
}
