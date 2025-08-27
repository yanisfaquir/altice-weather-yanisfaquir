import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api.constants';
import { WeatherData } from '../../../core/models/weather-data.model';
import {NetworkPower} from '../../../core/models/weather.enums'; 
export interface CityDetail {
  cityName: string;
  totalRecords: number;
  averageTemperature: number;
  averageNetworkPower: number;
  averageAltitude: number;
  temperatureRange: { min: number; max: number };
  worstRecords: WeatherData[];
  recentRecords: WeatherData[];
  monthlyData: MonthlyData[];
  networkPowerDistribution: NetworkDistribution[];
  temperatureTrend: 'up' | 'down' | 'stable';
}

export interface MonthlyData {
  month: string;
  averageTemp: number;
  averageNetwork: number;
  recordCount: number;
  rainyDays: number;
}

export interface NetworkDistribution {
  power: NetworkPower;
  count: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class CityDetailsService {
  private apiService = inject(ApiService);

  getCityDetails(cityName: string): Observable<CityDetail | null> {
    return this.apiService.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
      map(data => {
        const cityData = data.filter(d => 
          d.city.toLowerCase().trim() === cityName.toLowerCase().trim()
        );
        
        if (cityData.length === 0) {
          return null;
        }

        return this.processCityDetails(cityName, cityData);
      }),
      catchError(error => {
        console.error(`Error loading details for ${cityName}:`, error);
        return of(null);
      })
    );
  }

  private processCityDetails(cityName: string, data: WeatherData[]): CityDetail {
    const temperatures = data.map(d => d.temperature);
    const networkPowers = data.map(d => d.networkPower);
    const altitudes = data.map(d => d.altitude);

    // Sort by date for trend analysis
    const sortedData = data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      cityName,
      totalRecords: data.length,
      averageTemperature: this.calculateAverage(temperatures),
      averageNetworkPower: this.calculateAverage(networkPowers),
      averageAltitude: this.calculateAverage(altitudes),
      temperatureRange: {
        min: Math.min(...temperatures),
        max: Math.max(...temperatures)
      },
      worstRecords: this.findWorstRecords(data),
      recentRecords: this.getRecentRecords(sortedData, 5),
      monthlyData: this.calculateMonthlyData(data),
      networkPowerDistribution: this.calculateNetworkDistribution(networkPowers),
      temperatureTrend: this.calculateTemperatureTrend(sortedData)
    };
  }

  private findWorstRecords(data: WeatherData[]): WeatherData[] {
    return data
      .filter(d => d.networkPower <= 2)
      .sort((a, b) => a.networkPower - b.networkPower)
      .slice(0, 10);
  }

  private getRecentRecords(sortedData: WeatherData[], count: number): WeatherData[] {
    return sortedData.slice(-count).reverse();
  }

  private calculateMonthlyData(data: WeatherData[]): MonthlyData[] {
    const monthlyGroups = this.groupByMonth(data);
    
    return Object.keys(monthlyGroups)
      .sort()
      .map(month => {
        const monthData = monthlyGroups[month];
        const temperatures = monthData.map(d => d.temperature);
        const networkPowers = monthData.map(d => d.networkPower);
        const rainyDays = monthData.filter(d => d.isRaining).length;

        return {
          month,
          averageTemp: this.roundTo2Decimals(this.calculateAverage(temperatures)),
          averageNetwork: this.roundTo2Decimals(this.calculateAverage(networkPowers)),
          recordCount: monthData.length,
          rainyDays
        };
      });
  }

  private calculateNetworkDistribution(networkPowers: NetworkPower[]): NetworkDistribution[] {
    const distribution = [1, 2, 3, 4, 5].map(power => {
      const count = networkPowers.filter(p => p === power).length;
      return {
        power: power as NetworkPower,
        count,
        percentage: this.roundTo2Decimals((count / networkPowers.length) * 100)
      };
    });

    return distribution.filter(d => d.count > 0);
  }

  private calculateTemperatureTrend(sortedData: WeatherData[]): 'up' | 'down' | 'stable' {
    if (sortedData.length < 3) return 'stable';

    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(-Math.floor(sortedData.length / 2));

    const firstAvg = this.calculateAverage(firstHalf.map(d => d.temperature));
    const secondAvg = this.calculateAverage(secondHalf.map(d => d.temperature));

    const difference = secondAvg - firstAvg;

    if (Math.abs(difference) < 1) return 'stable';
    return difference > 0 ? 'up' : 'down';
  }

  private groupByMonth(data: WeatherData[]): Record<string, WeatherData[]> {
    return data.reduce((groups, item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(item);
      
      return groups;
    }, {} as Record<string, WeatherData[]>);
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private roundTo2Decimals(num: number): number {
    return Math.round(num * 100) / 100;
  }
}