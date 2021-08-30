import {Component, Inject, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';
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
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './adminBookings.component.html',
  styleUrls: ['./adminBookings.component.css'],
  providers: [DatePipe]
})
export class AdminBookingsComponent implements OnInit, AfterViewInit {
  @Input() profileType!: string;
  bookings: Booking[] = [];
  title!: string;
  filteredBookings!: Observable<Booking[]>;
  userControl = new FormControl();
  lastFilter = '';
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  image = sessionStorage.getItem('image');
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'createdAt', 'startDate', 'endDate', 'price', 'providerId', 'userId', 'askChange'];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, public dialog: MatDialog, private datePipe: DatePipe) {
  }

  ngOnInit(): void {

      this.title = 'Vos réservations';
      this.getAllBookings();
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  filter(filter: string): Booking[] {
    this.lastFilter = filter;
    if (filter) {
      return this.bookings.filter(option => {
        return option.id.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.userId.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.providerId.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      console.log('bookings length ' + this.bookings.length);
      return this.bookings.slice();
    }
  }


  optionClicked(event: Event, user: Booking): void {
    event.stopPropagation();
  }

  async getAllBookings(): Promise<any>
  {
    this.http.get(`http://localhost:3000/booking/`, { headers : this.headers1})
      .subscribe((data: any) => {
      data.forEach((booking: any) => {
        this.bookings.push(new Booking(booking.id,
          booking.userId, booking.providerId, this.datePipe.transform(booking.startDate, 'MM/dd/yyyy hh:mm') || '',
          this.datePipe.transform(booking.endDate, 'MM/dd/yyyy hh:mm') || '',
          booking.pricingId, booking.price, this.datePipe.transform(booking.updateAt, 'MM/dd/yyyy hh:mm') || '',
          this.datePipe.transform(booking.createdAt, 'MM/dd/yyyy') || ''));
      });
      this.filteredBookings = this.userControl.valueChanges.pipe(
        startWith<string | Booking[]>(this.bookings),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
      this.filteredBookings.subscribe(bookings => {
          this.dataSource.data = bookings as Booking[];
        });
    });
  }


  openDialog(fieldName: string, dbFieldName: string, fieldValue: string): void {
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

  showProviderProfile(providerId: string): void {
    const dialogRef = this.dialog.open(ProviderProfileComponent);
    dialogRef.afterClosed().subscribe(result => {
      // tslint:disable-next-line:no-eval


    });
  }

  deleteAsked(booking: Booking): void {
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
      if (value.id === booking.id)
      {
        this.bookings.splice(index, 1);
        this.filteredBookings = EMPTY;

      }
    });
    return null;
  }

  changeAsked(idBooking: string, providerId: string): void {
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
