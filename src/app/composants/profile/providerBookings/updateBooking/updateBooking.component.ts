import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {Booking} from '../../../../models/booking';

@Component({
  selector: 'app-update-booking',
  templateUrl: './updateBooking.component.html',
  styleUrls: ['./updateBooking.component.css']
})
export class UpdateBookingComponent implements OnInit {
  isPassword = false;
  hide = true;
  show = true;
  loading = false;
  displayUser = false;
  updateForm!: FormGroup;
  today = Date.now();
  isDate = false;
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  updateFormDate: FormGroup | undefined;
  isfirstName = false;
  islastName = false;
  isMail = false;
  isLogin = false;
  constructor(private http: HttpClient, private fb: FormBuilder, public dialogRef: MatDialogRef<UpdateBookingComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {


  }

  ngOnInit(): void {
      this.updateForm = new FormGroup(
        {
          oldValue: new FormControl({value : `${this.data.fieldValue}`, disabled : true}, [Validators.required, Validators.minLength(1)]),
          newValue: new FormControl('', [Validators.required, Validators.minLength(1), Validators.email]),
          date: new FormControl('', [Validators.required, Validators.minLength(1)])
        });
  }
   updateUser(values: any)
  {
    this.headers1.set('Content-Type', 'text');
    this.http.post('http://localhost:3000/auth/user/update', values,
      { headers : this.headers1}).subscribe((data: any) => {
        this.loading = false;
        this.dialogRef.close(values);
      },
      (error => {
        console.log(error);
        this.loading = false;
      }));
  }
  onUpdate() {
    const user = this.http.get<any>(`http://localhost:3000/user/${this.data.booking.userId}`, { headers : this.headers1}).toPromise();
    let mail = '';
    user.then(value => {
      mail = value.mail;
    });
    const provider = this.http.get<any>(`http://localhost:3000/provider/providerId/${this.data.booking.providerId}`,
      { headers : this.headers1}).toPromise();
    let providerEmail = '';
    provider.then(value => {
      providerEmail = value.mail;
    });
    const body = {
      id : this.data.booking.id,
      userId : this.data.booking.userId,
      providerId : this.data.booking.providerId,
      date : this.data.date,
      pricingId : this.data.booking.pricingId,
      userMail : mail,
      providerMail : providerEmail
    };
    this.http.put<any>(`http://localhost:3000/booking/${this.data.booking.id}`,
      body, { headers : this.headers1}).toPromise();
  }
  onNoClick(submitEvent: Event): void {
    submitEvent.preventDefault();
    this.dialogRef.close();
  }
  }

