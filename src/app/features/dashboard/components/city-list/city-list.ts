import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService, CityOverview, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-list.html',
  styleUrls: ['./city-list.scss']
})
export class CityListComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Signals for reactive state
  dashboardData = signal<DashboardSummary | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('📊 Dashboard data loaded:', data);
        this.dashboardData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(' Error loading dashboard data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  getStatusIcon(status: CityOverview['status']): string {
    switch (status) {
      case 'good': return 'good';
      case 'warning': return 'warning';
      case 'critical': return 'critical';
      default: return 'Unknow';
    }
  }

  getStatusColor(status: CityOverview['status']): string {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getNetworkPowerColor(networkPower: number): string {
    if (networkPower >= 4) return 'text-green-600';
    if (networkPower >= 3) return 'text-yellow-600';
    return 'text-red-600';
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
}