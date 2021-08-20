import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {SubscribeComponent} from './composants/subscribe/subscribe.component';
import {LoginComponent} from './composants/login/login.component';
import {MatTabGroup} from '@angular/material/tabs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {User} from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  imageName: any;
  title = 'NightNurse';
  showProvInfo = false;
  showPlanning = false;
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

  async showLogin(): Promise<User | null> {
    const dialogRef = this.dialog.open(LoginComponent, {
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (sessionStorage.getItem('token') !== null) {
        const headers1 = new HttpHeaders()
          .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
          .set('Content-Type', 'application/json');
        this.isLogged = true;
        const session = await this.http.get<any>(`http://localhost:3000/user/session/${sessionStorage.getItem('token')}`,
          {headers: headers1})
              .toPromise();
        const user = await this.http.get<any>(`http://localhost:3000/user/${session.userId}`,
              {headers: headers1})
              .toPromise();
        console.log(JSON.stringify(user));
        sessionStorage.setItem('userRole', user.role);
        if (user.role === 'provider')
                {
                  this.isProvider = true;
                }
        const arrayBufferImage = await this.http.get(`http://localhost:3000/user/file/${user.image}`,
                  {headers: headers1, responseType: 'arraybuffer'}).toPromise();
        let binary = '';
        const bytes = new Uint8Array( arrayBufferImage );
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode( bytes[ i ] );
                }
        const image = 'data:image/jpeg;base64,' + btoa(binary);
        sessionStorage.setItem('image', image);

      }
      return null;
    });
    return null;
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
    const dialogRef = this.dialog.open(SubscribeComponent, {
      data: {
        providerSubscribe: true,
        userSubscribe: false
      },
      maxWidth: '100%',
      maxHeight: '80%',
      minHeight: '70%',
      minWidth: '50%',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  LogOff(): void {
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

  selectInformationTab(): void
  {
    // @ts-ignore
    this.tabGroup?.selectedIndex = 5;
  }

  hideInformationTab(): void
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

  showProfile(): void {
    this.showProf = true;
    this.showPlanning = false;
    this.showAppoint = false;
    this.showProviderAppoint = false;
    this.showProvInfo = false;
    this.selectInformationTab();
  }

  showProviderPlanning(): void {
    this.showPlanning = true;
    this.showProf = false;
    this.showAppoint = false;
    this.showProviderAppoint = false;
    this.showProvInfo = false;
    this.selectInformationTab();
  }

  showProviderInformations(): void {
    this.showProvInfo = true;
    this.showProf = false;
    this.showPlanning = false;
    this.showAppoint = false;
    this.showProviderAppoint = false;
    this.selectInformationTab();
  }

  showAppointment(): void {
    this.showAppoint = true;
    this.showProf = false;
    this.showPlanning = false;
    this.showProviderAppoint = false;
    this.showProvInfo = false;
    this.selectInformationTab();
  }
  showProviderAppointment(): void {
    this.showProviderAppoint = true;
    this.showProf = false;
    this.showPlanning = false;
    this.showAppoint = false;
    this.showProvInfo = false;
    this.selectInformationTab();
  }
}
