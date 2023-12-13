import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExerciceComponent } from './add-exercice.component';

describe('AddExerciceComponent', () => {
  let component: AddExerciceComponent;
  let fixture: ComponentFixture<AddExerciceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddExerciceComponent]
    });
    fixture = TestBed.createComponent(AddExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
