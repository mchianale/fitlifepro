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
  full_size = 0

  id_session = ''
  selectedExercises: any[] = []
  errorMessage: string | null = null;

  constructor(private addExerciseService: AddExerciseService, private router: Router,
              private route: ActivatedRoute, private saveExercisesService: SaveExerciseService,
              private saveSearchService: SaveSearchService,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    const token = this.authService.getAuthToken();
    if (token === null || token === '') {
      this.router.navigate(['/']);
    }
    //Reload Saved Filters
    const savedSearch = this.saveSearchService.getSavedSearch();
    this.searchName = savedSearch.searchName;
    this.searchBodyPart = savedSearch.searchBodyPart;
    this.withoutEquipment = savedSearch.withoutEquipment;
    this.selectedMuscles = savedSearch.selectedMuscles;

    this.getExercisesForPage(this.currentPage);
    this.route.params.subscribe(params => {
      this.id_session = params['id_session'];
    });
    //If you update an older session and not a new, eed to reload its existing exercises
   this.addExerciseService.getExercisesForSession(this.id_session)
      .subscribe((data: any) => {
        const exes = data.exes;
        if(exes !== null && exes.length !== 0){
          this.selectedExercises = exes;
        }
      });
    //Reload stored exercises selected, avoid to delete them when you click to see more information about an exercise
    if (this.selectedExercises.length === 0 && !this.saveExercisesService.isSaveExercisesEmpty()) {
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
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
  }

  applyFilters(): void {
    this.saveSearch();
    this.addExerciseService.getExercisesForPage(0, this.pageSize, this.searchName, this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
    this.saveSearch();
    this.currentPage = 0;
    this.router.navigate(['/update-session', this.id_session]);
  }

  resetFilters(): void {
    this.searchName = '';
    this.searchBodyPart = '';
    this.withoutEquipment = false;
    this.selectedMuscles = {};
    this.saveSearch();
    this.addExerciseService.getExercisesForPage(this.currentPage, this.pageSize, this.searchName, this.searchBodyPart, this.withoutEquipment, this.selectedMuscles)
      .subscribe((data) => {
        this.exercises = data.exercises;
        this.full_size = data.full_size;
      });
    this.currentPage = 0;
    this.router.navigate(['/update-session', this.id_session]);
  }

  hasMorePages(): boolean {
    // Calculate the total number of pages
    const totalPages = Math.ceil(this.full_size / this.pageSize);
    // Check if there are more pages
    return this.currentPage < totalPages - 1;
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
          console.log(response.Programid)
          this.router.navigate(['manage_program', response.ProgramId]);
        },
        (error) => {
          this.errorMessage = error.error.message;
        }
      );
    }
  }
}
