import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, delay } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';
import { API_CONFIG } from '../constants/api.constants';
import { WeatherData } from '../../core/models/weather-data.model';
import { TemperatureUnit, AltitudeUnit, NetworkPowerLabels } from '../models/weather.enums';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  [x: string]: any;
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly storage = inject(StorageService);
  private readonly MAX_REQUESTS = API_CONFIG.MAX_REQUESTS;

  private useRemoteApi = true; // controla se HTTP é usado
  private requestCount = 0;
  private isOfflineMode = false;

  private altitudeUnit = AltitudeUnit.METERS; 
  private temperatureUnit = TemperatureUnit.CELSIUS; 
  private networkPowerLabels = NetworkPowerLabels; 

  constructor() {
    // Detecta variável de ambiente Docker
    this.useRemoteApi = (window as any)['USE_REMOTE_API'] !== 'false';
    console.log('USE_REMOTE_API =', this.useRemoteApi);

    // Carrega estado do localStorage
    this.requestCount = this.storage.getItem<number>('api_request_count') || 0;
    this.isOfflineMode = this.storage.getItem<boolean>('offline_mode') || false;

    console.log(`🔄 Request count loaded: ${this.requestCount}/${this.MAX_REQUESTS}`);
    if (this.isOfflineMode) {
      console.log('🔌 Offline mode enabled - Using local storage fallback');
    }
  }

  // GET request com fallback local
  get<T>(endpoint: string, useCache = false): Observable<T> {
    console.log(`API GET: ${endpoint}`);

    // Para weather-data, sempre retornar dados combinados (local + remoto)
    if (endpoint.includes('weatherData') || endpoint.includes('weather-data')) {
      return this.getCombinedWeatherData() as Observable<T>;
    }

    // Se não usar remote API ou offline, retorna local imediatamente
    if (!this.useRemoteApi || this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
      return this.getFromLocalStorage<T>(endpoint);
    }

    return this.http.get<T>(endpoint).pipe(
      tap(() => this.incrementRequestCount()),
      catchError(error => this.handleError<T>(error, endpoint))
    );
  }

  private getCombinedWeatherData(): Observable<WeatherData[]> {
    const localData = this.storage.getItem<WeatherData[]>('local_weatherData') || [];
    
    if (!this.useRemoteApi || this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
      console.log('🔌 Using only local data');
      return of(localData).pipe(delay(200));
    }

    return this.http.get<WeatherData[]>(API_ENDPOINTS.WEATHER_DATA).pipe(
      map(remoteData => {
        const combined = [...(remoteData || []), ...localData];
        return combined;
      }),
      tap(() => this.incrementRequestCount()),
      catchError(() => {
        console.log('❌ Remote API failed, using local only');
        return of(localData);
      })
    );
  }

  // POST request com fallback local
  post<T>(endpoint: string, data: any): Observable<T> {
    if (!this.useRemoteApi || this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
      return this.postToLocalStorage<T>(endpoint, data);
    }

    return this.http.post<T>(endpoint, data).pipe(
      tap((response) => {
        this.invalidateRelatedCache(endpoint);
        this.putToLocalStorage(endpoint, response);
        this.incrementRequestCount();
      }),
      catchError(error => this.handlePostError<T>(error, endpoint, data))
    );
  }

  // PUT request com fallback local
  // put<T>(endpoint: string, data: any): Observable<T> {
  //   if (!this.useRemoteApi || this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
  //     return this.putToLocalStorage<T>(endpoint, data);
  //   }

  //   return this.http.put<T>(endpoint, data).pipe(
  //     tap((response) => {
  //       this.invalidateRelatedCache(endpoint);
  //       this.updateInLocalStorage(endpoint, response);
  //       this.incrementRequestCount();
  //     }),
  //     catchError(error => this.handlePutError<T>(error, endpoint, data))
  //   );
  // }

  // DELETE request com fallback local
  // delete<T>(endpoint: string): Observable<T> {
  //   if (!this.useRemoteApi || this.isOfflineMode || this.requestCount >= this.MAX_REQUESTS) {
  //     return this.deleteFromLocalStorage<T>(endpoint);
  //   }

  //   return this.http.delete<T>(endpoint).pipe(
  //     tap(() => {
  //       this.invalidateRelatedCache(endpoint);
  //       this.removeFromLocalStorage(endpoint);
  //       this.incrementRequestCount();
  //     }),
  //     catchError(error => this.handleDeleteError<T>(error, endpoint))
  //   );
  // }

  // -------------------
  // Métodos para localStorage (mantidos igual)
  // -------------------
  private getFromLocalStorage<T>(endpoint: string): Observable<T> {
    const localKey = this.getLocalStorageKey(endpoint);
    const localData = this.storage.getItem<T>(localKey);
    return localData ? of(localData).pipe(delay(200)) : this.getMockData<T>(endpoint);
  }

  private postToLocalStorage<T>(endpoint: string, data: any): Observable<T> { /* igual ao anterior */ 
    const existingData = this.storage.getItem<WeatherData[]>('local_weatherData') || [];
    const newItem = { ...data, id: this.generateLocalId(), createdAt: new Date(), updatedAt: new Date(), _isLocal: true };
    this.storage.setItem('local_weatherData', [...existingData, newItem]);
    this.invalidateRelatedCache(endpoint);
    return of(newItem as T).pipe(delay(100));
  }

  private putToLocalStorage<T>(endpoint: string, data: any): Observable<T> { /* igual ao anterior */ 
    const localKey = this.getLocalStorageKey(endpoint);
    const existingData = this.storage.getItem<any[]>(localKey) || [];
    const id = this.extractIdFromEndpoint(endpoint);
    const updatedData = existingData.map(item => item.id === id ? { ...item, ...data, updatedAt: new Date(), _isLocal: true } : item);
    this.storage.setItem(localKey, updatedData);
    return of(updatedData.find(item => item.id === id) as T).pipe(delay(200));
  }

  private deleteFromLocalStorage<T>(endpoint: string): Observable<T> { /* igual ao anterior */ 
    const localKey = this.getLocalStorageKey(endpoint);
    const existingData = this.storage.getItem<any[]>(localKey) || [];
    const id = this.extractIdFromEndpoint(endpoint);
    const filtered = existingData.filter(item => item.id !== id);
    this.storage.setItem(localKey, filtered);
    return of({} as T).pipe(delay(200));
  }

  // -------------------
  // Helpers e utilitários
  // -------------------
  private getLocalStorageKey(endpoint: string): string {
    return endpoint.includes('weatherData') ? 'local_weatherData' : 'local_cities';
  }

  private extractIdFromEndpoint(endpoint: string): string {
    const parts = endpoint.split('/');
    return parts[parts.length - 1];
  }

  private generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementRequestCount(): void {
    this.requestCount++;
    this.storage.setItem('api_request_count', this.requestCount);
  }

  private invalidateRelatedCache(endpoint: string): void {
    if (endpoint.includes('weatherData') || endpoint === 'weather-data') {
      this.cache.delete('GET_weather-data');
      this.cache.delete(`GET_${API_ENDPOINTS.WEATHER_DATA}`);
    }
  }

  private getMockData<T>(endpoint: string): Observable<T> {
    if (endpoint.includes('weatherData')) {
      const mockWeatherData: WeatherData[] = [
        { id: 'mock_1', city: 'Porto', temperature: 18, temperatureUnit: this.temperatureUnit, isRaining: false, date: new Date(), networkPower: 1, altitude: 95, altitudeUnit: this.altitudeUnit, createdAt: new Date(), updatedAt: new Date() },
        { id: 'mock_2', city: 'Lisboa', temperature: 22, temperatureUnit: this.temperatureUnit, isRaining: true, date: new Date(), networkPower: 3, altitude: 111, altitudeUnit: this.altitudeUnit, createdAt: new Date(), updatedAt: new Date() }
      ];
      this.storage.setItem('local_weatherData', mockWeatherData);
      return of(mockWeatherData as T).pipe(delay(300));
    }
    return of([] as any).pipe(delay(200));
  }

  // -------------------
  // Error handlers
  // -------------------
  private handleError<T>(error: any, endpoint: string): Observable<T> {
    console.error('🚨 API Error:', error);
    this.enableOfflineMode();
    return this.getFromLocalStorage<T>(endpoint);
  }

  private handlePostError<T>(error: any, endpoint: string, data: any): Observable<T> {
    this.enableOfflineMode();
    return this.postToLocalStorage<T>(endpoint, data);
  }

  private handlePutError<T>(error: any, endpoint: string, data: any): Observable<T> {
    this.enableOfflineMode();
    return this.putToLocalStorage<T>(endpoint, data);
  }

  private handleDeleteError<T>(error: any, endpoint: string): Observable<T> {
    this.enableOfflineMode();
    return this.deleteFromLocalStorage<T>(endpoint);
  }

  // -------------------
  // Offline / online mode
  // -------------------
  private enableOfflineMode(): void {
    this.isOfflineMode = true;
    this.storage.setItem('offline_mode', true);
  }

  enableOnlineMode(): void {
    this.isOfflineMode = false;
    this.storage.setItem('offline_mode', false);
  }

  getApiStats() {
    return {
      requestCount: this.requestCount,
      remainingRequests: this.MAX_REQUESTS - this.requestCount,
      isOfflineMode: this.isOfflineMode,
      cacheStats: this.cache.getStats()
    };
  }

  resetRequestCount(): void {
    this.requestCount = 0;
    this.storage.setItem('api_request_count', 0);
  }

  clearLocalData(): void {
    this.storage.removeItem('local_weatherData');
    this.storage.removeItem('local_cities');
  }
}
