// src/app/features/dashboard/components/city-list/city-list.component.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService, CityOverview, DashboardSummary } from '../../services/dashboard.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { SettingsService } from '../../../../features/settings/components/services/settings.service';
import { TimezoneService } from '../../../../core/services/timezone.service';
import { TranslatePipe, LocalizedDatePipe } from '../../../../shared/pipes/translate.pipe';
import {CityOverviewComponent} from '../../../../features/city-details/components/city-overview/city-overview'
@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LocalizedDatePipe, CityOverviewComponent],
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss']
})
export class CityListComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private i18nService = inject(I18nService);
  private settingsService = inject(SettingsService);
  private timezoneService = inject(TimezoneService);

  // Reactive state
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly dashboardData = signal<DashboardSummary | null>(null);
  readonly selectedCity = signal<string | null>(null);

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('CityList: Dashboard data loaded:', data);
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('CityList: Error loading data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  // Format temperature with current settings
  formatTemperature(tempCelsius: number): string {
    return this.settingsService.formatTemperature(tempCelsius);
  }

  // Format date with current timezone and locale
  formatDate(date: Date): string {
    return this.settingsService.formatDateTime(new Date(date));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }

  getNetworkPowerColor(power: number): string {
    if (power >= 4) return 'text-green-600';
    if (power >= 3) return 'text-yellow-600';
    if (power >= 2) return 'text-orange-600';
    return 'text-red-600';
  }

  viewCityDetails(cityName: string): void {
    this.selectedCity.set(cityName);
  }

  closeCityDetails(): void {
    this.selectedCity.set(null);
  }
}