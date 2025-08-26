import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SettingsService } from '../services/settings.service';
import { 
  AppSettings, 
  ThemeMode, 
  Language, 
  DateFormat, 
  TemperatureDisplayUnit,
  AVAILABLE_TIMEZONES,
  AVAILABLE_LANGUAGES
} from '../../../../core/models/settings.model';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-panel.html',
  styleUrls: ['./settings-panel.scss']
})
export class SettingsPanel implements OnInit {
  private settingsService = inject(SettingsService);
  
  // Expose enums to template
  ThemeMode = ThemeMode;
  Language = Language;
  DateFormat = DateFormat;
  TemperatureDisplayUnit = TemperatureDisplayUnit;
  
  // Available options
  timezones = AVAILABLE_TIMEZONES;
  languages = AVAILABLE_LANGUAGES;
  
  // Theme options array for template
  themeOptions = [ThemeMode.LIGHT, ThemeMode.DARK, ThemeMode.AUTO];
  dateFormats = [DateFormat.DD_MM_YYYY, DateFormat.MM_DD_YYYY, DateFormat.YYYY_MM_DD];
  temperatureUnits = [TemperatureDisplayUnit.CELSIUS, TemperatureDisplayUnit.FAHRENHEIT];
  
  // Current settings
  settings: AppSettings;
  
  // UI state
  showExportModal = false;
  showImportModal = false;
  exportData = '';
  importData = '';
  importError = '';

  constructor() {
    this.settings = this.settingsService.settings();
  }

  ngOnInit(): void {
    // Subscribe to settings changes
    this.settingsService.settings$.subscribe(settings => {
      this.settings = settings;
    });
  }

  onThemeChange(theme: ThemeMode): void {
    this.settingsService.updateTheme(theme);
  }

  onLanguageChange(language: Language): void {
    this.settingsService.updateLanguage(language);
  }

  onTimezoneChange(timezone: string): void {
    this.settingsService.updateTimezone(timezone);
  }

  onDateFormatChange(format: DateFormat): void {
    this.settingsService.updateSettings({ dateFormat: format });
  }

  onTemperatureUnitChange(unit: TemperatureDisplayUnit): void {
    this.settingsService.updateTemperatureUnit(unit);
  }

  onNotificationChange(key: keyof AppSettings['notifications'], value: boolean): void {
    this.settingsService.updateNotifications({ [key]: value });
  }

  resetSettings(): void {
    if (confirm('Tem a certeza que quer repor as configurações padrão?')) {
      this.settingsService.resetSettings();
    }
  }

  exportSettings(): void {
    this.exportData = this.settingsService.exportSettings();
    this.showExportModal = true;
  }

  copyExportData(): void {
    navigator.clipboard.writeText(this.exportData).then(() => {
      console.log('Settings copied to clipboard');
    });
  }

  importSettings(): void {
    this.showImportModal = true;
    this.importData = '';
    this.importError = '';
  }

  processImport(): void {
    if (this.settingsService.importSettings(this.importData)) {
      this.showImportModal = false;
      this.importData = '';
      this.importError = '';
    } else {
      this.importError = 'Formato de configurações inválido';
    }
  }

  closeModal(): void {
    this.showExportModal = false;
    this.showImportModal = false;
    this.importError = '';
  }

  getThemeIcon(theme: ThemeMode): string {
    switch (theme) {
      case ThemeMode.LIGHT: return '☀️';
      case ThemeMode.DARK: return '🌙';
      case ThemeMode.AUTO: return '🌓';
      default: return '❓';
    }
  }

  getTemperatureUnitDisplay(unit: TemperatureDisplayUnit): string {
    return unit === TemperatureDisplayUnit.CELSIUS ? 'Celsius (°C)' : 'Fahrenheit (°F)';
  }

  getDateFormatExample(format: DateFormat): string {
    const exampleDate = new Date(2024, 11, 25); // December 25, 2024
    
    switch (format) {
      case DateFormat.DD_MM_YYYY: return '25/12/2024';
      case DateFormat.MM_DD_YYYY: return '12/25/2024';
      case DateFormat.YYYY_MM_DD: return '2024-12-25';
      default: return '';
    }
  }
}