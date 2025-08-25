import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../../../core/models/weather-data.model';
import {TemperatureUnit, AltitudeUnit, NetworkPower, NetworkPowerLabels} from '../../../../core/models/weather.enums'
import { ApiService } from '../../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-weather-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './weather-form.html',
  styleUrls: ['./weather-form.scss']
})
export class WeatherFormComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  
  // Signals for reactive state
  isSubmitting = signal(false);
  message = signal<{type: 'success' | 'error', text: string} | null>(null);
  
  // Network power labels for template
  networkPowerLabels = NetworkPowerLabels;
  
  // Form group
  weatherForm: FormGroup;

  constructor() {
    this.weatherForm = this.createForm();
  }

  // Getter para usar no template (sem signal call)
  // get currentMessage() {
  //   return this.message();
  // }

  private createForm(): FormGroup {
    const today = new Date().toISOString().split('T')[0];
    
    return this.fb.group({
      city: ['', [Validators.required, Validators.minLength(2)]],
      temperature: ['', [Validators.required, Validators.min(-50), Validators.max(60)]],
      temperatureUnit: [TemperatureUnit.CELSIUS],
      date: [today, [Validators.required]],
      isRaining: [false, [Validators.required]],
      networkPower: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      altitude: ['', [Validators.required, Validators.min(-1000), Validators.max(10000)]],
      altitudeUnit: [AltitudeUnit.METERS]
    });
  }

  onSubmit(): void {
    if (this.weatherForm.invalid) {
      this.markFormGroupTouched(this.weatherForm);
      return;
    }

    this.isSubmitting.set(true);
    this.message.set(null);

    // Preparar dados para envio
    const formData = this.weatherForm.value;
    const weatherData: Omit<WeatherData, 'id'> = {
      city: formData.city.trim(),
      temperature: Number(formData.temperature),
      temperatureUnit: formData.temperatureUnit,
      date: new Date(formData.date),
      isRaining: Boolean(formData.isRaining),
      networkPower: Number(formData.networkPower) as NetworkPower,
      altitude: Number(formData.altitude),
      altitudeUnit: formData.altitudeUnit,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(' Sending weather data:', weatherData);

    // Enviar para API
    this.apiService.post<WeatherData>(API_ENDPOINTS.WEATHER_DATA, weatherData).subscribe({
      next: (response) => {
        console.log(' Weather data saved:', response);
        this.message.set({
          type: 'success',
          text: `Weather data for ${weatherData['city']} saved successfully!`
        });
        this.resetForm();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        console.error(' Error saving weather data:', error);
        this.message.set({
          type: 'error',
          text: ` Error saving data: ${error.userMessage || 'Please try again.'}`
        });
        this.isSubmitting.set(false);
      }
    });
  }

  resetForm(): void {
    this.weatherForm.reset();
    this.weatherForm.patchValue({
      temperatureUnit: TemperatureUnit.CELSIUS,
      altitudeUnit: AltitudeUnit.METERS,
      date: new Date().toISOString().split('T')[0],
      isRaining: false
    });
    this.message.set(null);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}