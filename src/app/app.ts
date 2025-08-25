import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { API_ENDPOINTS } from './core/constants/api.constants';
import { WeatherFormComponent } from '../app/features/weather-form/components/weather-form/weather-form';
import { CityList } from '../app/features/dashboard/components/city-list/city-list';

type ActiveView = 'none' | 'weatherForm' | 'cityList';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherFormComponent, CityList],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'altice-weather-dashboard';
  
  private apiService = inject(ApiService);
  
  // Estado único para controlar qual view está ativa
  activeView: ActiveView = 'none';
  
  // Stats para o template
  apiStats = {
    requestCount: 0,
    cacheStats: { size: 0 }
  };

  ngOnInit() {
    this.updateStats();
  }

  // Métodos para alternar views
  toggleWeatherForm(): void {
    this.activeView = this.activeView === 'weatherForm' ? 'none' : 'weatherForm';
  }

  toggleCityList(): void {
    this.activeView = this.activeView === 'cityList' ? 'none' : 'cityList';
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
