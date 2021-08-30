import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CalendarOptions, FullCalendarComponent} from '@fullcalendar/angular';
import {MatTooltip} from '@angular/material/tooltip'; // useful for typechecking


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  loading = false;
  updateForm!: FormGroup;
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');

  allProviderPricings: Map<string, any> = new Map<string, any>();
  pricingChecks: Map<string, any> = new Map<string, any>();
  provider: any;
  events = [{}];
  calendarOptions!: CalendarOptions;
  finishedLoading = false;

  constructor(private http: HttpClient, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initCalendar();
  }
  public async initCalendar(): Promise<any>
  {
      const provider = await this.http.get<any>(`http://localhost:3000/provider/userId/${sessionStorage.getItem('userId')}`,
        {headers: this.headers1}).toPromise();
      console.log(provider);
      const bookings = await this.http.get<any>(`http://localhost:3000/booking/providerBookings/${provider.userId}`,
        {headers: this.headers1}).toPromise();
      console.log(bookings);
      for (const booking of bookings)
      {
        const user = await this.http.get<any>(`http://localhost:3000/user/${booking.userId}`,
          {headers: this.headers1}).toPromise();
        const providerPricing = await this.http.get<any>(`http://localhost:3000/pricing/provider/id/${booking.pricingId}`,
          {headers: this.headers1}).toPromise();
        const pricing = await this.http.get<any>(`http://localhost:3000/pricing/id/${providerPricing.pricingId}`,
          {headers: this.headers1}).toPromise();
        const eventTitle = pricing.name + '\n'
                      + 'Commande #' + booking.id + '\n'
                      + 'Client : ' + user.firstName + ' ' + user.lastName + '\n'
                      + 'Adresse : ' + user.address + ', ' + user.zipcode + ' ' + user.city;
        const googleUrl = 'https://www.google.com/maps/dir/?api=1&origin=Chez%20moi&origin_place_id=' + provider.place_id +
        '&destination=chez%20' + user.firstName + '%20' + user.lastName +
        '&destination_place_id=' + user.place_id +
        '&travelmode=driving';
        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        this.events.push({
            title: eventTitle,
            start: startDate,
            end: endDate,
            url: googleUrl
          });
      }
      this.calendarOptions = {
        initialView: 'timeGridWeek',
        eventDidMount(info): void {
            info.el.title = 'Cliquez pour obtenir l\'itinéraire';
        },
        nextDayThreshold: '00:00:00',
      events: this.events,
      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      },
      dayHeaderFormat :
        {
          weekday: 'long',
          month : 'numeric',
          day : 'numeric',
          omitCommas : true
        },
        allDaySlot: false,
    };
      this.finishedLoading = true;
  }
}
