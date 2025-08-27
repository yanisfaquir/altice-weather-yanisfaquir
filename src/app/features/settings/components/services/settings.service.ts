import { Injectable, inject, computed ,signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { StorageService } from '../../../../core/services/storage.service';
import { Theme, ThemeService } from '../../../../core/services/theme.service';
import { 
  AppSettings, 
  DEFAULT_SETTINGS, 
  ThemeMode, 
  Language,
  TemperatureDisplayUnit 
} from '../../../../core/models/settings.model';
import {I18nService} from '../../../../core/services/i18n.service'
import {TimezoneService} from '../../../../core/services/timezone.service'
import {DateFormat} from '../../../../core/models/settings.model'
const SETTINGS_STORAGE_KEY = 'altice_weather_settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storageService = inject(StorageService);
  private themeService = inject(ThemeService);
  private i18nService = inject(I18nService);
  private timezoneService = inject(TimezoneService);

  // Settings signal with reactive updates
  private settingsSignal = signal<AppSettings>(this.loadSettings());
  
  // Public readonly settings
  public readonly settings = this.settingsSignal.asReadonly();
  
  // Observable for components that prefer RxJS
  private settingsSubject = new BehaviorSubject<AppSettings>(this.settings());
  public readonly settings$ = this.settingsSubject.asObservable();

  // Computed values for common use cases
  public readonly isDarkMode = computed(() => {
    const theme = this.settings().theme;
    if (theme === ThemeMode.AUTO) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === ThemeMode.DARK;
  });

  public readonly currentLanguage = computed(() => this.settings().language);
  public readonly currentTimezone = computed(() => this.settings().timezone);
  public readonly temperatureUnit = computed(() => this.settings().temperatureUnit);
  public readonly dateFormat = computed(() => this.settings().dateFormat);

  constructor() {
    // Effect to sync settings changes with external services
    effect(() => {
      const currentSettings = this.settings();
      
      // Update theme service - map ThemeMode to Theme
      const themeMap: Record<ThemeMode, Theme> = {
        [ThemeMode.LIGHT]: 'light',
        [ThemeMode.DARK]: 'dark',
        [ThemeMode.AUTO]: 'auto'
      };
      this.themeService.setTheme(themeMap[currentSettings.theme]);
      
      // Update i18n service
      this.i18nService.setLocale(this.mapLanguageToLocale(currentSettings.language));
      
      // Update timezone service
      this.timezoneService.setTimezone(currentSettings.timezone);
      
      // Persist to storage
      this.saveSettings(currentSettings);
      
      // Update observable
      this.settingsSubject.next(currentSettings);
      
      console.log('Settings updated:', currentSettings);
    });

    // Listen for system theme changes when in auto mode
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.settings().theme === ThemeMode.AUTO) {
          this.themeService.setTheme(ThemeMode.AUTO);
        }
      });
    }
  }

  // Update entire settings object
  updateSettings(updates: Partial<AppSettings>): void {
    const currentSettings = this.settings();
    const newSettings = { ...currentSettings, ...updates };
    this.settingsSignal.set(newSettings);
  }

  // Individual setting updaters
  updateTheme(theme: ThemeMode): void {
    this.updateSettings({ theme });
  }

  updateLanguage(language: Language): void {
    this.updateSettings({ language });
  }

  updateTimezone(timezone: string): void {
    this.updateSettings({ timezone });
  }

  updateDateFormat(dateFormat: DateFormat): void {
    this.updateSettings({ dateFormat });
  }

  updateTemperatureUnit(temperatureUnit: TemperatureDisplayUnit): void {
    this.updateSettings({ temperatureUnit });
  }

  updateNotifications(notifications: Partial<AppSettings['notifications']>): void {
    const currentNotifications = this.settings().notifications;
    const newNotifications = { ...currentNotifications, ...notifications };
    this.updateSettings({ notifications: newNotifications });
  }

  // Reset to default settings
  resetSettings(): void {
    this.settingsSignal.set({ ...DEFAULT_SETTINGS });
  }

  // Export settings as JSON string
  exportSettings(): string {
    return JSON.stringify(this.settings(), null, 2);
  }

  // Import settings from JSON string
  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate the imported settings
      if (this.validateSettings(importedSettings)) {
        // Merge with defaults to ensure all properties exist
        const validatedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
        this.settingsSignal.set(validatedSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  // Get formatted date according to current settings
  formatDate(date: Date): string {
    const format = this.settings().dateFormat;
    const locale = this.mapLanguageToLocale(this.settings().language);
    const timezone = this.settings().timezone;

    return this.timezoneService.formatDateLocalized(date, locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }, timezone);
  }

  // Get formatted datetime according to current settings
  formatDateTime(date: Date): string {
    const locale = this.mapLanguageToLocale(this.settings().language);
    const timezone = this.settings().timezone;

    return this.timezoneService.formatDateLocalized(date, locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }, timezone);
  }

  // Get formatted temperature according to current settings
  formatTemperature(value: number, sourceUnit: 'celsius' | 'fahrenheit' = 'celsius'): string {
    const displayUnit = this.settings().temperatureUnit === TemperatureDisplayUnit.CELSIUS ? 'celsius' : 'fahrenheit';
    
    let convertedValue = value;
    
    // Convert if needed
    if (sourceUnit === 'celsius' && displayUnit === 'fahrenheit') {
      convertedValue = (value * 9/5) + 32;
    } else if (sourceUnit === 'fahrenheit' && displayUnit === 'celsius') {
      convertedValue = (value - 32) * 5/9;
    }
    
    const unitSymbol = displayUnit === 'celsius' ? '°C' : '°F';
    const roundedValue = Math.round(convertedValue * 10) / 10;
    
    return `${roundedValue}${unitSymbol}`;
  }

  // Get relative time according to current settings
  formatRelativeTime(date: Date): string {
    const locale = this.mapLanguageToLocale(this.settings().language);
    return this.timezoneService.formatRelativeTime(date, locale);
  }

  // Private helper methods
  private loadSettings(): AppSettings {
    const stored = this.storageService.getItem<AppSettings>(SETTINGS_STORAGE_KEY);
    if (stored && this.validateSettings(stored)) {
      // Merge with defaults to ensure new properties are included
      return { ...DEFAULT_SETTINGS, ...stored };
    }
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(settings: AppSettings): void {
    this.storageService.setItem(SETTINGS_STORAGE_KEY, settings);
  }

  private validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') return false;
    
    // Check required properties exist and have valid values
    const requiredProps = ['theme', 'language', 'timezone', 'dateFormat', 'temperatureUnit'];
    
    return requiredProps.every(prop => {
      const value = settings[prop];
      switch (prop) {
        case 'theme':
          return Object.values(ThemeMode).includes(value);
        case 'language':
          return Object.values(Language).includes(value);
        case 'timezone':
          return typeof value === 'string' && value.length > 0;
        case 'dateFormat':
          return Object.values(DateFormat).includes(value);
        case 'temperatureUnit':
          return Object.values(TemperatureDisplayUnit).includes(value);
        default:
          return value !== undefined;
      }
    });
  }

  private mapLanguageToLocale(language: Language): string {
    const languageMap: Record<Language, string> = {
      [Language.PT]: 'pt-PT',
      [Language.EN]: 'en-US',

    };
    
    return languageMap[language] || 'pt-PT';
  }
}