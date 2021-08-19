import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SubscribeComponent} from './composants/subscribe/subscribe.component';
import {LoginComponent} from './composants/login/login.component';
import {MatTabGroup} from '@angular/material/tabs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ProviderComponent} from './composants/provider/provider.component';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageName: any;
  title = 'NightNurse';
  showLog = false;
  showSub = false;
  isLogged = sessionStorage.getItem('token') !== null;
  showProf = false;
  showAppoint = false;
  image: any;
  pageReloaded: any;
  @ViewChild('tabGroup') tabGroup: MatTabGroup | undefined;
  @ViewChild('informations') informations: ElementRef | undefined;
  isProvider = sessionStorage.getItem('userRole') === 'provider' || false;
  isAdmin = sessionStorage.getItem('userRole') === 'admin' || false;
  private userRole: string | null;
  showProviderAppoint = false;
  constructor(private http: HttpClient, public dialog: MatDialog, private sanitizer: DomSanitizer) {
    this.image = sessionStorage.getItem('image');
    this.userRole = sessionStorage.getItem('userRole');
  }

  showLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (sessionStorage.getItem('token') !== null) {
        const headers1 = new HttpHeaders()
          .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
          .set('Content-Type', 'application/json');
        this.isLogged = true;
        this.http.get(`http://localhost:3000/user/session/${sessionStorage.getItem('token')}`,  {headers: headers1})
          .subscribe((session: any) => {
            console.log(session);
            this.http.get(`http://localhost:3000/user/${session.userId}`, {headers: headers1})
              .subscribe((user: any) => {
                sessionStorage.setItem('userRole', user.role);
                if (user.role === 'provider')
                {
                  this.isProvider = true;
                }
                this.http.get(`http://localhost:3000/user/file/${user.image}`, {headers: headers1, responseType: 'arraybuffer'})
                  .subscribe( (result: any) => {
                    let binary = '';
                    const bytes = new Uint8Array( result );
                    const len = bytes.byteLength;
                    for (let i = 0; i < len; i++) {
                      binary += String.fromCharCode( bytes[ i ] );
                    }
                    this.image = 'data:image/jpeg;base64,' + btoa(binary);
                    sessionStorage.setItem('image', this.image);
                  });
              });
          });

      }
    });
  }
  // tslint:disable-next-line:typedef


  showSubscribeUser(): void {
    const dialogRef = this.dialog.open(SubscribeComponent, {
      data: {
        providerSubscribe: false,
        userSubscribe: true
      },
      maxWidth: '100%',
      maxHeight: '100%',
      minHeight: '95%',
      minWidth: '50%',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  showSubscribeProvider(): void {
    const dialogRef = this.dialog.open(ProviderComponent, {
      data: {
        providerSubscribe: true,
        userSubscribe: false
      },
      maxWidth : '800px',
      maxHeight : '900px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  LogOff() {
    this.isLogged = false;
    const token = sessionStorage.getItem('token');
    if (token !== null) {
      const headers1 = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`);
      this.http.delete('http://localhost:3000/auth/logout', { headers : headers1}).subscribe((data: any) => {
        sessionStorage.clear();
        console.log('data :' + JSON.stringify(data));
        this.hideInformationTab();
      });
    }
    else {
      return;
    }
  }

  selectInformationTab()
  {
    // @ts-ignore
    this.tabGroup?.selectedIndex = 5;
  }

  hideInformationTab()
  {
    this.showProf = false;
    this.showAppoint = false;
    this.showProviderAppoint = false;
    this.isLogged = false;
    this.isAdmin = false;
    this.isProvider = false;
    if (this.tabGroup?.selectedIndex === 5)
    {
      // @ts-ignore
      this.tabGroup?.selectedIndex = 0;
    }
  }

  showProfile() {
    this.showProf = true;
    this.showAppoint = false;
    this.showProviderAppoint = false;
    this.selectInformationTab();
  }

  showAppointment() {
    this.showProf = false;
    this.showAppoint = true;
    this.showProviderAppoint = false;
    this.selectInformationTab();
  }
  showProviderAppointment() {
    this.showProf = false;
    this.showAppoint = false;
    this.showProviderAppoint = true;
    this.selectInformationTab();
  }
}
