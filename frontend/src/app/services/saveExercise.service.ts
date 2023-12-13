import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SaveExerciseService {
  private localStorageKey = 'selectedExercises';

  setSaveExercises(selectedExercises: any[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(selectedExercises));
  }

  getSaveExercises(): any[] {
    const storedData = localStorage.getItem(this.localStorageKey);
    try {
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error parsing stored data:', error);
      return [];
    }
  }

  clearSaveExercise(): void {
    localStorage.removeItem(this.localStorageKey);
  }

  isSaveExercisesEmpty(): boolean {
    const storedData = localStorage.getItem(this.localStorageKey);
    return !storedData || storedData === 'null';
  }
}
