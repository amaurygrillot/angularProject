import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {UpdateDialogComponent} from '../updateDialog/updateDialog.component';
import {DatePipe} from '@angular/common';
import {EMPTY, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ProviderProfileComponent} from '../providerProfile/providerProfile.component';
import {Booking} from '../../../models/booking';
import {User} from '../../../models/user';
import {UpdateBookingComponent} from './updateBooking/updateBooking.component';

@Component({
  selector: 'app-provider-bookings',
  templateUrl: './providerBookings.component.html',
  styleUrls: ['./providerBookings.component.css'],
  providers: [DatePipe]
})
export class ProviderBookingsComponent implements OnInit {
  @Input() profileType!: string;
  bookings: Booking[] = [];
  users = new Map();
  toolTipMessage = 'Mettre le champ à jour';
  title!: string;
  filteredBookings!: Observable<Booking[]>;
  userControl = new FormControl();
  lastFilter = '';
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  image = sessionStorage.getItem('image');
  constructor(private http: HttpClient, public dialog: MatDialog, private datePipe: DatePipe) {

  }

  ngOnInit(): void {

      this.title = 'Vos réservations';
      this.getAllBookings();
  }

  filter(filter: string): Booking[] {
    this.lastFilter = filter;
    if (filter) {
      return this.bookings.filter(option => {
        return option.id.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || this.users.get(option.userId).mail.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || this.users.get(option.userId).firstName.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || this.users.get(option.userId).lastName.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      return this.bookings.slice();
    }
  }

  optionClicked(event: Event, user: Booking) {
    event.stopPropagation();
  }

  async getAllBookings()
  {
    const data = await this.http.get<any>(`http://localhost:3000/booking/providerBookings/${sessionStorage.getItem('userId')}`, { headers : this.headers1}).toPromise();
    for (const booking of data) {
        this.bookings.push(new Booking(booking.id,
          booking.userId, booking.providerId, this.datePipe.transform(booking.date, 'MM/dd/yyyy') || '',
          booking.pricingId, this.datePipe.transform(booking.updateAt, 'MM/dd/yyyy') || '',
          this.datePipe.transform(booking.createdAt, 'MM/dd/yyyy') || ''));
        const user = await this.http.get<any>(`http://localhost:3000/user/${booking.userId}`, { headers : this.headers1}).toPromise();
        this.users.set(booking.userId, new User(user.firstName, user.lastName, user.mail, user.login,
          user.image, user.birthdate, user.addres, user.zipcode, user.city, user.province, user.phoneNumber));
    }
    this.filteredBookings = this.userControl.valueChanges.pipe(
        startWith<string | Booking[]>(this.bookings),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );

  }


  openDialog(fieldName: string, dbFieldName: string, fieldValue: string) {
    const values = {fieldName : `${fieldName}`,
      dbFieldName : `${dbFieldName}`,
      fieldValue : `${fieldValue}`};
    const dialogRef = this.dialog.open(UpdateDialogComponent, {data : values});
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line:no-eval
      eval(`this.user.${result.fieldName} = '${result.value}'`);
      console.log('The dialog was closed');

    });
  }
  changeAsked(ChosenBooking: Booking) {
    const values = {booking : ChosenBooking};
    const dialogRef = this.dialog.open(UpdateBookingComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      minHeight: '95%',
      minWidth: '50%',
      data : values});
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line:no-eval


    });
  }

  deleteAsked(booking: Booking) {
    this.deleteBooking(booking).then(async () => {
      this.filteredBookings = this.userControl.valueChanges.pipe(
        startWith<string | Booking[]>(this.bookings),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
    });
  }

  async deleteBooking(booking: Booking): Promise<Booking[] | null>
  {
    const user = this.http.get<any>(`http://localhost:3000/user/${booking.userId}`, { headers : this.headers1}).toPromise();
    let mail = '';
    user.then(value => {
      mail = value.mail;
    });
    const provider = this.http.get<any>(`http://localhost:3000/provider/providerId/${booking.providerId}`,
      { headers : this.headers1}).toPromise();
    let providerEmail = '';
    provider.then(value => {
      providerEmail = value.mail;
    });
    this.http.delete<any>(`http://localhost:3000/booking/${booking.id}`, { headers : this.headers1}).toPromise();
    this.bookings.forEach((value, index) => {
      if(value.id === booking.id)
      {
        this.bookings.splice(index, 1);
        this.filteredBookings = EMPTY;

      }
    });
    return null;
  }
}
