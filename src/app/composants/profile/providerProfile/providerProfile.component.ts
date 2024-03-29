import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {UpdateDialogComponent} from '../updateDialog/updateDialog.component';
import {DatePipe} from '@angular/common';
import {Pricing} from '../../../models/pricing.model';
import {Experience} from '../../../models/experience.model';
import {Diploma} from '../../../models/diploma.model';
import {ProviderPricing} from '../../../models/providerPricing.model';

@Component({
  selector: 'app-profile-provider',
  templateUrl: './providerProfile.component.html',
  styleUrls: ['./providerProfile.component.css'],
  providers: [DatePipe]
})
export class ProviderProfileComponent implements OnInit {
  user = {
    firstName : '',
    lastName: '',
    mail: '',
    image: '',
  };
  provider = {
    userId: '',
    description: '',
    diploma: [] as Diploma[],
    experience: [] as Experience[],
    pricing: [] as ProviderPricing[],
  };
  pricings = [] as Pricing[];
  toolTipMessage = 'Mettre le champ à jour';
  profileType!: string;
  experienceHeight!: string;
  pricingHeight!: string;
  diplomaHeight!: string;
  isAdmin = false;
  isLoading = false;
  image = sessionStorage.getItem('image');
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  isVerified = false;
  constructor(private http: HttpClient, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public injectedData: any) {

  }

  ngOnInit(): void {
    this.getUser();
    if (sessionStorage.getItem('role') === 'admin')
    {
      this.isAdmin = true;
    }
  }

  async getUser()
  {
    const provider = await this.http.get<any>(`http://localhost:3000/provider/providerId/${this.injectedData.providerId}`,
      { headers : this.headers1}).toPromise();
    this.provider.description = provider.description;
    if(provider.verified === 'true')
    {
      this.isVerified = true;
    }
    else
    {
      this.isVerified = false;
    }
    console.log(provider);
    for (const diploma of provider.diploma) {
      this.http.get(`http://localhost:3000/diploma/file/${diploma.filename}`, {headers: this.headers1, responseType: 'arraybuffer'})
        .subscribe( (result: any) => {
          let binary = '';
          const bytes = new Uint8Array( result );
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
          }
          const diplomaImage = 'data:image/jpeg;base64,' + btoa(binary);
          const newDiploma = new Diploma(diploma.id, diploma.providerId, diploma.filename, diplomaImage);
          this.provider.diploma.push(newDiploma);
        });

    }
    for (const experience of provider.experience) {
      const newExperience = new Experience(experience.id, experience.providerId,
        experience.startYear, experience.endYear, experience.title, experience.description);
      this.provider.experience.push(newExperience);
    }
    for (const providerPricing of provider.pricing) {
      const newProviderPricing = new ProviderPricing(providerPricing.id, providerPricing.pricingId, providerPricing.providerId,
        providerPricing.hourlyPrice, providerPricing.minimum_time, providerPricing.maximum_time);
      this.provider.pricing.push(newProviderPricing);
    }
    const pricings = await this.http.get<any>(`http://localhost:3000/pricing/`,
      { headers : this.headers1}).toPromise();
    for (const pricing of pricings) {
      const newPricing = new Pricing(pricing.id, pricing.name, pricing.description, pricing.type);
      this.pricings.push(newPricing);
    }
    this.provider.userId = provider.userId;
    const user = await this.http.get<any>(`http://localhost:3000/user/${provider.userId}`, { headers : this.headers1}).toPromise();
    this.user.firstName = user.firstName;
    this.user.lastName = user.lastName;
    this.user.mail = user.mail;
    this.http.get(`http://localhost:3000/user/file/${user.image}`, {headers: this.headers1, responseType: 'arraybuffer'})
      .subscribe( (result: any) => {
        let binary = '';
        const bytes = new Uint8Array( result );
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
        }
        this.image = 'data:image/jpeg;base64,' + btoa(binary);
      });
    this.experienceHeight = 'min-height: ' + this.provider.experience.length * 40 + 'px';
    this.pricingHeight = 'min-height: ' + this.provider.pricing.length * 40 + 'px';
    this.diplomaHeight = 'min-height: ' + this.provider.diploma.length * 40 + 'px';
  }
  validateDiploma(): void {
    this.isLoading = true;
    this.headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    console.log(this.injectedData);
    this.http.post(`http://localhost:3000/provider/verify/${this.injectedData.providerId}`, {},
      {headers: this.headers1})
      .subscribe( (result: any) => {
        this.isLoading = false;
        this.isVerified = true;
      });
  }

  public findPricing(id: string): Pricing | undefined
  {
    return this.pricings.find(pricing => pricing.id === id);
  }
}
