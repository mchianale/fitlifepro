// exercise-list.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExerciseListService {

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
          return {exercises: exercises.slice(startIndex, startIndex + pageSize), full_size:  exercises.length} ;
        } else {
          // Handle the case where exercises is not an array
          console.error('Unexpected data format for exercises:', response);
          return {exercises: [],full_size: 0};
        }
      })
    );
  }

  postExerciseBySearch(searchName : string,searchBodyPart : string ,withoutEquipment : boolean, selectedMuscles: { [muscle: string]: boolean }){
    const body = {
    "searchName":searchName,
      "searchBodyPart":searchBodyPart,
      "withoutEquipment": withoutEquipment,
      "selectedMuscles" : selectedMuscles
  }
    return this.http.post(`http://localhost:3000/api/exercises/search_by_filters`, body);
  }
}
