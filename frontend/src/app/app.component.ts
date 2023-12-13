import {Component, OnInit} from '@angular/core';
import { AuthService } from './services/auth.service'
import { SaveExerciseService} from "./services/saveExercise.service";
import { SaveSearchService} from "./services/saveFilters.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit  {
  constructor(private authService: AuthService, private saveExercisesService : SaveExerciseService, private saveSearchService: SaveSearchService) {
  }

  ngOnInit(): void {
    //Clear session when restart
    this.authService.clearAuthToken();
    //Clear saved exercises
    this.saveExercisesService.clearSaveExercise();
    //Clear saved filters:
    this.saveSearchService.clearSavedSearch();
    // You can perform additional initialization here
    const currentToken = this.authService.getAuthToken();

    console.log('Current Token:', currentToken);
    console.log(this.isUserAuthenticated());
    console.log(this.saveExercisesService.getSaveExercises());
    console.log(this.saveSearchService.getSavedSearch());
  }
  isUserAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

}







