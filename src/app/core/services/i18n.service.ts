import { Injectable, LOCALE_ID, Inject, signal, computed, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../config/locale-config';

export interface TranslationKeys {

  'common.loading': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.close': string;
  'common.search': string;
  'common.filter': string;
  'common.export': string;
  'common.import': string;
  'common.settings': string;
  'common.dashboard': string;
  'common.copy': string;
  'common.reset': string;
  'common.submitting': string;

  'app.title': string;
  'app.subtitle': string;
  'nav.addData': string;
  'nav.cities': string;
  'nav.settings': string;
  'welcome.title': string;
  'welcome.description': string;
  'stats.totalCities': string;
  'stats.totalRecords': string;
  'stats.avgNetworkPower': string;
  

  'footer.copyright': string;
  'footer.lastUpdate': string;
  'footer.version': string;

  'weather.form.title': string;
  'weather.form.description': string;
  'weather.form.city': string;
  'weather.form.cityPlaceholder': string;
  'weather.form.temperature': string;
  'weather.form.temperatureHelper': string;
  'weather.form.raining': string;
  'weather.form.networkPower': string;
  'weather.form.selectNetworkPower': string;
  'weather.form.networkPower.critical': string;
  'weather.form.networkPower.poor': string;
  'weather.form.networkPower.average': string;
  'weather.form.networkPower.good': string;
  'weather.form.networkPower.excellent': string;
  'weather.form.altitude': string;
  'weather.form.currentSettings': string;
  'weather.form.currentTime': string;
  'weather.form.submit': string;
  'weather.form.successMessage': string;
  'weather.form.validation.cityRequired': string;
  'weather.form.validation.cityMinLength': string;
  'weather.form.validation.temperatureRequired': string;
  'weather.form.validation.temperatureRange': string;
  'weather.form.validation.networkPowerRequired': string;
  'weather.form.validation.altitudeRequired': string;
  'weather.form.validation.altitudeRange': string;
  
  // Cities
  'cities.title': string;
  'cities.overview': string;
  'cities.description': string;
  'cities.totalCities': string;
  'cities.totalRecords': string;
  'cities.records': string;
  'cities.averageTemp': string;
  'cities.temperature': string;
  'cities.range': string;
  'cities.networkStatus': string;
  'cities.networkPower': string;
  'cities.altitude': string;
  'cities.lastUpdate': string;
  'cities.timezone': string;
  'cities.viewDetails': string;
  'cities.noCities': string;
  'cities.noCitiesDesc': string;
  'cities.displaySettings': string;
  'cities.currentTime': string;
  'cities.excellent': string;
  'cities.good': string;
  'cities.average': string;
  'cities.poor': string;
  'cities.critical': string;
  

  'settings.title': string;
  'settings.customize': string;
  'settings.appearance': string;
  'settings.theme': string;
  'settings.language': string;
  'settings.languageRegion': string;
  'settings.timezone': string;
  'settings.currentTime': string;
  'settings.displaySettings': string;
  'settings.dateFormat': string;
  'settings.sampleDate': string;
  'settings.temperatureUnit': string;
  'settings.sampleTemperature': string;
  'settings.notifications': string;
  'settings.weatherAlerts': string;
  'settings.networkAlerts': string;
  'settings.dataUpdates': string;
  'settings.dataManagement': string;
  'settings.exportSettings': string;
  'settings.importSettings': string;
  'settings.resetSettings': string;
  'settings.resetConfirm': string;
  'settings.systemInfo': string;
  'settings.currentLanguage': string;
  'settings.currentTimezone': string;
  'settings.timezoneOffset': string;
  'settings.sampleRelativeTime': string;
  'settings.currentTheme': string;
  'settings.temperatureDisplay': string;
  'settings.exportPlaceholder': string;
  'settings.importPlaceholder': string;
  'settings.importError': string;
  

  'theme.light': string;
  'theme.dark': string;
  'theme.auto': string;

  'units.celsius': string;
  'units.fahrenheit': string;
  'units.meters': string;
  'units.feet': string;
  

  'status.online': string;
  'status.offline': string;
  'status.error': string;
  'status.success': string;

  'main.title': string;
  'main.subtitle': string;
  'stat.cities.monitored': string;
  'stat.data.records': string;
  'stat.avg.network': string;
  'loading.city.details': string;
  'error.loading.city': string;
  'try.again.button': string;
  'detailed.analysis.subtitle': string;
  'total.records': string;
  'avg.temperature': string;
  'avg.network.power': string;
  'avg.altitude': string;
  'temperature.analysis': string;
  'temperature.range': string;
  'temperature.trend': string;
  'network.power.distribution': string;
  'monthly.analysis': string;
  'table.month': string;
  'table.records': string;
  'table.avg.temp': string;
  'table.avg.network': string;
  'table.rainy.days': string;
  'worst.performance.records': string;
  'temp.label': string;
  'altitude.label': string;
  'rain.label': string;
  'recent.records': string;
  'btn.add.weather': string;
  'btn.add.weather.active': string;
  'btn.view.cities': string;
  'btn.view.cities.active': string;
  'btn.settings': string;
  'btn.settings.active': string;
  'ready.to.start': string;
  'choose.option.text': string;
  'ready-to-start': string;
  'choose-option-text-part1': string;
  'choose-option-text-add-weather': string;
  'choose-option-text-part2': string;
  'choose-option-text-view-cities': string;
  'choose-option-text-part3': string;
}

const TRANSLATIONS: Record<string, Partial<TranslationKeys>> = {
  pt: {
    'common.loading': 'A carregar...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.settings': 'Configurações',
    'common.dashboard': 'Dashboard',
    
    'weather.form.title': 'Adicionar Dados Meteorológicos',
    'weather.form.description': 'Adicione novos dados meteorológicos e de rede para análise',
    'weather.form.city': 'Cidade',
    'weather.form.cityPlaceholder': 'Digite o nome da cidade',
    'weather.form.temperature': 'Temperatura',
    'weather.form.temperatureHelper': 'Exemplo de conversão: {{example}}',
    'weather.form.raining': 'A chover',
    'weather.form.networkPower': 'Potência da Rede',
    'weather.form.selectNetworkPower': 'Selecione a potência da rede',
    'weather.form.networkPower.critical': 'Crítico',
    'weather.form.networkPower.poor': 'Fraco',
    'weather.form.networkPower.average': 'Médio',
    'weather.form.networkPower.good': 'Bom',
    'weather.form.networkPower.excellent': 'Excelente',
    'weather.form.altitude': 'Altitude',
    'weather.form.currentSettings': 'Configurações Atuais',
    'weather.form.currentTime': 'Hora Atual',
    'weather.form.submit': 'Adicionar Dados',
    'weather.form.successMessage': 'Dados meteorológicos adicionados com sucesso!',
    'weather.form.validation.cityRequired': 'Cidade é obrigatória',
    'weather.form.validation.cityMinLength': 'Cidade deve ter pelo menos 2 caracteres',
    'weather.form.validation.temperatureRequired': 'Temperatura é obrigatória',
    'weather.form.validation.temperatureRange': 'Temperatura deve estar entre -50°C e 60°C',
    'weather.form.validation.networkPowerRequired': 'Potência da rede é obrigatória',
    'weather.form.validation.altitudeRequired': 'Altitude é obrigatória',
    'weather.form.validation.altitudeRange': 'Altitude deve estar entre -1000m e 10000m',
    
    'cities.title': 'Cidades',
    'cities.overview': 'Visão Geral das Cidades',
    'cities.totalCities': 'Total de Cidades',
    'cities.averageTemp': 'Temperatura Média',
    'cities.networkStatus': 'Estado da Rede',
    'cities.lastUpdate': 'Última Atualização',
    'cities.excellent': 'Excelente',
    'cities.good': 'Bom',
    'cities.average': 'Médio',
    'cities.poor': 'Fraco',
    'cities.critical': 'Crítico',
    
    'settings.title': 'Configurações',
    'settings.appearance': 'Aparência',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.timezone': 'Fuso Horário',
    'settings.displaySettings': 'Configurações de Visualização',
    'settings.dateFormat': 'Formato de Data',
    'settings.temperatureUnit': 'Unidade de Temperatura',
    'settings.dataManagement': 'Gestão de Dados',
    'settings.exportSettings': 'Exportar Configurações',
    'settings.importSettings': 'Importar Configurações',
    'settings.resetSettings': 'Repor Configurações',
    'settings.resetConfirm': 'Tem a certeza que quer repor as configurações padrão?',
    
    'theme.light': 'Claro',
    'theme.dark': 'Escuro',
    'theme.auto': 'Automático',
    
    'units.celsius': 'Celsius (°C)',
    'units.fahrenheit': 'Fahrenheit (°F)',
    'units.meters': 'metros',
    'units.feet': 'pés',
    
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.error': 'Erro',
    'status.success': 'Sucesso', 
    'main.title': 'Dashboard de Comunicação Meteorológica',
    'main.subtitle': 'Coletando dados meteorológicos e analisando o impacto na comunicação',
    'btn.add.weather': '📊 Adicionar Dados Meteorológicos',
    'btn.add.weather.active': '✅ Adicionar Dados Meteorológicos',
    'btn.view.cities': '🏙️ Ver Cidades',
    'btn.view.cities.active': '✅ Ver Cidades',
    'btn.settings': '⚙️ Configurações',
    'btn.settings.active': '✅ Configurações',
    'ready.to.start': '🚀 Pronto para começar!',
    'choose.option.text': 'Escolha uma opção acima para iniciar: <strong>Adicionar Dados Meteorológicos</strong> ou <strong>Ver Cidades</strong>.', 
    'stats.totalCities': 'Total de Cidades',
    'stats.totalRecords': 'Total de Registros',
    'stats.avgNetworkPower': 'Potência Média da Rede',
    'ready-to-start': '🚀 Pronto para começar!',
    'choose-option-text-part1': 'Escolha uma opção acima para iniciar:',
    'choose-option-text-add-weather': 'Adicionar Dados Meteorológicos',
    'choose-option-text-part2': 'para coletar novas informações ou',
    'choose-option-text-view-cities': 'Ver Cidades',
    'choose-option-text-part3': 'para visualizar o dashboard.'


  },
  
  en: {
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.settings': 'Settings',
    'common.dashboard': 'Dashboard',
    'common.copy': 'Copy to Clipboard',
    'common.reset': 'Reset',
    'common.submitting': 'Submitting...',
    
    'app.title': 'Altice Weather Dashboard',
    'app.subtitle': 'Weather and network analysis',
    
    'nav.addData': 'Add Data',
    'nav.cities': 'Cities',
    'nav.settings': 'Settings',
    
    'welcome.title': 'Welcome to Weather Dashboard',
    'welcome.description': 'Monitor and analyze weather data and its impact on network communications',
    
    
  'stats.totalCities': 'Total Cities',
  'stats.totalRecords': 'Total Records',
  'stats.avgNetworkPower': 'Avg Network Power',
  

    
    'footer.copyright': '© 2024 Altice Weather Dashboard',
    'footer.lastUpdate': 'Last Update',
    'footer.version': 'Version',
    
    'weather.form.title': 'Add Weather Data',
    'weather.form.description': 'Add new weather and network data for analysis',
    'weather.form.city': 'City',
    'weather.form.cityPlaceholder': 'Enter city name',
    'weather.form.temperature': 'Temperature',
    'weather.form.temperatureHelper': 'Conversion example: {{example}}',
    'weather.form.raining': 'Raining',
    'weather.form.networkPower': 'Network Power',
    'weather.form.selectNetworkPower': 'Select network power',
    'weather.form.networkPower.critical': 'Critical',
    'weather.form.networkPower.poor': 'Poor',
    'weather.form.networkPower.average': 'Average',
    'weather.form.networkPower.good': 'Good',
    'weather.form.networkPower.excellent': 'Excellent',
    'weather.form.altitude': 'Altitude',
    'weather.form.currentSettings': 'Current Settings',
    'weather.form.currentTime': 'Current Time',
    'weather.form.submit': 'Add Data',
    'weather.form.successMessage': 'Weather data added successfully!',
    'weather.form.validation.cityRequired': 'City is required',
    'weather.form.validation.cityMinLength': 'City must have at least 2 characters',
    'weather.form.validation.temperatureRequired': 'Temperature is required',
    'weather.form.validation.temperatureRange': 'Temperature must be between -50°C and 60°C',
    'weather.form.validation.networkPowerRequired': 'Network power is required',
    'weather.form.validation.altitudeRequired': 'Altitude is required',
    'weather.form.validation.altitudeRange': 'Altitude must be between -1000m and 10000m',
    
    'cities.title': 'Cities',
    'cities.overview': 'Cities Overview',
    'cities.description': 'Detailed analysis of weather data by city',
    'cities.totalCities': 'Total Cities',
    'cities.totalRecords': 'Total Records',
    'cities.records': 'records',
    'cities.averageTemp': 'Average Temperature',
    'cities.temperature': 'Temperature',
    'cities.range': 'Range',
    'cities.networkStatus': 'Network Status',
    'cities.networkPower': 'Network Power',
    'cities.altitude': 'Altitude',
    'cities.lastUpdate': 'Last Update',
    'cities.timezone': 'Timezone',
    'cities.viewDetails': 'View Details',
    'cities.noCities': 'No Cities Found',
    'cities.noCitiesDesc': 'Add weather data to see cities here',
    'cities.displaySettings': 'Display Settings',
    'cities.currentTime': 'Current Time',
    'cities.excellent': 'Excellent',
    'cities.good': 'Good',
    'cities.average': 'Average',
    'cities.poor': 'Poor',
    'cities.critical': 'Critical',
    
    'settings.title': 'Settings',
    'settings.customize': 'Customize your weather dashboard experience',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.languageRegion': 'Language & Region',
    'settings.timezone': 'Timezone',
    'settings.currentTime': 'Current Time',
    'settings.displaySettings': 'Display Settings',
    'settings.dateFormat': 'Date Format',
    'settings.sampleDate': 'Sample Date',
    'settings.temperatureUnit': 'Temperature Unit',
    'settings.sampleTemperature': 'Sample Temperature',
    'settings.notifications': 'Notifications',
    'settings.weatherAlerts': 'Weather Alerts',
    'settings.networkAlerts': 'Network Alerts',
    'settings.dataUpdates': 'Data Updates',
    'settings.dataManagement': 'Data Management',
    'settings.exportSettings': 'Export Settings',
    'settings.importSettings': 'Import Settings',
    'settings.resetSettings': 'Reset Settings',
    'settings.resetConfirm': 'Are you sure you want to reset to default settings?',
    'settings.systemInfo': 'System Information',
    'settings.currentLanguage': 'Current Language',
    'settings.currentTimezone': 'Current Timezone',
    'settings.timezoneOffset': 'Timezone Offset',
    'settings.sampleRelativeTime': 'Sample Relative Time',
    'settings.currentTheme': 'Current Theme',
    'settings.temperatureDisplay': 'Temperature Display',
    'settings.exportPlaceholder': 'Settings data will appear here...',
    'settings.importPlaceholder': 'Paste your settings data here...',
    'settings.importError': 'Invalid settings format',
    
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.auto': 'Auto',
    
    'units.celsius': 'Celsius (°C)',
    'units.fahrenheit': 'Fahrenheit (°F)',
    'units.meters': 'meters',
    'units.feet': 'feet',
    
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.error': 'Error',
    'status.success': 'Success', 

    'main.title': 'Weather Communication Dashboard',
    'main.subtitle': 'Collecting weather data and analyzing its impact on communications across multiple cities.',
    'btn.add.weather': '📊 Add Weather Data',
    'btn.add.weather.active': '✅ Add Weather Data',
    'btn.view.cities': '🏙️ View Cities',
    'btn.view.cities.active': '✅ View Cities',
    'btn.settings': '⚙️ Settings',
    'btn.settings.active': '✅ Settings',
    'ready.to.start': '🚀 Ready to Start!',
    'choose.option.text': 'Choose an option above to get started: <strong>Add Weather Data</strong> or <strong>View Cities</strong>.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLocaleSubject = new BehaviorSubject<string>(DEFAULT_LOCALE);
  
  // Signals for reactive approach
  public readonly currentLocale = signal<string>(DEFAULT_LOCALE);
  public readonly translations = computed(() => TRANSLATIONS[this.currentLocale()] || TRANSLATIONS[DEFAULT_LOCALE]);
  
  // Observable for components that prefer RxJS
  public readonly currentLocale$ = this.currentLocaleSubject.asObservable();

  constructor(@Inject(LOCALE_ID) private localeId: string) {
    // Initialize with browser locale or default
    const initialLocale = this.getBrowserLocale() || DEFAULT_LOCALE;
    this.setLocale(initialLocale);
    
    // Effect to update locale when signal changes
    effect(() => {
      document.documentElement.lang = this.currentLocale();
    });
  }

  setLocale(locale: string): void {
    if (this.isLocaleSupported(locale)) {
      this.currentLocale.set(locale);
      this.currentLocaleSubject.next(locale);
      document.documentElement.lang = locale; // atualiza lang do HTML
    }
  }

  translate(key: keyof TranslationKeys, params?: Record<string, string>): string {
    const translations = this.translations();
    let translation = translations[key] || key;

    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }

  // Reactive translate function for use in computed signals
  t = (key: keyof TranslationKeys, params?: Record<string, string>) => {
    return this.translate(key, params);
  };

  getSupportedLocales() {
    return SUPPORTED_LOCALES;
  }

  isLocaleSupported(locale: string): boolean {
    return SUPPORTED_LOCALES.some(l => l.code === locale);
  }

  private getBrowserLocale(): string | null {
    const browserLang = navigator.language.split('-')[0];
    return this.isLocaleSupported(browserLang) ? browserLang : null;
  }

  // Helper for formatting numbers according to locale
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale(), options).format(value);
  }

  // Helper for formatting dates according to locale
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale(), options).format(date);
  }

  // Helper for formatting currency
  formatCurrency(value: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat(this.currentLocale(), {
      style: 'currency',
      currency
    }).format(value);
  }
}