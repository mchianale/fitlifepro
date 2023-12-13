// exercise-list.component.ts
import { Component, OnInit } from '@angular/core';
import { AddExerciseService} from "./add-exercise.service";
import {ActivatedRoute, Router} from '@angular/router';
import {SaveExerciseService} from "../services/saveExercise.service";
import {SaveSearchService} from "../services/saveFilters.service";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-add-exercise',
  templateUrl: './add-exercise.component.html',
  styleUrls: ['./add-exercise.component.css']
})
export class AddExerciseComponent implements OnInit {
  searchName: string = '';
  searchBodyPart: string = '';
  withoutEquipment: boolean = false;
  selectedMuscles: { [key: string]: boolean } = {};
  filter = {
    "searchName": this.searchName,
    "searchBodyPart": this.searchBodyPart,
    "withoutEquipment": this.withoutEquipment,
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

  id_session = ''
  selectedExercises: any[] = []
  errorMessage: string | null = null;

  constructor(private addExerciseService: AddExerciseService, private router: Router,
              private route: ActivatedRoute, private saveExercisesService: SaveExerciseService,
              private saveSearchService: SaveSearchService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    //Reload Saved Filters
    const savedSearch = this.saveSearchService.getSavedSearch();
    this.searchName = savedSearch.searchName;
    this.searchBodyPart = savedSearch.searchBodyPart;
    this.withoutEquipment = savedSearch.withoutEquipment;
    this.selectedMuscles = savedSearch.selectedMuscles;

    this.getExercisesForPage(this.currentPage);
    this.route.params.subscribe(params => {
      this.id_session = params['id_session'];
      console.log('Session id:', this.id_session);
    });
    //Reload stored exercises selected, avoid to delete them when you click to see more information about an exercise
    if (!this.saveExercisesService.isSaveExercisesEmpty()) {
      this.selectedExercises = this.saveExercisesService.getSaveExercises();
    }
  }

  saveSearch(): void {
    const searchParameters = {
      searchName: this.searchName,
      searchBodyPart: this.searchBodyPart,
      withoutEquipment: this.withoutEquipment,
      selectedMuscles: this.selectedMuscles,
    };
    this.saveSearchService.setSavedSearch(searchParameters);
  }

  getExercisesForPage(page: number): void {
    this.addExerciseService.getExercisesForPage(page, this.pageSize, this.searchName, this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data: any[]) => {
        this.exercises = data;
      });
  }

  applyFilters(): void {
    this.saveSearch();
    this.addExerciseService.getExercisesForPage(0, this.pageSize, this.searchName, this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data: any[]) => {
        this.exercises = data;
      });
    this.saveSearch();
    this.currentPage = 0;
    this.router.navigate(['/add-exercise', this.id_session]);
  }

  resetFilters(): void {
    this.searchName = '';
    this.searchBodyPart = '';
    this.withoutEquipment = false;
    this.selectedMuscles = {};
    this.saveSearch();
    this.addExerciseService.getExercisesForPage(this.currentPage, this.pageSize, this.searchName, this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data: any[]) => {
        this.exercises = data;
      });
    this.currentPage = 0;
    this.router.navigate(['/add-exercise', this.id_session]);
  }

  filterByMuscles(secondaryMuscles: string[]): boolean {
    return Object.keys(this.selectedMuscles).every(muscle => !this.selectedMuscles[muscle] || secondaryMuscles.includes(muscle));
  }

  navigateToExercise(exerciseId: string): void {
    this.router.navigate(['/exercises', exerciseId]);
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

  // Select Exercise
  addToBoard(exercise: any) {
    this.selectedExercises.push(exercise);
    //Save current selectedExercises
    this.saveExercisesService.setSaveExercises(this.selectedExercises)
  }

  deleteFromBoard(selectedExercise: any) {
    const exerciseId = selectedExercise.id
    this.selectedExercises = this.selectedExercises.filter(exercise => exercise.id !== exerciseId);
    //Save current selectedExercises
    this.saveExercisesService.setSaveExercises(this.selectedExercises)
  }

  validate() {
    const token = this.authService.getAuthToken();
    if (token !== null && token !== '') {
      this.addExerciseService.postExercisesToSession(this.selectedExercises, this.id_session)
        .subscribe(
        (response: any) => {
          console.log(response.id)
          this.router.navigate(['/add-exercise', response.id]);
        },
        (error) => {
          if (error.status === 404) {
            this.errorMessage = `Please be connect`
          }
          else {
            this.errorMessage = `Failed to update session`
          }
        }
      );
    }
  }
}
