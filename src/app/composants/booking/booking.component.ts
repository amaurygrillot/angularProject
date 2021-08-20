import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormControl} from '@angular/forms';
import { User } from '../../models/user';
import { ElementRef } from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatStepper} from '@angular/material/stepper';
import {StripeService, StripeCardComponent} from 'ngx-stripe';
import {StripeCardElementOptions, StripeElementsOptions} from '@stripe/stripe-js';
import {Pricing} from '../../models/pricing.model';
import {ProviderPricing} from '../../models/providerPricing.model';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  @ViewChild('card') card !: StripeCardComponent;
  @ViewChild('datePicker') datePicker!: ElementRef;
  @ViewChild('select') select!: MatSelect;
  @ViewChild('stepper') stepper!: MatStepper;
  users: User[] = [];
  today = new Date();
  userControl = new FormControl();
  filteredProviders!: Observable<User[]>;
  providerPricings: Map<string, any> = new Map<string, any>();
  lastFilter = '';
  bookingForm!: FormGroup;
  isInvalid = false;
  cardCaptureReady = false;
  cardReady = false;
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
  public chosenHourlyPrice = 0;
  public chosenProvider: any;
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
    this.initPricings();
    this.stripeTest = this.fb.group({
      stripeCard: ['', [Validators.required]]
    });
  }
  filter(filter: string): User[] {
    console.log("here");
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
    console.log('providerId : ' + providerId);
    this.chosenProviderId = providerId;
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
    this.chosenProvider = provider;
    this.chosenHourlyPrice = this.providerPricings.get(providerId || '')?.hourlyPrice;
    event.preventDefault();
  }
  // tslint:disable-next-line:typedef

  public saveData(submitEvent: Event): void{
    if (sessionStorage.getItem('token') === null)
    {
      console.log('event ' + JSON.stringify(submitEvent));
      submitEvent.preventDefault();
      this.isInvalid = true;
      alert('Connectez vous pour pouvoir prendre un rendez-vous');
    }
    this.price = this.chosenHourlyPrice ; // * time
  }
  async getAllProviders(): Promise<User[] | null>
  {
    this.providerPricings.clear();
    this.filteredProviders = EMPTY;
    this.users = [] as User[];
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    const data = await this.http.get<any>(`http://localhost:3000/provider/pricingId/${this.select.value}`,
      { headers : headers1}).toPromise();
    for (const provider of data) {
      const bookings = await this.http.get<any>(`http://localhost:3000/booking/provider/${provider.id}/${encodeURIComponent(this.formattedDate)}`,
        { headers : headers1}).toPromise();
      if (bookings.length > 0)
      {
        continue;
      }
      const user = await this.http.get<any>(`http://localhost:3000/user/${provider.userId}`, { headers : headers1}).toPromise();
      const result = await this.http.get(`http://localhost:3000/user/file/${user.image}`,
        {headers: headers1, responseType: 'arraybuffer'}).toPromise();
      let binary = '';
      const bytes = new Uint8Array( result );
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
      }
      const image = 'data:image/jpeg;base64,' + btoa(binary);
      this.users.push(new User(user.firstName, user.lastName, user.mail, user.login, image,
        user.birthdate, user.address, user.zipcode, user.city, user.province, user.phoneNumber, provider.id));
      this.providerPricings.set(provider.id, provider.pricing);
    }
    return null;
  }


   async makePayment(event: Event): Promise<null> {
    this.loading = true;
    const body = {amount : `${this.price}`};
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
        providerId: this.chosenProvider.id,
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

  selectPricing(event: Event, pricing: Pricing | undefined): void {
      this.chosenPricing = pricing;
  }

  showProviders(): void {
    if (!this.datePicker.nativeElement.value || !this.select.value)
    {
      return;
    }
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

  private async initPricings() {
    const pricings = await this.http.get<any>(`http://localhost:3000/pricing/`).toPromise();
    for (const pricing of pricings){
        this.allPricings.push(new Pricing(pricing.id, pricing.name, pricing.description));
    }
  }
}
