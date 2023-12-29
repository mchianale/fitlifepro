import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PrivateHomeComponent} from "./private-home/private-home.component";
import { PublicHomeComponent} from "./public-home/public-home.component";
import { LoginComponent} from "./login/login.component";
import { RegisterComponent} from "./register/register.component";
import { UserAccountComponent} from "./user-account/user-account.component";
import { ExerciseListComponent} from "./exercise-list/exercise-list.component";
import { ExerciseDetailComponent} from "./exercise-detail/exercise-detail.component";
import { NewprogramComponent} from "./newprogram/newprogram.component";
import { NewSessionComponent} from "./new-session/new-session.component";
import { TimetableComponent} from "./timetable/timetable.component";
import { AddExerciseComponent} from "./add-exercise/add-exercise.component";
import { ProgramComponent} from "./program/program.component";
import  {SessionComponent} from "./session/session.component";
import {HomeContentComponent} from "./home-content/home-content.component"
const routes: Routes = [
  { path: 'public', component: PublicHomeComponent},
  { path : 'private', component: PrivateHomeComponent},
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  { path: `user/:token}`, component: UserAccountComponent},
  { path: 'exercises', component: ExerciseListComponent},
  { path: 'exercises/:id', component: ExerciseDetailComponent },
  { path: 'new-program', component: NewprogramComponent},
  { path: 'new-session/:id_program', component: NewSessionComponent},
  {path: 'time-table', component: TimetableComponent},
  {path: 'update-session/:id_session', component: AddExerciseComponent},
  {path: 'my_programs', component: ProgramComponent},
  {path: 'manage_program/:id_program', component : SessionComponent},
  {path: 'public-home', component: HomeContentComponent}
];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {useHash: true})
  ]
})
export class AppRoutingModule { }
