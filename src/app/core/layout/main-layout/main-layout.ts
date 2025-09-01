import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';


@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayoutComponent {

}
