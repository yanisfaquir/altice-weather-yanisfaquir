import { Injectable, inject, signal, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { StorageService } from '../../../../core/services/storage.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { 
  AppSettings, 
  DEFAULT_SETTINGS, 
  ThemeMode, 
  Language,
  TemperatureDisplayUnit 
} from '../../../../core/models/settings.model';

const SETTINGS_STORAGE_KEY = 'altice-weather-settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storage = inject(StorageService);
  private themeService = inject(ThemeService);

  // Settings signal
  private _settings = signal<AppSettings>(DEFAULT_SETTINGS);
  
  // Observable for compatibility
  private settingsSubject = new BehaviorSubject<AppSettings>(DEFAULT_SETTINGS);
  public settings$ = this.settingsSubject.asObservable();

  // Read-only settings signal
  public readonly settings = this._settings.asReadonly();

  constructor() {
    this.loadSettings();
    this.setupSettingsEffect();
  }

  private loadSettings(): void {
    const savedSettings = this.storage.getItem<AppSettings>(SETTINGS_STORAGE_KEY);
    
    if (savedSettings) {
      // Merge with defaults to ensure all properties exist
      const mergedSettings: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...savedSettings,
        notifications: {
          ...DEFAULT_SETTINGS.notifications,
          ...(savedSettings.notifications || {})
        }
      };
      
      this._settings.set(mergedSettings);
      this.settingsSubject.next(mergedSettings);
    }
  }

  private setupSettingsEffect(): void {
    effect(() => {
      const settings = this._settings();
      
      // Apply theme changes
      this.applyThemeSettings(settings.theme);
      
      // Save to storage
      this.storage.setItem(SETTINGS_STORAGE_KEY, settings);
      this.settingsSubject.next(settings);
      
      console.log('Settings updated:', settings);
    });
  }

  updateSettings(partialSettings: Partial<AppSettings>): void {
    const currentSettings = this._settings();
    const newSettings: AppSettings = {
      ...currentSettings,
      ...partialSettings,
      notifications: {
        ...currentSettings.notifications,
        ...(partialSettings.notifications || {})
      }
    };
    
    this._settings.set(newSettings);
  }

  updateTheme(theme: ThemeMode): void {
    this.updateSettings({ theme });
  }

  updateLanguage(language: Language): void {
    this.updateSettings({ language });
    // Trigger language change in the app
    this.applyLanguageSettings(language);
  }

  updateTimezone(timezone: string): void {
    this.updateSettings({ timezone });
  }

  updateTemperatureUnit(unit: TemperatureDisplayUnit): void {
    this.updateSettings({ temperatureUnit: unit });
  }

  updateNotifications(notifications: Partial<AppSettings['notifications']>): void {
    const currentSettings = this._settings();
    this.updateSettings({
      notifications: {
        ...currentSettings.notifications,
        ...notifications
      }
    });
  }

  resetSettings(): void {
    this._settings.set(DEFAULT_SETTINGS);
  }

  exportSettings(): string {
    return JSON.stringify(this._settings(), null, 2);
  }

  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson) as AppSettings;
      
      // Validate settings structure
      if (this.validateSettings(importedSettings)) {
        this._settings.set(importedSettings);
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private validateSettings(settings: any): settings is AppSettings {
    return (
      settings &&
      typeof settings.theme === 'string' &&
      typeof settings.language === 'string' &&
      typeof settings.timezone === 'string' &&
      typeof settings.dateFormat === 'string' &&
      typeof settings.temperatureUnit === 'string' &&
      settings.notifications &&
      typeof settings.notifications.enabled === 'boolean'
    );
  }

  private applyThemeSettings(theme: ThemeMode): void {
    switch (theme) {
      case ThemeMode.LIGHT:
        this.themeService.setTheme('light' as any);
        break;
      case ThemeMode.DARK:
        this.themeService.setTheme('dark' as any);
        break;
      case ThemeMode.AUTO:
        this.themeService.setAutoTheme();
        break;
    }
  }

  private applyLanguageSettings(language: Language): void {
    // Set document language
    document.documentElement.lang = language;
    
    // Store language preference for future i18n implementation
    this.storage.setItem('app_language', language);
  }

  // Helper methods for templates
  formatDateWithSettings(date: Date): string {
    const settings = this._settings();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Intl.DateTimeFormat(settings.language, options).format(date);
  }

  convertTemperature(celsius: number): { value: number; unit: string } {
    const settings = this._settings();
    
    if (settings.temperatureUnit === TemperatureDisplayUnit.FAHRENHEIT) {
      return {
        value: Math.round((celsius * 9/5) + 32),
        unit: 'F'
      };
    }
    
    return {
      value: Math.round(celsius),
      unit: 'C'
    };
  }
}