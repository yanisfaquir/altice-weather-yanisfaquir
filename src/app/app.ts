import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import { API_ENDPOINTS } from './core/constants/api.constants';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  title = 'altice-weather-dashboard';
  
  private apiService = inject(ApiService);
  
  // Stats para o template
  apiStats = {
    requestCount: 0,
    cacheStats: { size: 0 }
  };

  ngOnInit() {
    this.updateStats();
  }

  testAPI() {
    console.log(' Testing API...');
    
    //  tentar obter dados 
    this.apiService.get(API_ENDPOINTS.WEATHER_DATA).subscribe({
      next: (data) => {
        console.log(' API Response:', data);
        this.updateStats();
      },
      error: (error) => {
        console.log(' Expected error (no data yet):', error.status);
        this.updateStats();
      }
    });
  }

  private updateStats() {
    this.apiStats = this.apiService.getApiStats();
  }
}