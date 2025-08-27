import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StorageService {


  private isStorageAvailable(): boolean {
    try {
      return typeof Storage !== 'undefined' && localStorage !== null;
    } catch {
      return false;
    }
  }


  setItem<T>(key: string, value: T): void {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage não está disponível');
      return;
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Erro ao guardar no localStorage:', error);
    }
  }


  getItem<T>(key: string): T | null {
    if (!this.isStorageAvailable()) {
      console.warn('localStorage não está disponível');
      return null;
    }
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return null;
    }
  }


  removeItem(key: string): void {
    if (!this.isStorageAvailable()) {
      return;
    }
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  }


  clear(): void {
    if (!this.isStorageAvailable()) {
      return;
    }
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error);
    }
  }


  hasItem(key: string): boolean {
    if (!this.isStorageAvailable()) {
      return false;
    }
    
    return localStorage.getItem(key) !== null;
  }
}