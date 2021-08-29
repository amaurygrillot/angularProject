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
  pricingChecks: Map<string, any> = new Map<string, boolean>();

  constructor(private http: HttpClient, private fb: FormBuilder) {
      this.getAllPricings();

  }

  ngOnInit(): void {

  }
  public submitChanges(): void
  {

  }

  async getAllPricings(): Promise<any> {
    const pricings = await this.http.get<any>(`http://localhost:3000/pricing/`
      , { headers : this.headers1}).toPromise();
    for (const pricing of pricings) {
      const pricingObj = new Pricing(pricing.id, pricing.name, pricing.description, pricing.type);
      this.allPricings.push(pricingObj);
      this.pricingChecks.set(pricingObj.id || '', false);
    }
  }


  setChecked(pricing: Pricing): void {
    this.pricingChecks.set(pricing.id || '', !this.pricingChecks.get(pricing.id || ''));
    console.log(this.pricingChecks);
  }

  updatePricing(pricing: Pricing) {

  }
}
