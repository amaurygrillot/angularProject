import { formatDate } from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../../models/user';
import {Diploma} from '../../models/diploma.model';
import {Experience} from '../../models/experience.model';
import {Pricing} from '../../models/pricing.model';
import {ProviderPricing} from '../../models/providerPricing.model';
import {MatDialogRef} from '@angular/material/dialog';

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
  selector: 'app-provider-informations',
  templateUrl: './providerInformations.component.html',
  styleUrls: ['./providerInformations.component.css']
})
export class ProviderInformationsComponent implements OnInit {

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
  isAdmin = false;
  image = sessionStorage.getItem('image');
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  isVerified = false;

  constructor(private http: HttpClient) {
   }

  ngOnInit(): void {
    this.getProviderInformations();
    if(sessionStorage.getItem('role') === 'admin')
    {
      this.isAdmin = true;
    }
  }

  async getProviderInformations()
  {
    const session = await this.http.get<any>(`http://localhost:3000/user/session/${sessionStorage.getItem('token')}`,
      { headers : this.headers1}).toPromise();
    const provider = await this.http.get<any>(`http://localhost:3000/provider/userId/${session.userId}`,
      { headers : this.headers1}).toPromise();
    this.provider.description = provider.description;
    this.isVerified = provider.verified;
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
      const newPricing = new Pricing(pricing.id, pricing.name, pricing.description);
      this.pricings.push(newPricing);
    }
  }
  validateDiploma(): void {
    this.headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    this.http.post(`http://localhost:3000/provider/verify/${this.provider.userId}`, {},
      {headers: this.headers1})
      .subscribe( (result: any) => {

      });
  }

  public findPricing(id: string): Pricing | undefined
  {
    return this.pricings.find(pricing => pricing.id === id);
  }

  updateDescription() {

  }
}
