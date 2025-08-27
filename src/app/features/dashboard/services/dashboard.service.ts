import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { WeatherData } from '../../../core/models/weather-data.model';
import {NetworkPower} from '../../../core/models/weather.enums'
export interface CityOverview {
  cityName: string;
  totalRecords: number;
  averageTemperature: number;
  averageNetworkPower: number;
  averageAltitude: number;
  rainyDaysCount: number;
  rainyDaysPercentage: number;
  lastUpdate: Date;
  worstNetworkPower: NetworkPower;
  status: 'good' | 'warning' | 'critical';
}

export interface DashboardSummary {
  totalCities: number;
  totalRecords: number;
  averageTemperature: number;
  averageNetworkPower: number;
  citiesWithPoorNetwork: number;
  lastUpdate: Date;
  cities: CityOverview[];
}

/**
 * Dashboard Service
 * Serviço para agregar e processar dados meteorológicos para o dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiService = inject(ApiService);

  /**
   * Obter todos os dados e processar para o dashboard
   */
  getDashboardData(): Observable<DashboardSummary> {
    return this.apiService.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
      map(data => this.processWeatherData(data)),
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        return of(this.getEmptyDashboard());
      })
    );
  }

  /**
   * Obter overview de uma cidade específica
   */
  getCityOverview(cityName: string): Observable<CityOverview | null> {
    return this.apiService.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
      map(data => {
        const cityData = data.filter(d => d.city.toLowerCase() === cityName.toLowerCase());
        return cityData.length > 0 ? this.processCityData(cityName, cityData) : null;
      }),
      catchError(error => {
        console.error(`Error loading data for city ${cityName}:`, error);
        return of(null);
      })
    );
  }

  /**
   * Obter estatísticas rápidas
   */
  getQuickStats(): Observable<{
    totalRecords: number;
    totalCities: number;
    averageNetworkPower: number;
    criticalCities: number;
  }> {
    return this.apiService.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
      map(data => {
        const cities = this.groupByCity(data);
        const cityOverviews = Object.keys(cities).map(city => 
          this.processCityData(city, cities[city])
        );

        return {
          totalRecords: data.length,
          totalCities: Object.keys(cities).length,
          averageNetworkPower: this.calculateAverage(data.map(d => d.networkPower)),
          criticalCities: cityOverviews.filter(c => c.status === 'critical').length
        };
      }),
      catchError(() => of({
        totalRecords: 0,
        totalCities: 0,
        averageNetworkPower: 0,
        criticalCities: 0
      }))
    );
  }

  // Métodos privados de processamento de dados

  private processWeatherData(data: WeatherData[]): DashboardSummary {
    if (!data || data.length === 0) {
      return this.getEmptyDashboard();
    }

    const cities = this.groupByCity(data);
    const cityOverviews = Object.keys(cities).map(city => 
      this.processCityData(city, cities[city])
    );

    return {
      totalCities: cityOverviews.length,
      totalRecords: data.length,
      averageTemperature: this.roundTo2Decimals(this.calculateAverage(data.map(d => d.temperature))),
      averageNetworkPower: this.roundTo2Decimals(this.calculateAverage(data.map(d => d.networkPower))),
      citiesWithPoorNetwork: cityOverviews.filter(c => c.averageNetworkPower <= 2).length,
      lastUpdate: new Date(),
      cities: cityOverviews.sort((a, b) => b.totalRecords - a.totalRecords) // Ordenar por mais dados
    };
  }

  private processCityData(cityName: string, cityData: WeatherData[]): CityOverview {
    const temperatures = cityData.map(d => d.temperature);
    const networkPowers = cityData.map(d => d.networkPower);
    const altitudes = cityData.map(d => d.altitude);
    const rainyDays = cityData.filter(d => d.isRaining).length;
    
    const averageNetworkPower = this.calculateAverage(networkPowers);
    const worstNetworkPower = Math.min(...networkPowers) as NetworkPower;
    
    // Determinar status da cidade
    let status: 'good' | 'warning' | 'critical' = 'good';
    if (averageNetworkPower <= 2) {
      status = 'critical';
    } else if (averageNetworkPower <= 3 || (rainyDays / cityData.length) > 0.6) {
      status = 'warning';
    }

    return {
      cityName,
      totalRecords: cityData.length,
      averageTemperature: this.roundTo2Decimals(this.calculateAverage(temperatures)),
      averageNetworkPower: this.roundTo2Decimals(averageNetworkPower),
      averageAltitude: this.roundTo2Decimals(this.calculateAverage(altitudes)),
      rainyDaysCount: rainyDays,
      rainyDaysPercentage: this.roundTo2Decimals((rainyDays / cityData.length) * 100),
      lastUpdate: new Date(Math.max(...cityData.map(d => new Date(d.createdAt || d.date).getTime()))),
      worstNetworkPower,
      status
    };
  }

  private groupByCity(data: WeatherData[]): Record<string, WeatherData[]> {
    return data.reduce((acc, item) => {
      const cityKey = item.city.toLowerCase().trim();
      if (!acc[cityKey]) {
        acc[cityKey] = [];
      }
      acc[cityKey].push(item);
      return acc;
    }, {} as Record<string, WeatherData[]>);
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  private getEmptyDashboard(): DashboardSummary {
    return {
      totalCities: 0,
      totalRecords: 0,
      averageTemperature: 0,
      averageNetworkPower: 0,
      citiesWithPoorNetwork: 0,
      lastUpdate: new Date(),
      cities: []
    };
  }
}