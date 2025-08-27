import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milliseconds
}


@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTtl = 300000; // 5 minutos


  get<T>(key: string): Observable<T> | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      console.log(` Cache expirado: ${key}`);
      return null;
    }
    
    console.log(` Cache hit: ${key}`);
    return of(item.data);
  }


//   Guardar dados no cache
 
  set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, item);
    console.log(`💾 Cached: ${key} (TTL: ${ttl}ms)`);
  }


    // Verificar se existe no cache e não expirou
  
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }


    // Remover item do cache
   
  delete(key: string): void {
    this.cache.delete(key);
    console.log(` Removed from cache: ${key}`);
  }

  
    // Limpar todo o cache
  
  clear(): void {
    this.cache.clear();
    console.log(' Cache cleared');
  }

  
    // Obter estatísticas do cache
   
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}