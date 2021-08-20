import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderInformationsComponent } from './provider.component';

describe('ProviderComponent', () => {
  let component: ProviderInformationsComponent;
  let fixture: ComponentFixture<ProviderInformationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderInformationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderInformationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
