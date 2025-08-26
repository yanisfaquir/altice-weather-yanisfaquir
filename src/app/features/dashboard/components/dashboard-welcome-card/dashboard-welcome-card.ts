import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-welcome-card',
  templateUrl: './dashboard-welcome-card.html',
  styleUrls: ['./dashboard-welcome-card.scss']
})
export class DashboardWelcomeCardComponent {
  @Input() totalCities:  number | null = 0;
  @Input() totalRecords: number | null = 0;
  @Input() avgNetworkPower: number | null = 0;
}
