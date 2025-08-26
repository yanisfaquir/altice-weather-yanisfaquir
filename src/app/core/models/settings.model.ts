export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  timezone: string;
  dateFormat: DateFormat;
  temperatureUnit: TemperatureDisplayUnit;
  notifications: NotificationSettings;
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum Language {
  ENGLISH = 'en',
  PORTUGUESE = 'pt',
  SPANISH = 'es'
}

export enum DateFormat {
  DD_MM_YYYY = 'dd/MM/yyyy',
  MM_DD_YYYY = 'MM/dd/yyyy',
  YYYY_MM_DD = 'yyyy-MM-dd'
}

export enum TemperatureDisplayUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit'
}

export interface NotificationSettings {
  enabled: boolean;
  poorNetworkAlerts: boolean;
  dailySummary: boolean;
  extremeWeatherAlerts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: ThemeMode.AUTO,
  language: Language.PORTUGUESE,
  timezone: 'Europe/Lisbon',
  dateFormat: DateFormat.DD_MM_YYYY,
  temperatureUnit: TemperatureDisplayUnit.CELSIUS,
  notifications: {
    enabled: true,
    poorNetworkAlerts: true,
    dailySummary: false,
    extremeWeatherAlerts: true
  }
};

export const AVAILABLE_TIMEZONES = [
  { value: 'Europe/Lisbon', label: 'Lisboa (UTC+0)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'America/New_York', label: 'Nova York (UTC-5)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+11)' }
];

export const AVAILABLE_LANGUAGES = [
  { value: Language.PORTUGUESE, label: 'Português', flag: '🇵🇹' },
  { value: Language.ENGLISH, label: 'English', flag: '🇬🇧' },
  { value: Language.SPANISH, label: 'Español', flag: '🇪🇸' }
];