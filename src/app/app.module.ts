import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserComponent } from './composants/user/user.component';
import {DonneesService} from './service/donnees.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LoginComponent } from './composants/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card'
import { MatButtonModule} from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import {MatTabsModule} from '@angular/material/tabs';
import {BookingComponent} from './composants/booking/booking.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {HttpClientModule } from '@angular/common/http';
import { ProviderComponent } from './composants/provider/provider.component';
import { MatStepperModule } from '@angular/material/stepper';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxStripeModule} from 'ngx-stripe';
import {ProfileComponent} from './composants/profile/profile.component';
import {MatListModule} from '@angular/material/list';
import {UpdateDialogComponent} from './composants/profile/updateDialog/updateDialog.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ProviderProfileComponent} from './composants/profile/providerProfile/providerProfile.component';
import {UserBookingsComponent} from './composants/profile/userBookings/userBookings.component';
import {ProviderBookingsComponent} from './composants/profile/providerBookings/providerBookings.component';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import {UpdateBookingComponent} from './composants/profile/providerBookings/updateBooking/updateBooking.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'MM/DD/YYYY',
  },
  display: {
    dateInput: 'MM/DD/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};
@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
    LoginComponent,
    BookingComponent,
    ProviderComponent,
    ProfileComponent,
    UpdateDialogComponent,
    ProviderProfileComponent,
    UserBookingsComponent,
    ProviderBookingsComponent,
    UpdateBookingComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule,
    MatStepperModule,
    MatDialogModule,
    MatMenuModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    NgxStripeModule.forRoot('pk_test_51JFzBbFJFVSlloUZqIm8UC3Fw6BWSqTxkLQoVnXBUMEgmodoF8vwnsNQQxImWlX3IhxvBLOysHa8cg2FjOzdFlP600GWJABdpD'),
    MatListModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
