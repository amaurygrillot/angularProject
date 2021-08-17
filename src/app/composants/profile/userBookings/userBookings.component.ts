import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {UpdateDialogComponent} from '../updateDialog/updateDialog.component';
import {DatePipe} from '@angular/common';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ProviderProfileComponent} from '../providerProfile/providerProfile.component';
import {Booking} from '../../../models/booking';

@Component({
  selector: 'app-user-bookings',
  templateUrl: './userBookings.component.html',
  styleUrls: ['./userBookings.component.css'],
  providers: [DatePipe]
})
export class UserBookingsComponent implements OnInit {
  @Input() profileType!: string;
  bookings: Booking[] = [];
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
          || option.providerId.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      console.log('bookings length ' + this.bookings.length);
      return this.bookings.slice();
    }
  }

  optionClicked(event: Event, user: Booking) {
    event.stopPropagation();
  }

  getAllBookings()
  {
    this.http.get(`http://localhost:3000/booking/userBookings/${sessionStorage.getItem('userId')}`, { headers : this.headers1})
      .subscribe((data: any) => {
      data.forEach((booking: any) => {
        this.bookings.push(new Booking(booking.id,
          booking.userId, booking.providerId, this.datePipe.transform(booking.date, 'MM/dd/yyyy') || '',
          booking.pricingId, this.datePipe.transform(booking.updateAt, 'MM/dd/yyyy') || '',
          this.datePipe.transform(booking.createdAt, 'MM/dd/yyyy') || ''));
      });
      console.log('lenght book ' + this.bookings.length);
      this.filteredBookings = this.userControl.valueChanges.pipe(
        startWith<string | Booking[]>(this.bookings),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
    });

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

  showProviderProfile(providerId: string) {
    const dialogRef = this.dialog.open(ProviderProfileComponent);
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line:no-eval


    });
  }

  changeAsked(idBooking: string, providerId: string) {
    const body = {
      mail : '',
      bookingId : idBooking,
      providerMail: ''
    };
    this.http.get(`http://localhost:3000/user/${sessionStorage.getItem('userId')}`, { headers : this.headers1})
      .subscribe((user: any) => {
          body.mail = user.mail;
          this.http.get(`http://localhost:3000/provider/providerId/${providerId}`, { headers : this.headers1})
          .subscribe((provider: any) => {
            this.http.get(`http://localhost:3000/user/${provider.userId}`, { headers : this.headers1})
              .subscribe((providerUser: any) => {
                body.providerMail = providerUser.mail;
                this.http.post(`http://localhost:3000/booking/mail/update`, body, { headers : this.headers1})
                  .subscribe((data: any) => {

                  });
              });
          });
      });
  }
}
