import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { FormControl, FormGroup, Validator} from '@angular/forms';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { MatProgressSpinner} from '@angular/material/progress-spinner';
import {User} from '../../../../models/user';
import {merge} from 'rxjs';
import TravelMode = google.maps.TravelMode;
import TrafficModel = google.maps.TrafficModel;
import DirectionsService = google.maps.DirectionsService;
import {Pricing} from '../../../../models/pricing.model';
import {Booking} from '../../../../models/booking';

@Component({
  selector: 'app-update-pricings',
  templateUrl: './updatePricings.component.html',
  styleUrls: ['./updatePricings.component.css']
})
export class UpdatePricingsComponent implements OnInit {
  loading = false;
  updateForm!: FormGroup;
  headers1 = new HttpHeaders()
    .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
    .set('Content-Type', 'application/json');
  allPricings = [] as Pricing[];
  allProviderPricings: Map<string, any> = new Map<string, any>();
  pricingChecks: Map<string, any> = new Map<string, any>();
  provider: any;

  constructor(private http: HttpClient, private fb: FormBuilder) {


  }

  ngOnInit(): void {
    this.getAllPricings();
  }
  public submitChanges(): void
  {

  }

  async getAllProviderPricings(): Promise<any>
  {
    this.provider = await this.http.get<any>(`http://localhost:3000/provider/userId/${sessionStorage.getItem('userId')}`
      , { headers : this.headers1}).toPromise();

    this.provider.pricing.forEach((value: any) => {
      this.pricingChecks.set(value.pricingId, true);
      this.allProviderPricings.set(value.pricingId, value);
    });
  }

  async getAllPricings(): Promise<any> {
    const pricings = await this.http.get<any>(`http://localhost:3000/pricing/`
      , { headers : this.headers1}).toPromise();
    for (const pricing of pricings) {
      const pricingObj = new Pricing(pricing.id, pricing.name, pricing.description, pricing.type);
      this.allPricings.push(pricingObj);
      this.pricingChecks.set(pricingObj.id || '', false);
    }
    this.getAllProviderPricings();
  }


  setChecked(pricing: Pricing): void {
    this.pricingChecks.set(pricing.id || '', !this.pricingChecks.get(pricing.id || ''));
  }

  async updatePricing(event: Event, pricing: Pricing): Promise<any> {
      for (const value of this.provider.pricing) {
        if (value.pricingId === pricing.id)
        {
          await this.http.put(`http://localhost:3000/pricing/provider/${this.provider.id}`,
            this.allProviderPricings?.get(pricing.id || ''),
            {headers : this.headers1}).toPromise();
          return;
        }
      }
      const values = Object.assign(this.allProviderPricings?.get(pricing.id || ''),
        {
          pricingId: pricing.id,
          providerId: this.provider.id
        });
      await this.http.post(`http://localhost:3000/pricing/provider`,
      values,
      {headers : this.headers1}).toPromise();
  }

  registerChange(event: Event, pricing: Pricing, fieldName: string): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.allProviderPricings?.get(pricing.id || '') !== undefined
      && this.allProviderPricings?.get(pricing.id || '')[fieldName] !== undefined) {
      // @ts-ignore
      this.allProviderPricings?.get(pricing.id || '')[fieldName] = value;
    }
    else {
      let newValues = {};
      // tslint:disable-next-line:no-eval
      eval(`newValues = { ${fieldName} : value}`);
      let oldValues = {};
      if(this.allProviderPricings?.get(pricing.id || '') !== undefined)
      {
        oldValues = this.allProviderPricings?.get(pricing.id || '');
      }
      this.allProviderPricings?.set(pricing.id || '',
        Object.assign(oldValues, newValues));
    }
    console.log(this.allProviderPricings?.get(pricing.id || ''));
  }
}
