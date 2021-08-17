import { formatDate } from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../../models/user';
import {Diploma} from '../../models/diploma.model';
import {Experience} from '../../models/experience.model';
import {Pricing} from '../../models/pricing.model';
import {MatDialogRef} from '@angular/material/dialog';

declare var System: any;
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
function checkDate(c: AbstractControl): { [key: string]: boolean } | null {
    const dateStartControl = c.get('startYear');
    const dateEndControl = c.get('endYear');
    if (dateStartControl?.value < dateEndControl?.value){
          return null;
        }
    if (dateStartControl?.pristine || dateEndControl?.pristine) {
          return null;
        }
    return { match: true };

    }
@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent implements OnInit {

  public registerForm: FormGroup;
  fileToUpload: File | null = null;
  el: any;
  show = true;
  isLoading = false;

  constructor(private http: HttpClient, private fb: FormBuilder, public dialogRef: MatDialogRef<ProviderComponent>) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1)]],
      lastName: ['', [Validators.required, Validators.minLength(1)]],
      emailGroup: this.fb.group({
         email: ['', [Validators.required, Validators.email]],
         confirmEmail: ['', [Validators.required]],
      }, { validators: emailMatcher}),
      login: ['', [Validators.required, Validators.minLength(1)]],
      passwordGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
     }, { validators: passwordMatcher}),
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      image: ['', [Validators.required, Validators.minLength(1)]],
      adresse: ['', [Validators.required, Validators.minLength(1)]],
      ville: ['', [Validators.required, Validators.minLength(1)]],
      departement: ['', [Validators.required, Validators.minLength(1)]],
      postal: ['', [Validators.required, Validators.minLength(1)]],
      birthdayGroup: this.fb.group({
        birthday:  ['', [Validators.required]],
        }, {validators: checkBirthday}),
      description: ['', [Validators.required, Validators.minLength(1)]],
      filename: ['', [Validators.required, Validators.minLength(1)]],
      filePath: ['', [Validators.required, Validators.minLength(1)]],
      title: ['', [Validators.required, Validators.minLength(1)]],
      DateGroup: this.fb.group({
        startYear: ['', [Validators.required, Validators.minLength(1)]],
        endYear: ['', [Validators.required, Validators.minLength(1)]],
      }, {validators: checkDate}),
      description2: ['', [Validators.required, Validators.minLength(1)]],
      startHour: ['', [Validators.required, Validators.minLength(1)]],
      endHour: ['', [Validators.required, Validators.minLength(1)]],
      price: ['', [Validators.required, Validators.minLength(1)]],
      sendCatalog: false
  });
    this.registerForm.errors
   }

  ngOnInit(): void {
  }

  public saveData(event: Event){
    console.log("here");
    this.isLoading = true;
    console.log(this.registerForm.get('DateGroup.startYear')?.value);
    // console.log("values : " + JSON.stringify(this.registerFormTwo?.get('birthdayGroup')?.get('birthday')));
    const date = new Date(this.registerForm?.get('birthdayGroup')?.get('birthday')?.value);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    const formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
    const newUser = new User(`${this.registerForm.get('firstName')?.value}`,
      `${this.registerForm.get('lastName')?.value}`, `${this.registerForm.get('emailGroup')?.get('email')?.value}`,
      `${this.registerForm.get('login')?.value}`,
      `${this.registerForm.get('image')?.value}`, formattedDate,
      `${this.registerForm.get('adresse')?.value}`, `${this.registerForm.get('postal')?.value}`,
      `${this.registerForm.get('ville')?.value}`, `${this.registerForm.get('departement')?.value}`,
      `${this.registerForm.get('phone')?.value}`);
    const newDiploma = new Diploma('', '',
      `${this.registerForm.get('filename')?.value}`, `${this.registerForm.get('filePath')?.value}`);
    const startYear = new Date(this.registerForm.get('DateGroup.startYear')?.value).getUTCFullYear();
    const endYear = new Date(this.registerForm.get('DateGroup.endYear')?.value).getUTCFullYear();
    const newExperience = new Experience('', '',
      startYear,
      endYear, `${this.registerForm.get('title')?.value}`, `${this.registerForm.get('description2')?.value}`);
    const newPricing = new Pricing('', ' ',
      formattedDate, this.registerForm.get('startHour')?.value, this.registerForm.get('endHour')?.value,
      this.registerForm.get('price')?.value, 0);
    const values = Object.assign({}, JSON.parse(JSON.stringify(newUser)), {diploma: [JSON.parse(JSON.stringify(newDiploma))]});
    const newValues = Object.assign({}, values, {experience: [JSON.parse(JSON.stringify(newExperience))]});
    const newNewValues = Object.assign({}, newValues, {pricing: [JSON.parse(JSON.stringify(newPricing))]});
    const finalValues = Object.assign({}, newNewValues, {description: `${this.registerForm.get('description')?.value}`});
    const finalFinalValues = Object.assign({}, finalValues, {password: `${this.registerForm.get('passwordGroup.password')?.value}`});
    const headers1 = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');
    this.http.post(' http://localhost:3000/auth/subscribe/provider', finalFinalValues,
      { headers : headers1})
      .subscribe(data => {
        console.log(data);
        if(!data)
        {
          alert("Il vous manque des données");
          this.isLoading = false;
          event.preventDefault();
        }
        console.log("success");
        console.log(data);
        this.dialogRef.close();
      });
  }


  handleFileInput(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.fileToUpload = fileList?.item(0) || null;
    console.log('tie : ' + this.fileToUpload?.name);
    if (this.fileToUpload)
    {
      const formData: FormData = new FormData();
      formData.append('fileKey', this.fileToUpload, this.fileToUpload.name);
      this.http.post('http://localhost:3000/user/file', formData)
        .subscribe((result: any) => {
          console.log('prout');
        });
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.fileToUpload = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload || new File([''], 'inconnu.jpg'));
  }



  postFile(){

  }
}
