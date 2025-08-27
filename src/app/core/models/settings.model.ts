// src/app/core/models/settings.model.ts (Updated)
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum Language {
  PT = 'pt',
  EN = 'en',

}

export enum DateFormat {
  DD_MM_YYYY = 'DD/MM/YYYY',
  MM_DD_YYYY = 'MM/DD/YYYY',
  YYYY_MM_DD = 'YYYY-MM-DD'
}

export enum TemperatureDisplayUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit'
}

export interface NotificationSettings {
  weatherAlerts: boolean;
  networkAlerts: boolean;
  dataUpdates: boolean;
  systemUpdates: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  timezone: string;
  dateFormat: DateFormat;
  temperatureUnit: TemperatureDisplayUnit;
  notifications: NotificationSettings;
  autoSave: boolean;
  dataRetentionDays: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: ThemeMode.AUTO,
  language: Language.EN,
  timezone: 'Europe/Lisbon',
  dateFormat: DateFormat.DD_MM_YYYY,
  temperatureUnit: TemperatureDisplayUnit.CELSIUS,
  notifications: {
    weatherAlerts: true,
    networkAlerts: true,
    dataUpdates: false,
    systemUpdates: true
  },
  autoSave: true,
  dataRetentionDays: 365
};

// Available timezones with user-friendly labels
export const AVAILABLE_TIMEZONES = [
  { value: 'Europe/Lisbon', label: '🇵🇹 Lisboa (Europe/Lisbon)' },
  { value: 'Europe/London', label: '🇬🇧 Londres (Europe/London)' },
  { value: 'Europe/Paris', label: '🇫🇷 Paris (Europe/Paris)' },
  { value: 'Europe/Berlin', label: '🇩🇪 Berlim (Europe/Berlin)' },
  { value: 'Europe/Madrid', label: '🇪🇸 Madrid (Europe/Madrid)' },
  { value: 'Europe/Rome', label: '🇮🇹 Roma (Europe/Rome)' },
  { value: 'Europe/Amsterdam', label: '🇳🇱 Amesterdão (Europe/Amsterdam)' },
  { value: 'Europe/Brussels', label: '🇧🇪 Bruxelas (Europe/Brussels)' },
  { value: 'Europe/Vienna', label: '🇦🇹 Viena (Europe/Vienna)' },
  { value: 'Europe/Zurich', label: '🇨🇭 Zurique (Europe/Zurich)' },
  { value: 'America/New_York', label: '🇺🇸 Nova Iorque (America/New_York)' },
  { value: 'America/Los_Angeles', label: '🇺🇸 Los Angeles (America/Los_Angeles)' },
  { value: 'America/Chicago', label: '🇺🇸 Chicago (America/Chicago)' },
  { value: 'America/Denver', label: '🇺🇸 Denver (America/Denver)' },
  { value: 'America/Sao_Paulo', label: '🇧🇷 São Paulo (America/Sao_Paulo)' },
  { value: 'Asia/Tokyo', label: '🇯🇵 Tóquio (Asia/Tokyo)' },
  { value: 'Asia/Shanghai', label: '🇨🇳 Xangai (Asia/Shanghai)' },
  { value: 'Asia/Singapore', label: '🇸🇬 Singapura (Asia/Singapore)' },
  { value: 'Asia/Dubai', label: '🇦🇪 Dubai (Asia/Dubai)' },
  { value: 'Australia/Sydney', label: '🇦🇺 Sydney (Australia/Sydney)' },
  { value: 'Pacific/Auckland', label: '🇳🇿 Auckland (Pacific/Auckland)' },
  { value: 'UTC', label: '🌍 UTC (Coordinated Universal Time)' }
];

// Available languages with localized names
export const AVAILABLE_LANGUAGES = [
  { value: Language.PT, label: 'Português', flag: '🇵🇹', code: 'pt' },
  { value: Language.EN, label: 'English', flag: '🇺🇸', code: 'en' },

];

// Temperature conversion utilities
export class TemperatureConverter {
  static celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  static fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5/9;
  }

  static convert(
    value: number, 
    from: TemperatureDisplayUnit, 
    to: TemperatureDisplayUnit
  ): number {
    if (from === to) return value;
    
    if (from === TemperatureDisplayUnit.CELSIUS && to === TemperatureDisplayUnit.FAHRENHEIT) {
      return this.celsiusToFahrenheit(value);
    } else if (from === TemperatureDisplayUnit.FAHRENHEIT && to === TemperatureDisplayUnit.CELSIUS) {
      return this.fahrenheitToCelsius(value);
    }
    
    return value;
  }

  static getUnitSymbol(unit: TemperatureDisplayUnit): string {
    return unit === TemperatureDisplayUnit.CELSIUS ? '°C' : '°F';
  }
}

// Date format utilities
export class DateFormatHelper {
  static getDateFormatPattern(format: DateFormat): string {
    switch (format) {
      case DateFormat.DD_MM_YYYY:
        return 'dd/MM/yyyy';
      case DateFormat.MM_DD_YYYY:
        return 'MM/dd/yyyy';
      case DateFormat.YYYY_MM_DD:
        return 'yyyy-MM-dd';
      default:
        return 'dd/MM/yyyy';
    }
  }

  static getDateTimeFormatPattern(format: DateFormat): string {
    const datePattern = this.getDateFormatPattern(format);
    return `${datePattern} HH:mm:ss`;
  }

  static formatExample(format: DateFormat, date: Date = new Date(2024, 11, 25)): string {
    switch (format) {
      case DateFormat.DD_MM_YYYY:
        return '25/12/2024';
      case DateFormat.MM_DD_YYYY:
        return '12/25/2024';
      case DateFormat.YYYY_MM_DD:
        return '2024-12-25';
      default:
        return '25/12/2024';
    }
  }
}

// Settings validation utilities
export class SettingsValidator {
  static validateTheme(theme: any): theme is ThemeMode {
    return Object.values(ThemeMode).includes(theme);
  }

  static validateLanguage(language: any): language is Language {
    return Object.values(Language).includes(language);
  }

  static validateDateFormat(format: any): format is DateFormat {
    return Object.values(DateFormat).includes(format);
  }

  static validateTemperatureUnit(unit: any): unit is TemperatureDisplayUnit {
    return Object.values(TemperatureDisplayUnit).includes(unit);
  }

  static validateTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  static validateSettings(settings: Partial<AppSettings>): settings is AppSettings {
    return !!(
      settings.theme && this.validateTheme(settings.theme) &&
      settings.language && this.validateLanguage(settings.language) &&
      settings.timezone && this.validateTimezone(settings.timezone) &&
      settings.dateFormat && this.validateDateFormat(settings.dateFormat) &&
      settings.temperatureUnit && this.validateTemperatureUnit(settings.temperatureUnit) &&
      settings.notifications && typeof settings.notifications === 'object'
    );
  }
}