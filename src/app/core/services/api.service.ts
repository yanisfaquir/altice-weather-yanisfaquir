import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { CacheService } from './cache.service';
import { StorageService } from './storage.service';
import { API_CONFIG } from '../constants/api.constants'

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly storage = inject(StorageService);
  private readonly MAX_REQUESTS = API_CONFIG.MAX_REQUESTS;
  
  private requestCount = 0;

  constructor() {
    // Carrega contador de requests do localStorage
    this.requestCount = this.storage.getItem<number>('api_request_count') || 0;
    console.log(`Request count loaded: ${this.requestCount}/${this.MAX_REQUESTS}`);
  }


    // GET request com cache

  get<T>(endpoint: string, useCache = true): Observable<T> {
    const cacheKey = `GET_${endpoint}`;
    
    // Verificar cache primeiro
    if (useCache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Verificar limite de requests
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.error('API request limit reached!');
      return throwError(() => new Error('API request limit reached'));
    }
    
    return this.http.get<T>(endpoint).pipe(
      tap(data => {
        // Guardar no cache
        this.cache.set(cacheKey, data);
        // Incrementar contador
        this.incrementRequestCount();
      }),
      catchError(error => this.handleError(error))
    );
  }

 
//    POST request

  post<T>(endpoint: string, data: any): Observable<T> {
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.error('API request limit reached!');
      return throwError(() => new Error('API request limit reached'));
    }
    
    return this.http.post<T>(endpoint, data).pipe(
      tap(() => {
        // Invalidar cache relacionado
        this.invalidateRelatedCache(endpoint);
        this.incrementRequestCount();
      }),
      catchError(error => this.handleError(error))
    );
  }

  
    // PUT request
   
  put<T>(endpoint: string, data: any): Observable<T> {
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.error(' API request limit reached!');
      return throwError(() => new Error('API request limit reached'));
    }
    
    return this.http.put<T>(endpoint, data).pipe(
      tap(() => {
        this.invalidateRelatedCache(endpoint);
        this.incrementRequestCount();
      }),
      catchError(error => this.handleError(error))
    );
  }

  
    // DELETE request
  
  delete<T>(endpoint: string): Observable<T> {
    if (this.requestCount >= this.MAX_REQUESTS) {
      console.error('API request limit reached!');
      return throwError(() => new Error('API request limit reached'));
    }
    
    return this.http.delete<T>(endpoint).pipe(
      tap(() => {
        this.invalidateRelatedCache(endpoint);
        this.incrementRequestCount();
      }),
      catchError(error => this.handleError(error))
    );
  }

 
//    Obter estatísticas da API
   
  getApiStats() {
    return {
      requestCount: this.requestCount,
      remainingRequests: this.MAX_REQUESTS - this.requestCount,
      cacheStats: this.cache.getStats()
    };
  }

  
//    Resetar contador (para testing)
   
  resetRequestCount(): void {
    this.requestCount = 0;
    this.storage.setItem('api_request_count', 0);
    console.log('Request count reset');
  }

 

  private incrementRequestCount(): void {
    this.requestCount++;
    this.storage.setItem('api_request_count', this.requestCount);
    console.log(`Requests: ${this.requestCount}/${this.MAX_REQUESTS}`);
    
    // Aviso quando próximo do limite
    if (this.requestCount >= this.MAX_REQUESTS * 0.8) {
      console.warn(`Approaching API limit: ${this.requestCount}/${this.MAX_REQUESTS}`);
    }
  }

  private invalidateRelatedCache(endpoint: string): void {
    // Limpar cache relacionado quando dados são modificados
    const cacheStats = this.cache.getStats();
    cacheStats.keys.forEach(key => {
      if (key.includes('GET_') && key.includes('weatherData')) {
        this.cache.delete(key);
      }
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    let userMessage = 'Erro inesperado';
    if (error.status === 0) {
      userMessage = 'Erro de rede. Verifique a sua conexão.';
    } else if (error.status >= 400 && error.status < 500) {
      userMessage = 'Erro na requisição. Verifique os dados.';
    } else if (error.status >= 500) {
      userMessage = 'Erro no servidor. Tente novamente.';
    }
    
    return throwError(() => ({ ...error, userMessage }));
  }
}