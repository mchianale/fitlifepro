import { TestBed } from '@angular/core/testing';

import {SaveExerciseService} from "./saveExercise.service";

describe('', () => {
  let service: SaveExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
