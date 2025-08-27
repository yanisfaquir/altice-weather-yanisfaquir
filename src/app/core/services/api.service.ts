import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, map, delay } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';
import { API_CONFIG } from '../constants/api.constants';
import { WeatherData } from '../../core/models/weather-data.model';
import {TemperatureUnit} from '../models/weather.enums'; 
import {AltitudeUnit} from '../models/weather.enums';
import {NetworkPowerLabels} from '../models/weather.enums';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly storage = inject(StorageService);
  private readonly MAX_REQUESTS = API_CONFIG.MAX_REQUESTS;
  
  private altitudeUnit = AltitudeUnit.METERS; 
  private temperatureUnit = TemperatureUnit.CELSIUS; 
  private networkPowerLabels = NetworkPowerLabels; 

  private requestCount = 0;
  private isOfflineMode = false;

  constructor() {
    // Carrega contador de requests do localStorage
    this.requestCount = this.storage.getItem<number>('api_request_count') || 0;
    this.isOfflineMode = this.storage.getItem<boolean>('offline_mode') || false;
    
    console.log(`🔄 Request count loaded: ${this.requestCount}/${this.MAX_REQUESTS}`);
    
    if (this.isOfflineMode) {
      console.log('🔌 Offline mode enabled - Using local storage fallback');
    }
  }

  // GET request com fallback local
// src/app/core/services/api.service.ts - Método get() corrigido
get<T>(endpoint: string, useCache = false): Observable<T> {
  console.log(`API GET: ${endpoint}`);
  
  // Para weather-data, sempre retornar dados combinados (local + remoto)
  if (endpoint.includes('weatherData') || endpoint.includes('weather-data')) {
    return this.getCombinedWeatherData() as Observable<T>;
  }
  
  // Lógica normal para outros endpoints...
  return this.http.get<T>(endpoint).pipe(
    tap(() => this.incrementRequestCount()),
    catchError(error => this.handleError<T>(error, endpoint))
  );
}

