import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, Form} from '@angular/forms';
import { NodeCompatibleEventEmitter } from 'rxjs/internal/observable/fromEvent';
import {DonneesService} from '../../service/donnees.service';
import { Directive, ElementRef } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { yearsPerPage } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import {User} from '../../models/user';
import {LoginComponent} from '../login/login.component';
import {MatDialogRef} from '@angular/material/dialog';

function ratingRangeValidator(min: number, max: number): ValidatorFn{
  return(c: AbstractControl): {[key: string]: boolean} | null => {
  if (!! c.value && (isNaN(c.value) || c.value < min || c.value > max)){
    return {rangeError: true};
  }
  return null;
};
}

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {

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
function passwordMatcher(c: AbstractControl): { [key: string]: boolean } | null {

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
function checkBirthday(c: AbstractControl): { [key: string]: boolean } | null {
const date = formatDate( Date.now(), 'yyyy', 'en');
const dateControl = c.get('birthday');
const value = dateControl?.value;
const newDate = value.split('-');
const YearValue = newDate[0];
const Datenow = Number(date);
const DateUser = Number(YearValue);

if ((Datenow - DateUser) > 18){
      return null;
    }
return { match: true };

}
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
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
  };
private token = '';
  el: any;
  show = true;


  constructor(private http: HttpClient, private fb: FormBuilder, public dialogRef: MatDialogRef<UserComponent>) {
    this.registerFormOne = this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(1)]],
        lastName: ['', [Validators.required, Validators.minLength(1)]],
        emailGroup: this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          confirmEmail: ['', [Validators.required]],
        }, {validators: emailMatcher}),
        login: ['', [Validators.required, Validators.minLength(1)]],
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      }, { validators: passwordMatcher})
      });
    this.registerFormTwo = this.fb.group({
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      image: ['', [Validators.required, Validators.minLength(1)]],
      birthdayGroup: this.fb.group({
      birthday:  ['', [Validators.required]],
      }, {validators: checkBirthday}),
      adresse: ['', [Validators.required, Validators.minLength(1)]],
      ville: ['', [Validators.required, Validators.minLength(1)]],
      departement: ['', [Validators.required, Validators.minLength(1)]],
      postal: ['', [Validators.required, Validators.minLength(1)]],
      sendCatalog: false
  });

  }
  ngOnInit(): void {
    // this.registerForm.get('notification')?.valueChanges.subscribe(value => this.setNotificationSetting(value));
  }

  /*public checkBirthday(){
    const date = Date.now();
    const recup = this.registerFormOne.get('birthdayGroup')?.get('birthday')?.value
    YEAR(date)>YEAR(recup)
    const i = 0;
    if(i==0){
      return { match: true };
    }
    return null;
  }*/




  public saveDataFirst(){
     this.user.firstName = `${this.registerFormOne.get('firstName')?.value}`;
     this.user.lastName = `${this.registerFormOne.get('lastName')?.value}`;
     this.user.mail = this.registerFormOne.get('emailGroup')?.get('email')?.value;
     this.user.login = `${this.registerFormOne.get('login')?.value}`;
  }
  // tslint:disable-next-line:typedef
  public saveData(){
    this.isLoading = true;
   // console.log("values : " + JSON.stringify(this.registerFormTwo?.get('birthdayGroup')?.get('birthday')));
    const date = new Date(this.registerFormTwo?.get('birthdayGroup')?.get('birthday')?.value);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    const formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
  //  console.log("birthday : " + this.registerFormTwo.get('birthday')?.value);
 //   console.log("formattedDate" + formattedDate);
    const newUser = new User(this.user.firstName, this.user.lastName, this.user.mail, this.user.login,
      `${this.registerFormTwo.get('image')?.value}`, formattedDate,
      `${this.registerFormTwo.get('adresse')?.value}`, `${this.registerFormTwo.get('postal')?.value}`,
      `${this.registerFormTwo.get('ville')?.value}`, `${this.registerFormTwo.get('departement')?.value}`,
      `${this.registerFormTwo.get('phone')?.value}`);
    this.user.password = `${this.registerFormTwo.get('passwordGroup')?.get('password')?.value}`;
    const values = Object.assign({}, JSON.parse(JSON.stringify(newUser)), {password: `${this.user.password}`});
    console.log('valeurs: ', JSON.stringify(this.registerFormTwo.value));
    const headers1 = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');
    this.http.post(' http://localhost:3000/auth/subscribe/client', values,
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

}



function YEAR(date: number) {
  throw new Error('Function not implemented.');
}

