// login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TimetableService {

  constructor(private http: HttpClient) { }
  getEvents(token: string): Observable<any> {
    return this.http.get(`http://localhost:3000/api/events/${token}`).pipe(
      map((response: any) => {
        const exercises = response?.user_events;
        if (Array.isArray(exercises)) {
          return exercises
        } else {
          // Handle the case where exercises is not an array
          console.error('Unexpected data format for exercises:', response);
          return [];
        }
      })
    )
  }
  createNewEvent(token : string, title : string, start : Date, end : Date, primary: string, secondary: string, secondaryText: string ): Observable<any> {
    const body = {
      title: title,
      start: start,
      end: end,
      primary: primary,
      secondary: secondary,
      secondaryText: secondaryText
    };
    return this.http.post(`http://localhost:3000/api/new_event/${token}`, body);
  }

  deleteEvent(token : string, title : string): Observable<any>{
    return this.http.put(`http://localhost:3000/api/delete_event/${token}/${title}`, {});
  }
}
