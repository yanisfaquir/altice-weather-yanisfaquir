import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WeatherFormComponent } from './weather-form';

describe('WeatherFormComponent', () => {
  let component: WeatherFormComponent;
  let fixture: ComponentFixture<WeatherFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherFormComponent, ReactiveFormsModule, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form', () => {
    expect(component.weatherForm).toBeTruthy();
  });

  it('should have required form fields', () => {
    expect(component.weatherForm.get('city')).toBeTruthy();
    expect(component.weatherForm.get('temperature')).toBeTruthy();
    expect(component.weatherForm.get('networkPower')).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.weatherForm.valid).toBeFalse();
  });

  it('should reset form', () => {
    component.weatherForm.patchValue({ city: 'Porto' });
    component.resetForm();
    
    
    const cityValue = component.weatherForm.get('city')?.value;
    expect(cityValue === null || cityValue === '').toBeTruthy();
  });
});