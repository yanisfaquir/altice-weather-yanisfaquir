/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';

import localeEn from '@angular/common/locales/en';
import localePt from '@angular/common/locales/pt';


// Regista todos os locales disponíveis
registerLocaleData(localeEn, 'en');
registerLocaleData(localePt, 'pt');


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
