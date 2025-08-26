import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { API_ENDPOINTS } from './core/constants/api.constants';
import { WeatherFormComponent } from '../app/features/weather-form/components/weather-form/weather-form';
import { CityListComponent } from '../app/features/dashboard/components/city-list/city-list';
import { SettingsPanel } from '../app/features/settings/components/settings-panel/settings-panel';
import { ThemeService } from '../app/core/services/theme.service';
import { signal } from '@angular/core';
import { DashboardService, DashboardSummary } from './features/dashboard/services/dashboard.service';

type ActiveView = 'none' | 'weatherForm' | 'cityList' | 'settings';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherFormComponent, CityListComponent, SettingsPanel],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  
  title = 'altice-weather-dashboard';
  
  private apiService = inject(ApiService);
  private dashboardService = inject(DashboardService);

  totalCities = signal(0);
  totalRecords = signal(0);
  avgNetworkPower = signal<number | null>(null);
  
  // Estado único para controlar qual view está ativa
  activeView: ActiveView = 'none';

  


  showSettings = false;
  
  // Stats para o template
  apiStats = {
    requestCount: 0,
    cacheStats: { size: 0 }
  };
  themeService: any;

  ngOnInit() {
    this.updateStats();
    this.loadDashboardStats();

    
  }


  private loadDashboardStats(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data: DashboardSummary) => {
        this.totalCities.set(data.totalCities);
        this.totalRecords.set(data.totalRecords);
        this.avgNetworkPower.set(data.averageNetworkPower);
      },
      error: (err) => console.error('Error loading dashboard stats:', err)
    });
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

    
}
