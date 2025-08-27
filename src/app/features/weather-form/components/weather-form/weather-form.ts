// src/app/features/weather-form/components/weather-form/weather-form.component.ts
import { Component, OnInit, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { ApiService } from '../../../../core/services/api.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { SettingsService } from '../../../../features/settings/components/services/settings.service';
import { TimezoneService } from '../../../../core/services/timezone.service';

// Import pipes
import { TranslatePipe, TemperaturePipe, AltitudePipe } from '../../../../shared/pipes/translate.pipe';

import {  TemperatureUnit, AltitudeUnit, NetworkPower } from '../../../../core/models/weather.enums';
import {WeatherData} from '../../../../core/models/weather-data.model'
import { TemperatureDisplayUnit } from '../../../../core/models/settings.model';

@Component({
  selector: 'app-weather-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    TranslatePipe,
    TemperaturePipe,
    AltitudePipe
  ],
  templateUrl: './weather-form.html',
  styleUrls: ['./weather-form.scss']
})
export class WeatherFormComponent implements OnInit {
  @Output() dataAdded = new EventEmitter<void>();
  

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private i18nService = inject(I18nService);
  private settingsService = inject(SettingsService);
  private timezoneService = inject(TimezoneService);

  weatherForm!: FormGroup;
  
  // Reactive state
  readonly isSubmitting = signal(false);
  readonly showSuccessMessage = signal(false);
  
  // Computed values based on settings
  readonly currentSettings = this.settingsService.settings;
  readonly temperatureUnit = computed(() => this.currentSettings().temperatureUnit);

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    // Get temperature range based on current unit
    const tempRange = this.getTemperatureRange();
    const altitudeRange = this.getAltitudeRange();

  this.weatherForm = this.fb.group({
    city: ['', [Validators.required, Validators.minLength(2)]],
    temperature: ['', [Validators.required, Validators.min(tempRange.min), Validators.max(tempRange.max)]],
    isRaining: [false],
    networkPower: ['', [Validators.required]],
    altitude: ['', [Validators.required, Validators.min(altitudeRange.min), Validators.max(altitudeRange.max)]],
    altitudeUnit: ['meters', Validators.required],
    date: [new Date(), Validators.required] 

  });


    // Update validators when temperature unit changes
    this.settingsService.settings$.subscribe(() => {
      const newTempRange = this.getTemperatureRange();
      const newAltitudeRange = this.getAltitudeRange();
      
      const tempControl = this.weatherForm.get('temperature');
      const altitudeControl = this.weatherForm.get('altitude');
      
      if (tempControl) {
        tempControl.setValidators([
          Validators.required, 
          Validators.min(newTempRange.min), 
          Validators.max(newTempRange.max)
        ]);
        tempControl.updateValueAndValidity();
      }

      if (altitudeControl) {
        altitudeControl.setValidators([
          Validators.required,
          Validators.min(newAltitudeRange.min),
          Validators.max(newAltitudeRange.max)
        ]);
        altitudeControl.updateValueAndValidity();
      }
    });
  }

  onSubmit(): void {
  if (this.weatherForm.valid) {
    this.isSubmitting.set(true);
    const formData = this.weatherForm.value;
    
    const temperatureInCelsius = this.convertTemperatureToStorage(formData.temperature);
    const altitudeInMeters = this.convertAltitudeToStorage(formData.altitude);

    const weatherData: Partial<WeatherData> = {
      city: formData.city,
      temperature: temperatureInCelsius,
      temperatureUnit: TemperatureUnit.CELSIUS,
      isRaining: formData.isRaining,
      date: new Date(),
      networkPower: parseInt(formData.networkPower) as NetworkPower,
      altitude: altitudeInMeters,
      altitudeUnit: AltitudeUnit.METERS
    };

    this.apiService.post<WeatherData>('weather-data', weatherData).subscribe({
      next: (response) => {
        console.log('Weather data saved:', response);
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);
        
        // EMIT APENAS UMA VEZ
        this.dataAdded.emit();
        
        setTimeout(() => {
          this.showSuccessMessage.set(false);
          this.resetForm();
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving weather data:', error);
        this.isSubmitting.set(false);
      }
    });
  }
}

  resetForm(): void {
    this.weatherForm.reset({
      isRaining: false
    });
    this.showSuccessMessage.set(false);
  }

  // Helper methods for display
  getCurrentTemperatureUnit(): string {
    return this.temperatureUnit() === TemperatureDisplayUnit.CELSIUS ? 
      this.i18nService.translate('units.celsius') : 
      this.i18nService.translate('units.fahrenheit');
  }

  getCurrentTemperatureSymbol(): string {
    return this.temperatureUnit() === TemperatureDisplayUnit.CELSIUS ? '°C' : '°F';
  }

  getCurrentAltitudeUnit(): string {
    return this.i18nService.translate('units.meters');
  }

  getCurrentAltitudeSymbol(): string {
    return 'm';
  }

  getTemperaturePlaceholder(): string {
    const unit = this.temperatureUnit();
    return unit === TemperatureDisplayUnit.CELSIUS ? '22' : '72';
  }

  getAltitudePlaceholder(): string {
    return '100';
  }

  getCurrentLanguageName(): string {
    const languages = this.i18nService.getSupportedLocales();
    const currentLanguage = this.currentSettings().language;
    return languages.find(lang => lang.code === this.mapLanguageToCode(currentLanguage))?.name || 'Português';
  }

  getCurrentTimezoneName(): string {
    return this.timezoneService.timezoneInfo().displayName;
  }

  getCurrentTime(): string {
    return this.timezoneService.formatDateLocalized(
      new Date(),
      this.i18nService.currentLocale(),
      { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      }
    );
  }

  getTemperatureConversionExample(): Record<string, string> {
    const unit = this.temperatureUnit();
    if (unit === TemperatureDisplayUnit.CELSIUS) {
      return { example: '25°C = 77°F' };
    } else {
      return { example: '77°F = 25°C' };
    }
  }

  // Conversion methods
  private convertTemperatureToStorage(value: number): number {
    const displayUnit = this.temperatureUnit();
    if (displayUnit === TemperatureDisplayUnit.FAHRENHEIT) {
      // Convert Fahrenheit to Celsius for storage
      return (value - 32) * 5/9;
    }
    return value; // Already in Celsius
  }

  private convertAltitudeToStorage(value: number): number {
    // For now, we only support meters
    return value;
  }

  private getTemperatureRange(): { min: number, max: number } {
    const unit = this.temperatureUnit();
    if (unit === TemperatureDisplayUnit.CELSIUS) {
      return { min: -50, max: 60 };
    } else {
      return { min: -58, max: 140 }; // Fahrenheit equivalent
    }
  }

  private getAltitudeRange(): { min: number, max: number } {
    return { min: -1000, max: 10000 }; // Always in meters
  }

  private mapLanguageToCode(language: any): string {
    const languageMap: Record<string, string> = {
      'pt': 'pt',
      'en': 'en',
      'es': 'es',
      'fr': 'fr',
      'de': 'de'
    };
    
    return languageMap[language] || 'pt';
  }
}