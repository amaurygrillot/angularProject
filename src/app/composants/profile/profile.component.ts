import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {User} from '../../models/user';
import {MatDialog} from '@angular/material/dialog';
import {LoginComponent} from '../login/login.component';
import {UpdateDialogComponent} from './updateDialog/updateDialog.component';
import {DatePipe} from '@angular/common';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ProviderProfileComponent} from './providerProfile/providerProfile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [DatePipe]
})
export class ProfileComponent implements OnInit {
  @Input() profileType!: string;
  @Input() providerId!: string;
  users: User[] = [];
  user: User = new User('', '', '', '', ''
    , '', '', '', '', '', '', '');
  toolTipMessage = 'Mettre le champ à jour';
  title!: string;
  filteredProviders!: Observable<User[]>;
  userControl = new FormControl();
  lastFilter = '';
  password !: string;
  image = sessionStorage.getItem('image');
  constructor(private http: HttpClient, public dialog: MatDialog, private datePipe: DatePipe) {

  }

  ngOnInit(): void {

    if (this.profileType === 'user')
    {
      this.title = 'Vos informations';
      this.getUser();
    }
    else {
      this.title = 'Voir les profils';
      this.getAllVerifiedProviders().then(async () => {
        this.filteredProviders = this.userControl.valueChanges.pipe(
          startWith<string | User[]>(this.users),
          map(value => typeof value === 'string' ? value : this.lastFilter),
          map(filter => this.filter(filter))
        );
      });
    }
  }

  filter(filter: string): User[] {
    this.lastFilter = filter;
    if (filter) {
      return this.users.filter(option => {
        return option.firstName.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.lastName.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      return this.users.slice();
    }
  }

  optionClicked(event: Event, user: User): void {
    event.stopPropagation();
  }

  async getAllVerifiedProviders(): Promise<User[] | null>
  {
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    const data = await this.http.get<any>(' http://localhost:3000/provider/verified', { headers : headers1}).toPromise();
    for (const provider of data) {
      const user = await this.http.get<any>(`http://localhost:3000/user/${provider.userId}`, { headers : headers1}).toPromise();
      const result = await this.http.get(`http://localhost:3000/user/file/${user.image}`,
        {headers: headers1, responseType: 'arraybuffer'}).toPromise();
      let binary = '';
      const bytes = new Uint8Array( result );
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
      }
      const image = 'data:image/jpeg;base64,' + btoa(binary);
      this.users.push(new User(user.firstName, user.lastName, user.mail, user.login, image,
        user.birthdate, user.address, user.zipcode, user.city, user.province, user.phoneNumber, provider.id));
    }
    return null;
  }



  async getUser(): Promise<null>
  {
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    this.http.get(`http://localhost:3000/user/session/${sessionStorage.getItem('token')}`, { headers : headers1})
      .subscribe((session: any) => {
        this.http.get(`http://localhost:3000/user/${session.userId}`, { headers : headers1})
          .subscribe(async (data: any) => {
            this.user = new User(data.firstName, data.lastName, data.mail, data.login, data.image,
              data.birthdate, data.address, data.zipcode, data.city, data.province, data.phoneNumber, data.place_id);
            this.user.firstName = data.firstName;
            this.user.lastName = data.lastName;
            this.user.mail = data.mail;
            this.user.birthdate = this.datePipe.transform(data.birthdate, 'MM/dd/yyyy') || '';
            this.password = data.password;
            this.user.login = data.login;
          });
      });
    return null;
  }

  openDialog(fieldName: string, dbFieldName: string, fieldValue: string | null): void {
    const values = {fieldName : `${fieldName}`,
      dbFieldName : `${dbFieldName}`,
      fieldValue : `${fieldValue}`};
    const dialogRef = this.dialog.open(UpdateDialogComponent, {data : values});
    dialogRef.afterClosed().subscribe(result => {
      this.user = new User(result.firstName, result.lastName, result.mail, result.login, result.image,
        result.birthdate, result.address, result.zipcode, result.city, result.province, result.phoneNumber, result.place_id);
      // tslint:disable-next-line:no-eval
      eval(`this.user.${result.fieldName} = '${result.value}'`);
      console.log('The dialog was closed');
      this.image = sessionStorage.getItem('image');
    });
  }

  showProviderProfile(providerId: string | undefined): void {
    const values = {providerId : `${providerId}`};
    const dialogRef = this.dialog.open(ProviderProfileComponent, {
      maxWidth: '100%',
      maxHeight: '100%',
      minHeight: '95%',
      minWidth: '50%',
      data : values});
    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
