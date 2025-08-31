// src/app/features/settings/components/settings-panel/settings-panel.component.ts (Updated)
import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SettingsService } from '../services/settings.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { TimezoneService } from '../../../../core/services/timezone.service';
import { 
  AppSettings, 
  ThemeMode, 
  Language, 
  DateFormat, 
  TemperatureDisplayUnit,
  AVAILABLE_TIMEZONES,
  AVAILABLE_LANGUAGES
} from '../../../../core/models/settings.model';

// Import pipes
import { TranslatePipe} from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TranslatePipe,
  ],
  templateUrl: './settings-panel.html',
  styleUrls: ['./settings-panel.scss']
})
export class SettingsPanel implements OnInit {
  private settingsService = inject(SettingsService);
  private i18nService = inject(I18nService);
  private timezoneService = inject(TimezoneService);
  
  // Expose enums to template
  ThemeMode = ThemeMode;
  Language = Language;
  DateFormat = DateFormat;
  TemperatureDisplayUnit = TemperatureDisplayUnit;
  
  // Available options from services
  readonly timezones = AVAILABLE_TIMEZONES;
  
  // Current settings (reactive)
  readonly settings = this.settingsService.settings;
  readonly currentTimezone = this.timezoneService.timezoneInfo;
  
  // UI state signals
  readonly showExportModal = signal(false);
  readonly showImportModal = signal(false);
  readonly exportData = signal('');
  readonly importData = signal('');
  readonly importError = signal('');

  // Computed values for display
  readonly currentTimeInTimezone = computed(() => {
    return this.timezoneService.formatDateLocalized(
      new Date(),
      this.i18nService.currentLocale(),
      { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }
    );
  });

  readonly sampleTemperature = computed(() => {
    return this.settingsService.formatTemperature(25); // Sample 25°C
  });

  readonly sampleDate = computed(() => {
    return this.settingsService.formatDate(new Date());
  });

  setLocale(locale: string): void {
  this.i18nService.setLocale(locale);
}

  // Helper methods for template
  getAvailableLanguages() {
    return this.i18nService.getSupportedLocales();
  }

  getAvailableDateFormats() {
    return [DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY, DateFormat.YYYY_MM_DD];
  }

  getAvailableTemperatureUnits() {
    return [TemperatureDisplayUnit.CELSIUS, TemperatureDisplayUnit.FAHRENHEIT];
  }

  getCurrentTimeDisplay(): string {
    return this.currentTimeInTimezone();
  }

  getCurrentLanguageDisplayName(): string {
    const currentLanguage = this.settings().language;
    const languages = this.getAvailableLanguages();
    return languages.find(lang => lang.code === this.getCurrentLanguageCode())?.name || 'Português';
  }

  ngOnInit(): void {
    // Component is reactive through signals, no additional setup needed
  }

  onThemeChange(theme: ThemeMode): void {
    this.settingsService.updateTheme(theme);
  }

  onLanguageChange(languageCode: string): void {
    // Map locale code to Language enum
    const languageMap: Record<string, Language> = {
      'pt': Language.PT,
      'en': Language.EN,
    };
    
    const language = languageMap[languageCode];
    if (language) {
      this.settingsService.updateLanguage(language);
    }
  }

  onTimezoneChange(timezone: string): void {
    this.settingsService.updateTimezone(timezone);
  }

  onDateFormatChange(format: DateFormat): void {
    this.settingsService.updateDateFormat(format);
  }

  onTemperatureUnitChange(unit: TemperatureDisplayUnit): void {
    this.settingsService.updateTemperatureUnit(unit);
  }

  onNotificationChange(key: keyof AppSettings['notifications'], value: boolean): void {
    this.settingsService.updateNotifications({ [key]: value });
  }

  resetSettings(): void {
    const confirmMessage = this.i18nService.translate('settings.resetConfirm');
    if (confirm(confirmMessage)) {
      this.settingsService.resetSettings();
    }
  }

  exportSettings(): void {
    const exported = this.settingsService.exportSettings();
    this.exportData.set(exported);
    this.showExportModal.set(true);
  }

  copyExportData(): void {
    navigator.clipboard.writeText(this.exportData()).then(() => {
      console.log('Settings copied to clipboard');
      // You could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  importSettings(): void {
    this.showImportModal.set(true);
    this.importData.set('');
    this.importError.set('');
  }

  processImport(): void {
    const success = this.settingsService.importSettings(this.importData());
    if (success) {
      this.showImportModal.set(false);
      this.importData.set('');
      this.importError.set('');
    } else {
      this.importError.set(this.i18nService.translate('settings.importError'));
    }
  }

// Modificar o método existente onLanguageSelectChange para usar setLocale
  onLanguageSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const languageCode = target.value;
    
    this.setLocale(languageCode);
    
    const languageMap: Record<string, Language> = {
      'pt': Language.PT,
      'en': Language.EN,
    };
    
    const language = languageMap[languageCode];
    if (language) {
      this.settingsService.updateLanguage(language);
    }
  }

  onTimezoneSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onTimezoneChange(target.value);
  }

  onWeatherAlertsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onNotificationChange('weatherAlerts', target.checked);
  }

  onNetworkAlertsChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onNotificationChange('networkAlerts', target.checked);
  }

  onDataUpdatesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onNotificationChange('dataUpdates', target.checked);
  }

  onImportDataChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.importData.set(target.value);
  }

  closeModal(): void {
    this.showExportModal.set(false);
    this.showImportModal.set(false);
    this.importError.set('');
  }

  getThemeIcon(theme: ThemeMode): string {
    switch (theme) {
      case ThemeMode.LIGHT: return '☀️';
      case ThemeMode.DARK: return '🌙';
      case ThemeMode.AUTO: return '🌓';
      default: return '❓';
    }
  }

  getThemeLabel(theme: ThemeMode): string {
    const keyMap: Record<ThemeMode, string> = {
      [ThemeMode.LIGHT]: 'theme.light',
      [ThemeMode.DARK]: 'theme.dark',
      [ThemeMode.AUTO]: 'theme.auto'
    };
    
    return this.i18nService.translate(keyMap[theme] as any);
  }

  getTemperatureUnitDisplay(unit: TemperatureDisplayUnit): string {
    return unit === TemperatureDisplayUnit.CELSIUS ? 
      this.i18nService.translate('units.celsius') : 
      this.i18nService.translate('units.fahrenheit');
  }

  getDateFormatExample(format: DateFormat): string {
    const exampleDate = new Date(2024, 11, 25); // December 25, 2024
    
    switch (format) {
      case DateFormat.DD_MM_YYYY: 
        return this.timezoneService.formatDateLocalized(exampleDate, this.i18nService.currentLocale(), {
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).replace(/(\d{4})/, '2024'); // Ensure year format
      case DateFormat.MM_DD_YYYY: 
        return '12/25/2024';
      case DateFormat.YYYY_MM_DD: 
        return '2024-12-25';
      default: 
        return '';
    }
  }

  getCurrentLanguageCode(): string {
    const settings = this.settings();
    const languageMap: Record<Language, string> = {
      [Language.PT]: 'pt',
      [Language.EN]: 'en',

    };
    
    return languageMap[settings.language] || 'pt';
  }

  // Helper for getting current timezone offset display
  getTimezoneOffsetDisplay(): string {
    return this.timezoneService.timezoneInfo().offsetString;
  }
}