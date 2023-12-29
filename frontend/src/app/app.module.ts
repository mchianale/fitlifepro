import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { PrivateHomeComponent } from './private-home/private-home.component';
import { PublicHomeComponent } from './public-home/public-home.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { RegisterComponent } from './register/register.component';
import { ExerciseListComponent} from "./exercise-list/exercise-list.component";
import { ExerciseDetailComponent } from './exercise-detail/exercise-detail.component';
import { NewprogramComponent } from './newprogram/newprogram.component';
import { NewSessionComponent } from './new-session/new-session.component';
import { TimetableComponent } from './timetable/timetable.component';
import { FullCalendarModule} from "@fullcalendar/angular";
import { AddExerciseComponent} from "./add-exercise/add-exercise.component";
import { ProgramComponent } from './program/program.component';
import { SessionComponent } from './session/session.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { HomeContentComponent } from './home-content/home-content.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PrivateHomeComponent,
    PublicHomeComponent,
    UserAccountComponent,
    RegisterComponent,
    ExerciseListComponent,
    ExerciseDetailComponent,
    NewprogramComponent,
    NewSessionComponent,
    TimetableComponent,
    AddExerciseComponent,
    ProgramComponent,
    SessionComponent,
    HomeContentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),

  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }







