import { Component, Input } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";


@Component({
  selector: 'app-dashboard-welcome-card',
  imports: [ TranslatePipe], 
  templateUrl: './dashboard-welcome-card.html',
  styleUrls: ['./dashboard-welcome-card.scss']
})
export class DashboardWelcomeCardComponent {
  @Input() totalCities:  number | null = 0;
  @Input() totalRecords: number | null = 0;
  @Input() avgNetworkPower: number | null = 0;
}
