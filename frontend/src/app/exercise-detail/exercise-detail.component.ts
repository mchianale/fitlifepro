import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ExerciseDetailService } from './exercise-detail.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-exercise-detail',
  templateUrl: './exercise-detail.component.html',
  styleUrls: ['./exercise-detail.component.css']
})
export class ExerciseDetailComponent implements OnInit {
  exercise: any = {}

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private exerciseDetailService: ExerciseDetailService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const exerciseId = params['id'];
      this.exerciseDetailService.getExerciseById(exerciseId).subscribe(
        (data: any) => {
          this.exercise = data.ex;
          console.log(this.exercise)
        },
        error => {
          console.error(`Exercise doesn't exist: ${exerciseId}`, error);
        }
      );
    });
  }
  goBack() {
    this.location.back();
  }
}
