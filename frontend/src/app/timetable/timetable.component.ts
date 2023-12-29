import {Component, HostListener, OnInit} from '@angular/core';
import {CalendarEvent, CalendarView, CalendarEventAction} from "angular-calendar";
import {isSameWeek, isSameMonth} from 'date-fns';
import {Subject} from "rxjs";
import {TimetableService} from './timetable.service'
import { AuthService} from "../services/auth.service";
import { Router} from "@angular/router";
@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css']
})
export class TimetableComponent implements OnInit{
  viewDate: Date = new Date()
  view: CalendarView = CalendarView.Week;
  CalendarView = CalendarView;
  events: CalendarEvent[] = [];
  activeDayIsOpen = false;
  refresh = new Subject<void>()
  token: string | null = null
  showAddEventForm = false;
  newEventTitle = '';
  newEventStart: Date | null = null;
  newEventEnd: Date | null = null;
  newEventColor = '#ff0000';
  newSecondaryColor = '#FFB6C1'
  newTextColor = '#ff0000'
  errorMessage: string | null = null;
  constructor(private timetableService: TimetableService, private authService: AuthService, private router: Router) {
  }
  ngOnInit() {
    this.token = this.authService.getAuthToken();
    if (this.token === null || this.token === '') {
      this.router.navigate(['/']);
    }
    else {
      this.timetableService.getEvents(this.token).subscribe(
        (data: any[]) => {
          // Using a regular for loop
          for (let i = 0; i < data.length; i++) {
            let eventData = data[i];
            // Parse ISO date strings
            let startDate = new Date(eventData.start);
            let endDate = new Date(eventData.end);
            // Format dates into 'YYYY-MM-DDTHH:mm' format
            let startFormatted = new Date(startDate.toISOString().substring(0, 16));
            let endFormatted = new Date(endDate.toISOString().substring(0, 16));

            const event_ = {
              title: eventData.title,
              start: startFormatted,
              end: endFormatted,
              draggable: true,
              resizable: {
                beforeStart: true,
                afterEnd: true,
              },
              color: {
                primary: eventData.primary,
                secondary: eventData.secondary,
                secondaryText: eventData.secondaryText
              },
              actions: [this.deleteAction]
            };

            this.events.push(event_);
          }
          this.refresh.next();
        }
      );
        }
  }
  deleteAction: CalendarEventAction = {
    label: "<i>X</i>",
    onClick: ({ event }: { event: CalendarEvent }): void => {
      this.deleteEvent(event);
    }
  };

  setView(view: CalendarView) {
    this.view = view;
  }

  dayClicked({date, events} : { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameWeek(this.viewDate, date) && this.activeDayIsOpen) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      }
      else {
        this.activeDayIsOpen = true;
      }
    }
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log(event);
  }

  evenTimesChanged(event: any){
    event.event.start = event.newStart;
    event.event.end = event.newEnd;
    this.refresh.next()
  }


  toggleSidePanel(): void {
    this.showAddEventForm = !this.showAddEventForm;
  }
  addEvent(): void {
    if (this.token && this.newEventTitle && this.newEventStart && this.newEventEnd) {
      const newEvent: CalendarEvent = {
        title: this.newEventTitle,
        start: new Date(this.newEventStart),
        end: new Date(this.newEventEnd),
        color: {
          primary: this.newEventColor,
          secondary: this.newSecondaryColor,
          secondaryText: this.newTextColor
        },
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
        actions: [this.deleteAction]
      };
      this.events.push(newEvent);
      //push to DB
      this.timetableService.createNewEvent(this.token,this.newEventTitle,this.newEventStart, this.newEventEnd, this.newEventColor, this.newSecondaryColor, this.newTextColor )
        .subscribe(
          (response: any[]) => {

      },
          (error) => {
            this.errorMessage = error.error.message;
          })

      this.refresh.next();

      // Reset form and hide the side panel
      this.newEventTitle = '';
      this.newEventStart = null;
      this.newEventEnd = null;
      this.newEventColor = '#ff0000';
      this.newSecondaryColor = '#FFB6C1'
      this.newTextColor = '#ff0000'
      this.showAddEventForm = false;
    }
  }

  deleteEvent(eventToDelete: CalendarEvent): void {
    this.events = this.events.filter(event => event !== eventToDelete);
    if (this.token === null || this.token === '') {
      this.router.navigate(['/']);
    }
    else {
      this.timetableService.deleteEvent(this.token, eventToDelete.title).subscribe(
        (response: any[]) => {
            console.log(response)
        })
    }
    this.refresh.next();
  }

}
