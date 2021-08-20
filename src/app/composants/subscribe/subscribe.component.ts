/// <reference types="@types/google.maps" />
import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, Form, FormControl, ValidationErrors} from '@angular/forms';
import { NodeCompatibleEventEmitter } from 'rxjs/internal/observable/fromEvent';
import {DonneesService} from '../../service/donnees.service';
import { Directive, ElementRef } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { yearsPerPage } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import {User} from '../../models/user';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.css']
})
export class SubscribeComponent implements OnInit {
  isLoading = false;

public registerFormOne: FormGroup;
public registerFormTwo: FormGroup;
   user = {firstName: '',
     lastName: '',
    mail: '',
    login: '',
    password: '',
    image: '',
    birthday: '',
    address: '',
    city: '',
    province: '',
    postalCode: ''
  };
private token = '';
  show = true;
  title = 'google-places-autocomplete';
  userAddress = '';
  userLatitude = '';
  userLongitude = '';
  postalCode: any;
  maxDate = new Date();

  constructor(private http: HttpClient, private fb: FormBuilder,
              public dialogRef: MatDialogRef<SubscribeComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(this.maxDate);
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
    console.log(this.maxDate.getFullYear());
    this.registerFormOne = this.fb.group({
        firstName: new FormControl(),
        lastName: new FormControl(),
        login: new FormControl(),
        emailGroup: this.fb.group({
          email: new FormControl(),
          confirmEmail: new FormControl(),
          },
          {validators: this.emailMatcher}),
        passwordGroup: this.fb.group({
          password: new FormControl(),
          confirmPassword: new FormControl(),
          },
        { validators: this.passwordMatcher})
      });
    this.registerFormTwo = this.fb.group({
      phone: new FormControl(),
      birthday:  new FormControl(),
      image: new FormControl(),
      adresse: new FormControl('', [this.checkAddress]),
      maximum_range: new FormControl(),
      description: new FormControl()
  });

  }
  ngOnInit(): void {
    // this.registerForm.get('notification')?.valueChanges.subscribe(value => this.setNotificationSetting(value));
  }

  public handleAddressChange(address: any): void {
    console.log(address);
    this.user.address = address.name;
    this.user.city = address.address_components[2].long_name;
    this.user.province = address.address_components[4].long_name;
    this.user.postalCode = address.address_components[6].long_name;
    this.registerFormTwo.get('adresse')?.setValue(address.name);
    // this.userLatitude = address.geometry.location.lat();
    // this.userLongitude = address.geometry.location.lng();
  }

  public saveDataFirst(): void{
     this.user.firstName = `${this.registerFormOne.get('firstName')?.value}`;
     this.user.lastName = `${this.registerFormOne.get('lastName')?.value}`;
     this.user.mail = this.registerFormOne.get('emailGroup')?.get('email')?.value;
     this.user.login = `${this.registerFormOne.get('login')?.value}`;
     this.user.password = `${this.registerFormOne.get('passwordGroup')?.get('password')?.value}`;
  }

  public saveUserData(): void{
    this.isLoading = true;
    const date = new Date(this.registerFormTwo?.get('birthday')?.value);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    const formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
    const newUser = new User(this.user.firstName, this.user.lastName, this.user.mail, this.user.login,
      `${this.registerFormTwo.get('image')?.value}`, formattedDate,
      this.user.address, this.user.postalCode, this.user.city, this.user.province,
      `${this.registerFormTwo.get('phone')?.value}`);
    const values = Object.assign({}, JSON.parse(JSON.stringify(newUser)), {password: `${this.user.password}`});
    console.log('valeurs: ', JSON.stringify(this.registerFormTwo.value));
    const headers1 = new HttpHeaders()
      .set('Content-Type', 'application/json');
    this.http.post(' http://localhost:3000/auth/subscribe/client', values,
        { headers : headers1, responseType: 'text'})
        .subscribe(data => {
      this.token = data;
      this.dialogRef.close();
    });
    this.isLoading = false;
  }


  public saveProviderData(): void{
    this.isLoading = true;
    const date = new Date(this.registerFormTwo?.get('birthday')?.value);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    const formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
    const newUser = new User(this.user.firstName, this.user.lastName, this.user.mail, this.user.login,
      `${this.registerFormTwo.get('image')?.value}`, formattedDate,
      this.user.address, this.user.postalCode, this.user.city, this.user.province,
      `${this.registerFormTwo.get('phone')?.value}`);
    const values = Object.assign({}, JSON.parse(JSON.stringify(newUser)),
      {
                password: `${this.user.password}`,
                maximum_range: `${this.registerFormTwo.get('maximum_range')}`,
                description: `${this.registerFormTwo.get('description')}`
              });
    console.log('valeurs: ', JSON.stringify(this.registerFormTwo.value));
    const headers1 = new HttpHeaders()
      .set('Content-Type', 'application/json');
    this.http.post(' http://localhost:3000/auth/subscribe/provider', values,
      { headers : headers1, responseType: 'text'})
      .subscribe(data => {
        this.token = data;
        this.dialogRef.close();
      });
    this.isLoading = false;
  }

  // tslint:disable-next-line:typedef

  showLogin() {
    this.show = false;
  }

  public emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {

    const emailControl = c.get('email');
    const emailConfirmControl = c.get('confirmEmail');

    if (emailControl?.pristine || emailConfirmControl?.pristine) {
      return null;
    }

    if (emailControl?.value === emailConfirmControl?.value) {
      return null;
    }

    return { match: true };

  }
  public passwordMatcher(c: AbstractControl): { [key: string]: boolean } | null {

  const passwordControl = c.get('password');
  const passwordConfirmControl = c.get('confirmPassword');

  if (passwordControl?.pristine || passwordConfirmControl?.pristine) {
    return null;
  }

  if (passwordControl?.value === passwordConfirmControl?.value) {
    return null;
  }

  return { match: true };

}

  saveData(): void {
    if (this.data.providerSubscribe)
    {
      this.saveProviderData();
    }
    else
    {
      this.saveUserData();
    }
  }

  public checkAddress(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.registerFormTwo.get('adresse')?.value === this.user.address ?
        {address: this.registerFormTwo.get('adresse')?.value} : null;
    };
  }
}

