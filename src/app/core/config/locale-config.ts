// src/app/core/config/locale-config.ts
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localePt from '@angular/common/locales/pt';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';

// Register all supported locales
registerLocaleData(localeEn, 'en');
registerLocaleData(localePt, 'pt');


export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },

];

export const DEFAULT_LOCALE = 'en';
