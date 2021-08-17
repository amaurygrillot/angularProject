import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormControl} from '@angular/forms';
import { NodeCompatibleEventEmitter } from 'rxjs/internal/observable/fromEvent';
import {DonneesService} from '../../service/donnees.service';
import { User } from '../../models/user';
import { Directive, ElementRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {EMPTY, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatStepper} from '@angular/material/stepper';
import {StripeService, StripeCardComponent} from 'ngx-stripe';
import {StripeCardElementOptions, StripeElementsOptions} from '@stripe/stripe-js';
import {Pricing} from '../../models/pricing.model';
import {empty} from 'rxjs/internal/Observer';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  @ViewChild('card') card !: StripeCardComponent;
  @ViewChild('datePicker') datePicker!: ElementRef;
  @ViewChild('stepper') stepper!: MatStepper;
  users: User[] = [];
  today = new Date();
  userControl = new FormControl();
  filteredProviders!: Observable<User[]>;
  lastFilter = '';
  bookingForm!: FormGroup;
  showLog = true;
  isInvalid = false;
  cardCaptureReady = false;
  cardReady = false;
  showPricings = false;
  formFilled =  false;
  price = 0;
  elements = this.stripeService.elements();
  chosenProviderId!: string | undefined;
  elementsOptions: StripeElementsOptions = {
    locale: 'fr'
  };
  stripeTest!: FormGroup;
  allPricings = [] as Pricing[];
  chosenPricing!: Pricing | undefined;
  bookingId!: string;
  notSubmitted = true;
  showProvi = false;
  formattedDate!: string;
  loading = false;
  constructor(private fb: FormBuilder, private http: HttpClient, public dialog: MatDialog, private stripeService: StripeService) {

  }
  ngOnInit(): void {
    this.bookingForm = new FormGroup(
      {
        picker: new FormControl('', [Validators.required]),
        select: new FormControl('', [Validators.required]),
        text: new FormControl('', [Validators.required]),
      }
    );
    this.stripeTest = this.fb.group({
      stripeCard: ['', [Validators.required]]
    });
  }
  filter(filter: string): User[] {
    this.lastFilter = filter;
    if (filter) {
      return this.users.filter(option => {
        return option.firstName.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          || option.lastName.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
      });
    } else {
      return this.users.slice();
    }
  }


  async optionClicked(event: Event, providerId: string | undefined) {
    this.chosenProviderId = providerId;
    console.log('id : ' + providerId);
    const headers1 = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');
    const provider = await this.http.get<any>(`http://localhost:3000/provider/providerId/${providerId}`,
      { headers : headers1}).toPromise();
    if (provider === null)
    {
      event.preventDefault();
      return;
    }
    this.allPricings = [] as Pricing[];
    for (const pricing of provider.pricing) {
      const newPricing = new Pricing(pricing.id, pricing.providerId,
        pricing.date, pricing.startHour, pricing.endHour, pricing.price, pricing.hourlyPrice);
      this.allPricings.push(newPricing);
    }
    this.showPricings = true;
    event.preventDefault();
  }
  // tslint:disable-next-line:typedef

  public saveData(submitEvent: Event){
    if (sessionStorage.getItem('token') === null)
    {
      console.log('event ' + JSON.stringify(submitEvent));
      submitEvent.preventDefault();
      this.isInvalid = true;
      alert('Connectez vous pour pouvoir prendre un rendez-vous');
    }
    this.price = this.chosenPricing?.price || 0;
  }
  async getAllProviders(): Promise<User[] | null>
  {
    this.filteredProviders = EMPTY;
    this.users = [] as User[];
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    const data = await this.http.get<any>(' http://localhost:3000/provider/', { headers : headers1}).toPromise();
    for (const provider of data) {
      console.log(JSON.stringify(provider));
      console.log(`http://localhost:3000/booking/provider/${provider.providerId}/${this.formattedDate}`);
      const bookings = await this.http.get<any>(`http://localhost:3000/booking/provider/${provider.id}/${this.formattedDate}`,
        { headers : headers1}).toPromise();
      if (bookings.length > 0)
      {
        console.log("here");
        continue;
      }
      const user = await this.http.get<any>(`http://localhost:3000/user/${provider.userId}`, { headers : headers1}).toPromise();
      // @ts-ignore
      const result = await this.http.get<string>(`http://localhost:3000/user/file/${user.image}`, {headers: headers1, responseType: 'arraybuffer'}).toPromise();
      let binary = '';
      const bytes = new Uint8Array( result );
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
      }
      const image = 'data:image/jpeg;base64,' + btoa(binary);
      this.users.push(new User(user.firstName, user.lastName, user.mail, user.login, image,
        user.birthdate, user.address, user.zipcode, user.city, user.province,user.phoneNumber, provider.id));
    }
    console.log(this.users.length);
    return null;
  }


   async makePayment(event: Event): Promise<null> {
    this.loading = true;
    const body = {amount : `${this.chosenPricing?.price}`};
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    const name = this.stripeTest.get('name')?.value;
    const data = await this.http.post<any>(' http://localhost:3000/booking/create-payment-intent', body, { headers : headers1}).toPromise();
    const result = await this.stripeService.confirmCardPayment(data.clientSecret,
        {payment_method : {card : this.card.element} }).toPromise();
    if (result.error)
    {
      console.log(result.error);
      event.preventDefault();
      this.loading = false;
      return null;
    }
    else {
      const bookingBody = {
        userId: sessionStorage.getItem('userId'),
        providerId: this.chosenPricing?.providerId,
        date: this.formattedDate,
        pricingId: this.chosenPricing?.id
      };
      const booking = await this.http.post<any>(' http://localhost:3000/booking/', bookingBody, { headers : headers1}).toPromise();
      if (booking === null)
      {
        this.loading = false;
        return null;
      }
      this.stepper.selected._completedOverride = true;
      this.bookingId = booking.id;
      this.notSubmitted = false;
      this.formFilled = true;
      this.stepper.next();
      this.loading = false;
      return null;
    }


  }

  selectPricing(event: Event, pricing: Pricing | undefined) {
      this.chosenPricing = pricing;
  }

  showProviders() {
    const date = new Date(this.datePicker.nativeElement.value);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate() + 1;
    this.formattedDate = date.getUTCFullYear() + '-' + month + '-' + day;
    this.showProvi = true;
    this.getAllProviders().then(async () => {
      this.filteredProviders = this.userControl.valueChanges.pipe(
        startWith<string | User[]>(this.users),
        map(value => typeof value === 'string' ? value : this.lastFilter),
        map(filter => this.filter(filter))
      );
    });

  }
}
