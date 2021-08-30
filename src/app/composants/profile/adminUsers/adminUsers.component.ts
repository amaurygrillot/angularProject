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
import {User} from '../../../models/user';

@Component({
  selector: 'app-admin-users',
  templateUrl: './adminUsers.component.html',
  styleUrls: ['./adminUsers.component.css'],
  providers: [DatePipe]
})
export class AdminUsersComponent implements OnInit, AfterViewInit {
  @Input() profileType!: string;
  users: User[] = [];
  title!: string;
  filteredUsers!: Observable<User[]>;
  userControl = new FormControl();
  lastFilter = '';
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  image = sessionStorage.getItem('image');
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'mail', 'login', 'role', 'address', 'askChange'];
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, public dialog: MatDialog, private datePipe: DatePipe) {
  }

  ngOnInit(): void {

      this.getAllUsers();
  }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  filter(filter: string): User[] {
    this.lastFilter = filter;
    if (filter) {
      return this.users.filter(option => {
        return option.firstName.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || (option.id !== undefined && option.id?.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
          || option.lastName.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || (option.providerId !== undefined && option.providerId?.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
          || option.mail.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.login.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      console.log('bookings length ' + this.users.length);
      return this.users.slice();
    }
  }


  optionClicked(event: Event, user: Booking): void {
    event.stopPropagation();
  }

  async getAllUsers(): Promise<any>
  {
    this.http.get(`http://localhost:3000/user/`, { headers : this.headers1})
      .subscribe((data: any) => {
      data.forEach((user: any) => {
        console.log(user);
        this.users.push(new User(user.firstName, user.lastName, user.mail, user.login, user.image,
          user.birthdate, user.address, user.postal_code,
          user.city, user.department, user.phoneNumber, user.place_id,
          user.role, user.id));
      });
      this.filteredUsers = this.userControl.valueChanges.pipe(
        startWith<string | User[]>(this.users),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
      this.filteredUsers.subscribe(users => {
          this.dataSource.data = users as User[];
        });
    });
  }
  deleteAsked(user: User): void {
    this.deleteBooking(user).then(async () => {
      this.filteredUsers = this.userControl.valueChanges.pipe(
        startWith<string | User[]>(this.users),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
    });
  }

  async deleteBooking(user: User): Promise<User[] | null>
  {
    this.http.delete<any>(`http://localhost:3000/user/${user.id}`, { headers : this.headers1}).toPromise();
    this.users.forEach((value, index) => {
      if (value.id === user.id)
      {
        this.users.splice(index, 1);
        this.filteredUsers = EMPTY;

      }
    });
    return null;
  }
}
