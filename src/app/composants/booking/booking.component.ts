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
import {NgxMaterialTimepicker24HoursFaceComponent} from 'ngx-material-timepicker';
import DirectionsService = google.maps.DirectionsService;
import TravelMode = google.maps.TravelMode;
import TrafficModel = google.maps.TrafficModel;

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  @ViewChild('card') card !: StripeCardComponent;
  @ViewChild('startDatePicker') startDatePicker!: ElementRef;
  @ViewChild('endDatePicker') endDatePicker!: ElementRef;
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
  chosenProviderPricing!: any;
  bookingId!: string;
  notSubmitted = true;
  showProvi = false;
  formattedStartDate!: string;
  formattedEndDate!: string;
  loading = false;
  directionObject = new DirectionsService();
  public chosenHourlyPrice = 0;
  public chosenProvider: any;
  constructor(private fb: FormBuilder, private http: HttpClient, public dialog: MatDialog, private stripeService: StripeService) {

  }
  ngOnInit(): void {
    this.bookingForm = new FormGroup(
      {
        rangePicker: new FormControl('', [Validators.required]),
        select: new FormControl('', [Validators.required]),
        text: new FormControl('', [Validators.required]),
        startHour: new FormControl('', [Validators.required]),
        endHour: new FormControl('', [Validators.required])
      }
    );
    this.initPricings();
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
    console.log('providerId : ' + providerId);
    console.log('value : ' + this.bookingForm.get('text')?.value);
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
    this.chosenHourlyPrice = this.providerPricings.get(providerId || '')[0]?.hourlyPrice;
    this.chosenProviderPricing = this.providerPricings.get(providerId || '')[0];
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
    this.price = this.chosenHourlyPrice * 100 ; // * time
    this.stepper.selected._completedOverride = true;
    this.stepper.next();
  }
  async getAllProviders(): Promise<User[] | null>
  {
    this.providerPricings.clear();
    this.filteredProviders = EMPTY;
    this.users = [] as User[];
    const headers1 = new HttpHeaders()
      .set('Authorization', `Bearer ${sessionStorage.getItem('token')}`)
      .set('Content-Type', 'application/json');
    const bookingUser = await this.http.get<any>(`http://localhost:3000/user/${sessionStorage.getItem('userId')}`,
      { headers : headers1}).toPromise();
    const data = await this.http.get<any>(`http://localhost:3000/provider/pricingId/${this.select.value}`,
      { headers : headers1}).toPromise();
    for (const provider of data) {
      const bookings1 = await this.http.get<any>(`http://localhost:3000/booking/provider/${provider.id}/${encodeURIComponent(this.formattedStartDate)}`,
        { headers : headers1}).toPromise();
      const bookings2 = await this.http.get<any>(`http://localhost:3000/booking/provider/${provider.id}/${encodeURIComponent(this.formattedEndDate)}`,
        { headers : headers1}).toPromise();
      const directionRequest = {
        origin: {placeId: provider.place_id},
        destination: {placeId: bookingUser.place_id},
        travelMode: TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(/* now, or future date */),
          trafficModel: TrafficModel.PESSIMISTIC
        },
        unitSystem: google.maps.UnitSystem.METRIC
      };
      const route = await this.directionObject.route(directionRequest);
      console.log(route.routes[0].legs[0].distance);
      if (bookings1.length > 0
        || bookings2.length > 0
        || route.routes[0].legs[0].distance === undefined
        || route.routes[0].legs[0].distance?.value > provider.maximum_range * 1000)
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
        user.birthdate, user.address, user.zipcode, user.city, user.province, user.phoneNumber, user.place_id, provider.id));
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
        startDate: this.formattedStartDate,
        endDate : this.formattedEndDate,
        pricingId: this.chosenProviderPricing?.id,
        price: this.price
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
    if (!this.startDatePicker.nativeElement.value ||
        !this.endDatePicker.nativeElement.value ||
        !this.select.value ||
        !this.bookingForm.get('startHour')?.value ||
        !this.bookingForm.get('endHour')?.value)
    {
      return;
    }
    const startDate = new Date(this.startDatePicker.nativeElement.value);
    const startMonth = startDate.getUTCMonth() + 1;
    const startDay = startDate.getUTCDate() + 1;
    const startHour = this.bookingForm.get('startHour')?.value;
    this.formattedStartDate = startDate.getUTCFullYear() + '-' + startMonth + '-' + startDay + ' ' + startHour;
    const endDate = new Date(this.startDatePicker.nativeElement.value);
    const endMonth = startDate.getUTCMonth() + 1;
    const endDay = startDate.getUTCDate() + 1;
    const endHour = this.bookingForm.get('endHour')?.value;
    this.formattedEndDate = endDate.getUTCFullYear() + '-' + endMonth + '-' + endDay + ' ' + endHour;
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

  saveHour() {
    console.log(this.bookingForm.get('startHour')?.value);
  }
}
