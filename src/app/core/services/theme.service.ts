// src/app/core/services/theme.service.ts (Fixed)
import { Injectable, signal, computed, effect } from '@angular/core';
import { StorageService } from './storage.service';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storageService = new StorageService();
  private readonly THEME_STORAGE_KEY = 'altice_theme';

  // Signal for reactive theme management
  private themeSignal = signal<Theme>(this.getInitialTheme());
  
  // Public readonly theme signal
  readonly currentTheme = this.themeSignal.asReadonly();
  
  // Computed actual theme (resolves 'auto' to actual theme)
  readonly actualTheme = computed(() => {
    const theme = this.currentTheme();
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  });

  constructor() {
    // Effect to apply theme changes to DOM
    effect(() => {
      this.applyTheme(this.actualTheme());
      this.saveTheme(this.currentTheme());
    });

    // Listen for system theme changes when in auto mode
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentTheme() === 'auto') {
          // Theme will update automatically through the computed signal
        }
      });
    }
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  toggleTheme(): void {
    const current = this.currentTheme();
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }

  private getInitialTheme(): Theme {
    // Try to load from storage
    const stored = this.storageService.getItem<Theme>(this.THEME_STORAGE_KEY);
    if (stored && this.isValidTheme(stored)) {
      return stored;
    }
    
    // Default to auto
    return 'auto';
  }

  private saveTheme(theme: Theme): void {
    this.storageService.setItem(this.THEME_STORAGE_KEY, theme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(theme);
    
    // Update meta theme-color
    this.updateMetaThemeColor(theme);
  }

  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1f2937' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  private isValidTheme(theme: any): theme is Theme {
    return ['light', 'dark', 'auto'].includes(theme);
  }

  // Helper methods for components
  isDark(): boolean {
    return this.actualTheme() === 'dark';
  }

  isLight(): boolean {
    return this.actualTheme() === 'light';
  }

  isAuto(): boolean {
    return this.currentTheme() === 'auto';
  }
}