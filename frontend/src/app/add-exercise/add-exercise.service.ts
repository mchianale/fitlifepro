import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddExerciseService {

  constructor(private http: HttpClient) { }

  getExercisesForPage(page: number, pageSize: number, searchName : string,searchBodyPart : string ,withoutEquipment : boolean, selectedMuscles: { [muscle: string]: boolean}){
    const startIndex = page * pageSize;
    const body = {
      "searchName":searchName,
      "searchBodyPart":searchBodyPart,
      "withoutEquipment": withoutEquipment,
      "selectedMuscles" : selectedMuscles
    }
    return this.http.post(`http://localhost:3000/api/exercises/search_by_filters`, body).pipe(
      map((response: any) => {
        const exercises = response?.ExFiltered;

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

  postExercisesToSession(selectedExercises: any[], id_session : string){
    const body = {
      "selectedExercises" : selectedExercises
    }
    return this.http.post(`http://localhost:3000/api/update_session/${id_session}`, body);
  }
}
