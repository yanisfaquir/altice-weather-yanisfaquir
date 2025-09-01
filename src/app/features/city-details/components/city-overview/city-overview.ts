import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CityDetailsService, CityDetail } from '../../../city-details/service/city-details.service';
import { WeatherData } from '../../../../core/models/weather-data.model';
import { NetworkPowerLabels } from '../../../../core/models/weather.enums';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';


@Component({
  selector: 'app-city-overview',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './city-overview.html',
  styleUrls: ['./city-overview.scss']
})
export class CityOverviewComponent implements OnInit {
  @Input() cityName: string = '';
  
  private cityDetailsService = inject(CityDetailsService);
  

  cityDetails = signal<CityDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  

  networkPowerLabels = NetworkPowerLabels;

  ngOnInit(): void {
    if (this.cityName) {
      this.loadCityDetails();
    }
  }

  private loadCityDetails(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.cityDetailsService.getCityDetails(this.cityName).subscribe({
      next: (details) => {
        if (details) {
          this.cityDetails.set(details);
        } else {
          this.error.set('City not found or no data available');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading city details:', err);
        this.error.set('Failed to load city details');
        this.isLoading.set(false);
      }
    });
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-blue-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  }

  getNetworkPowerColor(power: number): string {
    if (power >= 4) return 'text-green-600';
    if (power >= 3) return 'text-yellow-600';
    return 'text-red-600';
  }

  getNetworkPowerBgColor(power: number): string {
    if (power >= 4) return 'bg-green-100';
    if (power >= 3) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-PT', {
      month: 'long',
      year: 'numeric'
    });
  }

  refresh(): void {
    this.loadCityDetails();
  }
}