private getCombinedWeatherData(): Observable<WeatherData[]> {
  // 1. Obter dados locais primeiro
  const localData = this.storage.getItem<WeatherData[]>('local_weatherData') || [];
  console.log(`Local data found: ${localData.length} items`);
  
  // 2. Se offline ou sem requests, retornar só local
  if (this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
    return of(localData);
  }
  
  // 3. Tentar obter dados remotos
  return this.http.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
    map(remoteData => {
      console.log(`Remote data: ${remoteData?.length || 0} items`);
      console.log(`Local data: ${localData.length} items`);
      
      const combined = [...(remoteData || []), ...localData];
      console.log(`Combined total: ${combined.length} items`);
      
      return combined;
    }),
    tap(() => this.incrementRequestCount()),
    catchError(error => {
      console.log('Remote API failed, using local only');
      return of(localData);
    })
  );
}
// ADICIONAR este método novo
private getWeatherDataCombined(): Observable<WeatherData[]> {
  const localData = this.storage.getItem<WeatherData[]>('local_weatherData') || [];
  console.log('🗄️ Local weather data:', localData);
  
  if (this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
    console.log('🔌 Using only local data');
    return of(localData).pipe(delay(200));
  }
  
  // Tentar obter dados remotos E combinar com locais
  return this.http.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
    map(remoteData => {
      const combined = [...(remoteData || []), ...localData];
      console.log('🔄 Combined remote + local data:', combined.length, 'items');
      
      // Salvar dados remotos como backup
      if (remoteData && remoteData.length > 0) {
        this.storage.setItem('remote_weatherData_backup', remoteData);
      }
      
      return combined;
    }),
    tap(() => this.incrementRequestCount()),
    catchError(error => {
      console.log('❌ Remote failed, using only local data');
      return of(localData);
    })
  );
}

  // POST request com fallback local
  post<T>(endpoint: string, data: any): Observable<T> {
    if (this.isOfflineMode) {
      return this.postToLocalStorage<T>(endpoint, data);
    }
    
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.warn('⚠️ API request limit reached! Switching to local storage');
      this.enableOfflineMode();
      return this.postToLocalStorage<T>(endpoint, data);
    }
    
    return this.http.post<T>(endpoint, data).pipe(
      tap((response) => {
        console.log('🌐 Posted to API');
        // Invalidar cache relacionado
        this.invalidateRelatedCache(endpoint);
        // Salvar localmente também
        this.addToLocalStorage(endpoint, response);
        this.incrementRequestCount();
      }),
      catchError(error => this.handlePostError<T>(error, endpoint, data))
    );
  }

  // PUT request com fallback local
  put<T>(endpoint: string, data: any): Observable<T> {
    if (this.isOfflineMode) {
      return this.putToLocalStorage<T>(endpoint, data);
    }
    
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.warn('⚠️ API request limit reached! Switching to local storage');
      this.enableOfflineMode();
      return this.putToLocalStorage<T>(endpoint, data);
    }
    
    return this.http.put<T>(endpoint, data).pipe(
      tap((response) => {
        console.log('🌐 Updated via API');
        this.invalidateRelatedCache(endpoint);
        this.updateInLocalStorage(endpoint, response);
        this.incrementRequestCount();
      }),
      catchError(error => this.handlePutError<T>(error, endpoint, data))
    );
  }

  // DELETE request com fallback local
  delete<T>(endpoint: string): Observable<T> {
    if (this.isOfflineMode) {
      return this.deleteFromLocalStorage<T>(endpoint);
    }
    
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.warn('⚠️ API request limit reached! Switching to local storage');
      this.enableOfflineMode();
      return this.deleteFromLocalStorage<T>(endpoint);
    }
    
    return this.http.delete<T>(endpoint).pipe(
      tap((response) => {
        console.log('🌐 Deleted via API');
        this.invalidateRelatedCache(endpoint);
        this.removeFromLocalStorage(endpoint);
        this.incrementRequestCount();
      }),
      catchError(error => this.handleDeleteError<T>(error, endpoint))
    );
  }

  // Métodos para gerenciar dados locais
  private getFromLocalStorage<T>(endpoint: string): Observable<T> {
    const localKey = this.getLocalStorageKey(endpoint);
    const localData = this.storage.getItem<T>(localKey);
    
    if (localData) {
      console.log('💾 Data from local storage');
      // Simular delay da API para manter consistência de UX
      return of(localData).pipe(delay(200));
    }
    
    // Se não há dados locais, retornar dados mock ou erro
    return this.getMockData<T>(endpoint);
  }

  private postToLocalStorage<T>(endpoint: string, data: any): Observable<T> {
    console.log('Saving to local storage...');
    
    const existingData = this.storage.getItem<WeatherData[]>('local_weatherData') || [];
    
    const newItem = {
      ...data,
      id: this.generateLocalId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _isLocal: true
    };
    
    const updatedData = [...existingData, newItem];
    
    // Salvar com a chave correta
    this.storage.setItem('local_weatherData', updatedData);
    
    console.log(`Saved. Total local items: ${updatedData.length}`);
    console.log('New item:', newItem);
    
    // Invalidar cache para forçar refresh
    this.invalidateRelatedCache('weather-data');
    
    return of(newItem as T).pipe(delay(100));
  }

  private putToLocalStorage<T>(endpoint: string, data: any): Observable<T> {
    const localKey = this.getLocalStorageKey(endpoint);
    const existingData = this.storage.getItem<any[]>(localKey) || [];
    
    // Extrair ID do endpoint
    const id = this.extractIdFromEndpoint(endpoint);
    
    const updatedData = existingData.map(item => 
      item.id === id 
        ? { ...item, ...data, updatedAt: new Date(), _isLocal: true }
        : item
    );
    
    this.storage.setItem(localKey, updatedData);
    console.log('💾 Updated in local storage');
    
    const updatedItem = updatedData.find(item => item.id === id);
    return of(updatedItem as T).pipe(delay(200));
  }

  private deleteFromLocalStorage<T>(endpoint: string): Observable<T> {
    const localKey = this.getLocalStorageKey(endpoint);
    const existingData = this.storage.getItem<any[]>(localKey) || [];
    
    // Extrair ID do endpoint
    const id = this.extractIdFromEndpoint(endpoint);
    
    const filteredData = existingData.filter(item => item.id !== id);
    this.storage.setItem(localKey, filteredData);
    
    console.log('💾 Deleted from local storage');
    return of({} as T).pipe(delay(200));
  }

  // Métodos auxiliares para local storage
  private getLocalStorageKey(endpoint: string): string {
    // Converter endpoint em chave do localStorage
    const resource = endpoint.includes('weatherData') ? 'weatherData' : 'cities';
    return `local_${resource}`;
  }

  private extractIdFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  }

  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Dados mock para demonstração
  private getMockData<T>(endpoint: string): Observable<T> {
    if (endpoint.includes('weatherData')) {
      const mockWeatherData: WeatherData[] = [
        {
          id: 'mock_1',
          city: 'Porto',
          temperature: 18,
          temperatureUnit: this.temperatureUnit,
          isRaining: false,
          date: new Date(),
          networkPower: 1,
          altitude: 95,
          altitudeUnit: this.altitudeUnit,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock_2', 
          city: 'Lisboa',
          temperature: 22,
          temperatureUnit: this.temperatureUnit,
          isRaining: true,
          date: new Date(),
          networkPower: 3,
          altitude: 111,
          altitudeUnit:  this.altitudeUnit,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Salvar dados mock localmente para futuras consultas
      this.storage.setItem('local_weatherData', mockWeatherData);
      console.log('🎭 Using mock data');
      
      return of(mockWeatherData as T).pipe(delay(300));
    }
    
    return throwError(() => new Error('No local data available'));
  }

  // Error handlers com fallback local
  private handleError<T>(error: any, endpoint: string): Observable<T> {
    console.error('🚨 API Error:', error);
    
    // Em caso de erro de rede, tentar dados locais
    if (error.status === 0 || error.status >= 500) {
      console.log('🔄 Network error, trying local storage...');
      this.enableOfflineMode();
      return this.getFromLocalStorage<T>(endpoint);
    }
    
    return throwError(() => ({ ...error, userMessage: this.getUserErrorMessage(error) }));
  }

  private handlePostError<T>(error: any, endpoint: string, data: any): Observable<T> {
    console.error('🚨 POST Error:', error);
    
    if (error.status === 0 || error.status >= 500) {
      console.log('🔄 Network error, saving locally...');
      this.enableOfflineMode();
      return this.postToLocalStorage<T>(endpoint, data);
    }
    
    return throwError(() => ({ ...error, userMessage: this.getUserErrorMessage(error) }));
  }

  private handlePutError<T>(error: any, endpoint: string, data: any): Observable<T> {
    console.error('🚨 PUT Error:', error);
    
    if (error.status === 0 || error.status >= 500) {
      console.log('🔄 Network error, updating locally...');
      this.enableOfflineMode();
      return this.putToLocalStorage<T>(endpoint, data);
    }
    
    return throwError(() => ({ ...error, userMessage: this.getUserErrorMessage(error) }));
  }

  private handleDeleteError<T>(error: any, endpoint: string): Observable<T> {
    console.error('🚨 DELETE Error:', error);
    
    if (error.status === 0 || error.status >= 500) {
      console.log('🔄 Network error, deleting locally...');
      this.enableOfflineMode();
      return this.deleteFromLocalStorage<T>(endpoint);
    }
    
    return throwError(() => ({ ...error, userMessage: this.getUserErrorMessage(error) }));
  }

  // Gestão do modo offline
  private enableOfflineMode(): void {
    this.isOfflineMode = true;
    this.storage.setItem('offline_mode', true);
    console.log('🔌 Offline mode enabled');
  }

  enableOnlineMode(): void {
    this.isOfflineMode = false;
    this.storage.setItem('offline_mode', false);
    console.log('🌐 Online mode enabled');
  }

  // Métodos públicos para gestão
  getApiStats() {
    return {
      requestCount: this.requestCount,
      remainingRequests: this.MAX_REQUESTS - this.requestCount,
      isOfflineMode: this.isOfflineMode,
      cacheStats: this.cache.getStats(),
      // localData: this.getLocalDataStats()
    };
  }

  // private getLocalDataStats() {
  //   return {
  //     weatherData: this.storage.getItem('local_weatherData')?.length || 0,
  //     cities: this.storage.getItem('local_cities')?.length || 0
  //   };
  // }

  resetRequestCount(): void {
    this.requestCount = 0;
    this.storage.setItem('api_request_count', 0);
    console.log('🔄 Request count reset');
  }

  clearLocalData(): void {
    this.storage.removeItem('local_weatherData');
    this.storage.removeItem('local_cities');
    console.log('🧹 Local data cleared');
  }

  // Métodos privados existentes
  private saveToLocalStorage<T>(endpoint: string, data: T): void {
    const localKey = this.getLocalStorageKey(endpoint);
    this.storage.setItem(localKey, data);
  }

  private addToLocalStorage<T>(endpoint: string, data: T): void {
    const localKey = this.getLocalStorageKey(endpoint);
    const existing = this.storage.getItem<T[]>(localKey) || [];
    this.storage.setItem(localKey, [...existing, data]);
  }

  private updateInLocalStorage<T>(endpoint: string, data: any): void {
    const localKey = this.getLocalStorageKey(endpoint);
    const existing = this.storage.getItem<any[]>(localKey) || [];
    const id = this.extractIdFromEndpoint(endpoint);
    
    const updated = existing.map(item => 
      item.id === id ? { ...item, ...data } : item
    );
    
    this.storage.setItem(localKey, updated);
  }

  private removeFromLocalStorage(endpoint: string): void {
    const localKey = this.getLocalStorageKey(endpoint);
    const existing = this.storage.getItem<any[]>(localKey) || [];
    const id = this.extractIdFromEndpoint(endpoint);
    
    const filtered = existing.filter(item => item.id !== id);
    this.storage.setItem(localKey, filtered);
  }

  private incrementRequestCount(): void {
    this.requestCount++;
    this.storage.setItem('api_request_count', this.requestCount);
    console.log(`📊 Requests: ${this.requestCount}/${this.MAX_REQUESTS}`);
    
    // Aviso quando próximo do limite
    if (this.requestCount >= this.MAX_REQUESTS * 0.8) {
      console.warn(`⚠️ Approaching API limit: ${this.requestCount}/${this.MAX_REQUESTS}`);
    }
  }


  private invalidateRelatedCache(endpoint: string): void {
    // Limpar cache de weather data quando há mudanças
    if (endpoint.includes('weatherData') || endpoint === 'weather-data') {
      this.cache.delete('GET_weather-data');
      this.cache.delete(`GET_${API_ENDPOINTS.WEATHER_DATA}`);
      console.log('🗑️ Weather data cache invalidated');
    }
  }

  private getUserErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Erro de rede. Os dados serão salvos localmente.';
    } else if (error.status >= 400 && error.status < 500) {
      return 'Erro na requisição. Verifique os dados.';
    } else if (error.status >= 500) {
      return 'Erro no servidor. Usando dados locais.';
    }
    
    return 'Erro inesperado. Dados salvos localmente.';
  }
}