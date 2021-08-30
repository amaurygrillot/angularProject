import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {User} from '../../../models/user';
import {merge} from 'rxjs';
import TravelMode = google.maps.TravelMode;
import TrafficModel = google.maps.TrafficModel;
import DirectionsService = google.maps.DirectionsService;

@Component({
  selector: 'app-update-dialog',
  templateUrl: './updateDialog.component.html',
  styleUrls: ['./updateDialog.component.css']
})
export class UpdateDialogComponent implements OnInit {
  isPassword = false;
  hide = true;
  show = true;
  loading = false;
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
  isImage = false;
  isAddress = false;
  fileToUpload: File | null = null;
  directionObject = new DirectionsService();
  constructor(private http: HttpClient, private fb: FormBuilder, public dialogRef: MatDialogRef<UpdateDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {


  }

  ngOnInit(): void {
    if (this.data.dbFieldName === 'password')
    {
      this.isPassword = true;
      this.test();
    }
    else if (this.data.dbFieldName === 'birthdate')
    {
      this.isDate = true;
      this.test();
    }
    else if (this.data.dbFieldName === 'firstName')
    {
      this.isfirstName = true;
      this.test();
    }
    else if (this.data.dbFieldName === 'lastName')
    {
      this.islastName = true;
      this.test();
    }
    else if (this.data.dbFieldName === 'mail')
    {
      this.isMail = true;
      this.updateForm = new FormGroup(
        {
          oldValue: new FormControl({value : `${this.data.fieldValue}`, disabled : true}, [Validators.required, Validators.minLength(1)]),
          newValue: new FormControl('', [Validators.required, Validators.email]),
          date: new FormControl('', [Validators.required])
        },

      );
    }
    else if (this.data.dbFieldName === 'login')
    {
      this.isLogin = true;
      this.test();
    }
    else if (this.data.dbFieldName === 'image')
    {
      this.isImage = true;
      this.updateForm = new FormGroup(
        {
          oldValue: new FormControl({value : `${sessionStorage.getItem('image')}`, disabled : true}),
          newValue: new FormControl('', [Validators.required]),
          image: new FormControl('', [Validators.required])
        },

      );
    }
    else if (this.data.dbFieldName === 'address')
    {
      this.isAddress = true;
      this.updateForm = new FormGroup(
        {
          oldValue: new FormControl({value : `${this.data.fieldValue}`, disabled : true}),
          adresse: new FormControl('', [Validators.required])
        },

      );
    }
    else
    {
      this.test();
    }


  }

  test(): void
  {
    this.updateForm = new FormGroup(
      {
        oldValue: new FormControl({value : `${this.data.fieldValue}`, disabled : true}, [Validators.required, Validators.minLength(1)]),
        newValue: new FormControl('', [Validators.required]),
        date: new FormControl('', [Validators.required])
      },

    );
  }

  // tslint:disable-next-line:typedef
  submitChanges(){
    this.loading = true;
    console.log(this.data);
    const user = Object.assign({}, JSON.parse(this.data.user));
    if (!this.isAddress)
    {
      // tslint:disable-next-line:no-eval
      eval(`user.${this.data.dbFieldName} = '${this.updateForm.get('newValue')?.value}'`);
    }
    const date = new Date(user.birthdate);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    const formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
    user.birthdate = formattedDate;
    const values = Object.assign(user,
      {
        zipcode: user.zipcode,
        province: user.province,
        place_id: user.placeId,
        password: this.data.password,
        role: sessionStorage.getItem('role')
      });
    console.log("ojkljb" + JSON.stringify(values));
    this.updateUser(values);
  }
   updateUser(values: any): void
  {
    this.headers1.set('Content-Type', 'text');
    this.http.post(`http://localhost:3000/user/update/${sessionStorage.getItem('userId')}`,
      values, { headers : this.headers1}).
      subscribe((data: any) => {
        this.loading = false;
        this.dialogRef.close(data);
      },
      (error => {
        console.log(error);
        this.loading = false;
      }));
  }
  onNoClick(submitEvent: Event): void {
    submitEvent.preventDefault();
    this.dialogRef.close();
  }
  showPassword(submitEvent: Event): void {
    this.hide = !this.hide;
    submitEvent.preventDefault();
  }

  handleFileInput(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    this.fileToUpload = fileList?.item(0) || null;
    if (this.fileToUpload)
    {
      const formData: FormData = new FormData();
      formData.append('fileKey', this.fileToUpload, `${sessionStorage.getItem('userId')}.jpg`);
      this.http.post('http://localhost:3000/user/file', formData)
        .subscribe((result: any) => {
         // sessionStorage.setItem('image',  || '');
        });
    }
    const reader = new FileReader();
    reader.onload = (event: any) => {
      this.fileToUpload = event.target.result;
      sessionStorage.setItem('image', event.target.result);
    };
    reader.readAsDataURL(this.fileToUpload || new File([''], `${sessionStorage.getItem('userId')}.jpg`));

  }

  public async handleAddressChange(address: any): Promise<any> {
    console.log(this.data.user);
    const user = JSON.parse(this.data.user);
    user.address = address.name;
    user.city = address.address_components[2].long_name;
    user.province = address.address_components[4].long_name;
    user.postalCode = address.address_components[6].long_name;
    user.placeId = address.place_id;
    this.data.user = JSON.stringify(user);
  }



  }
