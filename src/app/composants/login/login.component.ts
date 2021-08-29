import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hide = false;
  show = true;
  loading = false;
  displayUser = false;
  loginForm!: FormGroup;
  constructor(private http: HttpClient, private fb: FormBuilder, public dialogRef: MatDialogRef<LoginComponent>,
              ) {

  }

  ngOnInit(): void {
    this.loginForm = new FormGroup(
      {
        login: new FormControl('',[Validators.required,Validators.minLength(1)]),
        password: new FormControl('',[Validators.required,Validators.minLength(8)])
      }
    );
  }

  // tslint:disable-next-line:typedef
  onLogin(){
    this.loading = true;
    const headers1 = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');
    const user = {login: `${this.loginForm.get('login')?.value}`,
      password: `${this.loginForm.get('password')?.value}`};
    this.http.post('http://localhost:3000/auth/login', user,
      { headers : headers1}).subscribe(async (data: any) => {
        if(data === null)
        {
          sessionStorage.clear();
          this.loading = false;
          return;
        }
        console.log('data : ' + JSON.stringify(data));
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userId', data.userId);
        const role = await this.http.get<any>(`http://localhost:3000/user/${data.userId}`,
          {headers: headers1}).toPromise();
        if(role === null)
        {
          sessionStorage.clear();
          this.loading = false;
          return;
        }
        console.log(role);
        sessionStorage.setItem('role', role.role);
        this.dialogRef.close();
        this.loading = false;
    },
      (error => {
        console.log("identifiants incorrects");
        this.loading = false;
      }));
  }



  // tslint:disable-next-line:typedef
  showInscription() {
    this.displayUser = true;
    this.show = false;
  }
  onNoClick(submitEvent: Event): void {
    submitEvent.preventDefault();
    this.dialogRef.close();
  }

  showPassword(submitEvent: Event) {
    this.hide = !this.hide;
    submitEvent.preventDefault();
  }
}

