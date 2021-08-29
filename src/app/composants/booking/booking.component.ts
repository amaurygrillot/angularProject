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
  chosenProviderPricing!: any;
  bookingId!: string;
  notSubmitted = true;
  showProvi = false;
  formattedStartDate!: string;
  formattedEndDate!: string;
  loading = false;
  directionObject = new DirectionsService();
  singleDay = false;
  mutlipleDays = false;
  public chosenHourlyPrice = 0;
  public chosenProvider: any;
  constructor(private fb: FormBuilder, private http: HttpClient, public dialog: MatDialog, private stripeService: StripeService) {

  }
  ngOnInit(): void {
    this.bookingForm = new FormGroup(
      {
        select: new FormControl('', [Validators.required]),
        picker: new FormControl('', [Validators.required]),
        endDatePicker: new FormControl('', [Validators.required]),
        startDatePicker: new FormControl('', [Validators.required]),
        startHour: new FormControl('', [Validators.required]),
        endHour: new FormControl('', [Validators.required]),
        text: new FormControl('', [Validators.required])
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


  async optionClicked(event: Event, providerId: string | undefined): Promise<any> {
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
    this.calculatePrice();
    if (this.stepper.selectedIndex === 0)
    {
      this.stepper.selected._completedOverride = true;
      submitEvent.preventDefault();
    }
    this.stepper.next();
  }
  public calculatePrice(): void
  {
    let startDate: Date;
    let endDate: Date;
    if (this.singleDay)
    {
      startDate = new Date(this.bookingForm.get('picker')?.value);
      startDate.setHours(parseInt(this.bookingForm.get('startHour')?.value.substring(0, 2), 10)
        , parseInt(this.bookingForm.get('startHour')?.value.substring(3, 5), 10), 0, 0 );
      endDate = new Date(this.bookingForm.get('picker')?.value);
      endDate.setHours(parseInt(this.bookingForm.get('endHour')?.value.substring(0, 2), 10)
        , parseInt(this.bookingForm.get('endHour')?.value.substring(3, 5), 10), 0, 0 );
    }
    else
    {
      console.log(this.bookingForm);
      startDate = new Date(this.bookingForm.get('startDatePicker')?.value);
      startDate.setHours(parseInt(this.bookingForm.get('startHour')?.value.substring(0, 2), 10)
        , parseInt(this.bookingForm.get('startHour')?.value.substring(3, 5), 10), 0, 0 );
      endDate = new Date(this.bookingForm.get('endDatePicker')?.value);
      endDate.setHours(parseInt(this.bookingForm.get('endHour')?.value.substring(0, 2), 10)
        , parseInt(this.bookingForm.get('endHour')?.value.substring(3, 5), 10), 0, 0 );
    }
    let timeDifference = (endDate.getTime() - startDate.getTime());
    console.log(timeDifference);
    timeDifference = timeDifference / 60000;
    console.log(timeDifference / 60);
    this.price = parseInt(Math.round((this.chosenHourlyPrice * 100) * (timeDifference / 60)).toFixed(2), 10) ;
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
      if (this.chosenPricing?.type === 'single_day')
      {
        this.mutlipleDays = false;
        this.singleDay = true;
        this.bookingForm.get('startDatePicker')?.clearValidators();
        this.bookingForm.get('endDatePicker')?.clearValidators();
        this.bookingForm.get('picker')?.setValidators( [Validators.required]);
      }
      else
      {
        this.singleDay = false;
        this.mutlipleDays = true;
        this.bookingForm.get('startDatePicker')?.setValidators( [Validators.required]);
        this.bookingForm.get('endDatePicker')?.setValidators( [Validators.required]);
        this.bookingForm.get('picker')?.clearValidators();
      }
      this.showProviders();
  }

  showProviders(): void {
    if ( (this.bookingForm.contains('rangePicker')
              && this.bookingForm.get('endDatePicker')?.invalid
              && this.bookingForm.get('startDatePicker')?.invalid)
        || (this.bookingForm.contains('datePicker') && this.bookingForm.get('datePicker')?.invalid)
        || this.bookingForm.get('select')?.invalid
        || (this.bookingForm.contains('startHour') && this.bookingForm.get('startHour')?.invalid)
        || (this.bookingForm.contains(('endHour')) && this.bookingForm.get('endHour')?.invalid))
    {
      return;
    }
    let startDate: Date;
    let endDate: Date;
    if (!this.bookingForm.get('picker')?.invalid)
    {
      startDate = new Date(this.bookingForm.get('picker')?.value);
      endDate = new Date(this.bookingForm.get('picker')?.value);
    }
    else
    {
      startDate = new Date(this.bookingForm.get('endDatePicker')?.value);
      endDate = new Date(this.bookingForm.get('startDatePicker')?.value);
    }
    const startMonth = startDate.getUTCMonth() + 1;
    const startDay = startDate.getUTCDate() + 1;
    const startHour = this.bookingForm.get('startHour')?.value;
    this.formattedStartDate = startDate.getUTCFullYear() + '-' + startMonth + '-' + startDay + ' ' + startHour;
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

  private async initPricings(): Promise<any> {
    const pricings = await this.http.get<any>(`http://localhost:3000/pricing/`).toPromise();
    for (const pricing of pricings){
        this.allPricings.push(new Pricing(pricing.id, pricing.name, pricing.description, pricing.type));
    }
  }

  saveHour(): void {
    console.log(this.bookingForm.get('startHour')?.value);
  }
}
