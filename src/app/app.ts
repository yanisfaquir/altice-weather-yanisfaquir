import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { API_ENDPOINTS } from './core/constants/api.constants';
import { WeatherFormComponent } from '../app/features/weather-form/components/weather-form/weather-form';
import { CityListComponent } from '../app/features/dashboard/components/city-list/city-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, WeatherFormComponent, CityListComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'altice-weather-dashboard';
  
  private apiService = inject(ApiService);
  
  // States
  showWeatherForm = false;
  showCityList = false;
  
  // Stats para o template
  apiStats = {
    requestCount: 0,
    cacheStats: { size: 0 }
  };

  ngOnInit() {
    this.updateStats();
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