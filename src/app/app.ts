
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { API_ENDPOINTS } from './core/constants/api.constants';
import { WeatherFormComponent } from '../app/features/weather-form/components/weather-form/weather-form';
import { CityListComponent } from '../app/features/dashboard/components/city-list/city-list';
import { SettingsPanel } from '../app/features/settings/components/settings-panel/settings-panel';
import { ThemeService } from '../app/core/services/theme.service';
import { DashboardService, DashboardSummary } from './features/dashboard/services/dashboard.service';
import { MainLayoutComponent } from '../app/core/layout/main-layout/main-layout';
import { DashboardWelcomeCardComponent } from '../app/features/dashboard/components/dashboard-welcome-card/dashboard-welcome-card';
import { I18nService } from './core/services/i18n.service';
import { SettingsService } from './features/settings/components/services/settings.service';
import { TimezoneService } from './core/services/timezone.service';


type ActiveView = 'none' | 'weatherForm' | 'cityList' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    WeatherFormComponent, 
    CityListComponent, 
    SettingsPanel, 
    MainLayoutComponent, 
    DashboardWelcomeCardComponent,

  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  
  title = 'altice-weather-dashboard';
  
  private apiService = inject(ApiService);
  private dashboardService = inject(DashboardService);
  private i18nService = inject(I18nService);
  private settingsService = inject(SettingsService);
  private timezoneService = inject(TimezoneService);
  
  // Reactive signals
  readonly totalCities = signal(0);
  readonly totalRecords = signal(0);
  readonly avgNetworkPower = signal<number | null>(null);
  
  // Computed values for display
  readonly currentSettings = this.settingsService.settings;
  readonly currentTime = signal(new Date());

  setLocale(locale: string) {
  this.i18nService.setLocale(locale);
}

  
  // Estado único para controlar qual view está ativa
  activeView: ActiveView = 'none';

  showSettings = false;
  
  // Stats para o template
  apiStats = {
    requestCount: 0,
    cacheStats: { size: 0 }
  };
  
  themeService = inject(ThemeService);
  
  // Update time every second
  private timeInterval?: number;

  ngOnInit() {
    this.updateStats();
    this.loadDashboardStats();
    this.initializeLocalization();
    this.startTimeUpdates();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private loadDashboardStats(): void {
    console.log('Loading dashboard stats...');
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardSummary) => {
        console.log('New stats loaded:', data);
        this.totalCities.set(data.totalCities);
        this.totalRecords.set(data.totalRecords);
        this.avgNetworkPower.set(data.averageNetworkPower);
      },
      error: (err) => console.error('Error loading dashboard stats:', err)
    });
  }

  private initializeLocalization(): void {
    const settings = this.currentSettings();
    console.log('Initializing localization with settings:', settings);
  }

  private startTimeUpdates(): void {
    this.timeInterval = window.setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  toggleSettings(): void {
    this.activeView = this.activeView === 'settings' ? 'none' : 'settings';
  }

  get isSettingsActive(): boolean {
    return this.activeView === 'settings';
  }

  getSettingsButtonClass(): string {
    const baseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105";
    
    if (this.isSettingsActive) {
      return `${baseClass} bg-gray-600 text-white shadow-lg border-2 border-gray-400`;
    }
    return `${baseClass} bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white`;
  }

  // Métodos para alternar views
  toggleWeatherForm(): void {
    this.activeView = this.activeView === 'weatherForm' ? 'none' : 'weatherForm';
  }

  toggleCityList(): void {
    this.activeView = this.activeView === 'cityList' ? 'none' : 'cityList';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getCurrentThemeIcon(): string {
    const currentTheme = this.themeService.currentTheme();
    switch(currentTheme) {
      case 'light': return '🌙'; // Mostra lua para mudar para dark
      case 'dark': return '🌓';  // Mostra auto
      case 'auto': return '☀️';  // Mostra sol para light
      default: return '🌙';
    }
  }

  // Getters para os estados
  get isWeatherFormActive(): boolean {
    return this.activeView === 'weatherForm';
  }

  get isCityListActive(): boolean {
    return this.activeView === 'cityList';
  }

  // Métodos para classes CSS dos botões
  getWeatherFormButtonClass(): string {
    const baseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105";
    
    if (this.isWeatherFormActive) {
      return `${baseClass} bg-blue-600 text-white shadow-lg border-2 border-blue-400`;
    }
    return `${baseClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`;
  }

  getCityListButtonClass(): string {
    const baseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105";
    
    if (this.isCityListActive) {
      return `${baseClass} bg-purple-600 text-white shadow-lg border-2 border-purple-400`;
    }
    return `${baseClass} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white`;
  }

  testAPI() {
    console.log('🧪 Testing API...');
    
    this.apiService.get(API_ENDPOINTS.WEATHER_DATA).subscribe({
      next: (data) => {
        console.log(' API Response:', data);
        this.updateStats();
      },
      error: (error) => {
        console.log('Expected error (no data yet):', error.status);
        this.updateStats();
      }
    });
  }

  private updateStats() {
    this.apiStats = this.apiService.getApiStats();
  }

  // Display helpers for i18n
  getCurrentTime(): string {
    return this.timezoneService.formatDateLocalized(
      this.currentTime(),
      this.i18nService.currentLocale(),
      { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }
    );
  }

  getCurrentTemperatureDisplay(): string {
    // Show a sample temperature in current settings format
    return this.settingsService.formatTemperature(22); // Sample 22°C
  }

  getCurrentLanguageName(): string {
    const currentLanguage = this.currentSettings().language;
    const languages = this.i18nService.getSupportedLocales();
    return languages.find(lang => lang.code === this.mapLanguageToCode(currentLanguage))?.name || 'Português';
  }

  getCurrentTimezoneName(): string {
    return this.timezoneService.timezoneInfo().displayName;
  }

  getCurrentTemperatureUnit(): string {
    const unit = this.currentSettings().temperatureUnit;
    return this.i18nService.translate(
      unit === 'celsius' ? 'units.celsius' : 'units.fahrenheit'
    );
  }

  getLastUpdateTime(): string {
    return this.settingsService.formatDateTime(new Date());
  }

  getAverageNetworkPower(): string {
    const avgPower = this.avgNetworkPower();
    return avgPower ? `${avgPower.toFixed(1)}/5` : '0/5';
  }

  // Event handlers
  onDataAdded(): void {
    this.loadDashboardStats();
    console.log('Data added - refreshing stats...');
    
    setTimeout(() => {
      this.loadDashboardStats();
    }, 100);

    this.activeView = 'cityList';
  }

  // Helper methods
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

  // Translation helper for template
  t(key: string): string {
    return this.i18nService.translate(key as any);
  }
}