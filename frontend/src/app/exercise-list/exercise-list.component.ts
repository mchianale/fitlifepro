// exercise-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExerciseListService } from './exercise-list.service';
import { Router } from '@angular/router';
import {SaveSearchService} from "../services/saveFilters.service";
@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.css']
})
export class ExerciseListComponent implements OnInit {
  searchName: string = '';
  searchBodyPart: string = '';
  withoutEquipment: boolean = false;
  selectedMuscles: { [key: string]: boolean } = {};
  filter = {
    "searchName": this.searchName,
    "searchBodyPart": this.searchBodyPart,
    "withoutEquipment":  this.withoutEquipment,
    "selectedMuscles": this.selectedMuscles,
  }
  // Add an array of muscles for checkboxes
  muscles: string[] = [
    "delts",
    "quads",
    "pectorals",
    "adductors",
    "hamstrings",
    "serratus anterior",
    "forearms",
    "abs",
    "levator scapulae",
    "glutes",
    "upper back",
    "traps",
    "cardiovascular system",
    "abductors",
    "lats",
    "calves",
    "biceps",
    "triceps",
    "spine"
  ];

  exercises: any[] = [];
  currentPage: number = 0;
  pageSize: number = 20;
  full_size = 0
  constructor(private exerciseListService: ExerciseListService, private router : Router,
              private saveSearchService : SaveSearchService) { }

  ngOnInit(): void {
    const savedSearch= this.saveSearchService.getSavedSearch();
    this.searchName= savedSearch.searchName;
    this.searchBodyPart= savedSearch.searchBodyPart;
    this.withoutEquipment= savedSearch.withoutEquipment;
    this.selectedMuscles= savedSearch.selectedMuscles;
    this.getExercisesForPage(this.currentPage);
  }
  saveSearch(): void {
    const searchParameters =  {
      searchName: this.searchName,
      searchBodyPart: this.searchBodyPart,
      withoutEquipment: this.withoutEquipment,
      selectedMuscles: this.selectedMuscles,
    };
    this.saveSearchService.setSavedSearch(searchParameters);
  }
  getExercisesForPage(page: number): void {
    this.exerciseListService.getExercisesForPage(page, this.pageSize, this.searchName,this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
  }
  applyFilters(): void {
    this.exerciseListService.getExercisesForPage(0, this.pageSize, this.searchName,this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
    this.saveSearch();
    this.currentPage = 0;
    this.router.navigate(['/exercises']);

  }
  resetFilters() :void {
    this.searchName= '';
    this.searchBodyPart= '';
    this.withoutEquipment= false;
    this.selectedMuscles= {};
    this.saveSearch();
    this.exerciseListService.getExercisesForPage(0, this.pageSize, this.searchName,this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
    this.currentPage = 0;
    this.router.navigate(['/exercises']);
  }
  filterByMuscles(secondaryMuscles: string[]): boolean {
    return Object.keys(this.selectedMuscles).every(muscle => !this.selectedMuscles[muscle] || secondaryMuscles.includes(muscle));
  }
  navigateToExercise(exerciseId: string): void {
    this.router.navigate(['/exercises', exerciseId]);
  }
  hasMorePages(): boolean {
    // Calculate the total number of pages
    const totalPages = Math.ceil(this.full_size/ this.pageSize);
    // Check if there are more pages
    return this.currentPage < totalPages - 1;
  }
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.getExercisesForPage(this.currentPage);
    }
  }

  nextPage(): void {
    this.currentPage++;
    this.getExercisesForPage(this.currentPage);
  }
}
