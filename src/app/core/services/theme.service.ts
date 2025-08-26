import { Injectable, inject, Renderer2, RendererFactory2, signal, computed, effect } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';

import { StorageService } from './storage.service';

/**
 * Theme Configuration Interface
 */
export interface ThemeConfig {
  name: string;
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  isDark: boolean;
}

/**
 * Available Themes
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

/**
 * Theme Preference Storage Key
 */
const THEME_STORAGE_KEY = 'altice-weather-theme';

/**
 * Theme Service
 * 
 * Advanced theme management service with support for:
 * - Light/Dark theme switching
 * - Auto theme based on system preference
 * - Smooth theme transitions
 * - Custom theme configurations
 * - Theme persistence
 * - System preference monitoring
 * 
 * Uses Angular 18+ Signals for reactive theme state management
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storage = inject(StorageService);
  private readonly rendererFactory = inject(RendererFactory2);
  private readonly renderer = this.rendererFactory.createRenderer(null, null);

  // Signals for reactive theme state
  private readonly _currentTheme = signal<Theme>(Theme.AUTO);
  private readonly _isDarkMode = signal<boolean>(false);
  private readonly _systemPrefersDark = signal<boolean>(false);

  // Computed signals
  public readonly currentTheme = this._currentTheme.asReadonly();
  public readonly isDarkMode = computed(() => {
    const theme = this._currentTheme();
    if (theme === Theme.AUTO) {
      return this._systemPrefersDark();
    }
    return theme === Theme.DARK;
  });

  // Observables for compatibility with RxJS patterns
  private readonly themeSubject = new BehaviorSubject<Theme>(Theme.AUTO);
  public readonly theme$ = this.themeSubject.asObservable();

  // Theme configurations
  private readonly themeConfigs: Record<string, ThemeConfig> = {
    light: {
      name: 'light',
      displayName: 'Light',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      isDark: false
    },
    dark: {
      name: 'dark',
      displayName: 'Dark',
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      isDark: true
    }
  };

  constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
    this.setupThemeEffect();
  }

  /**
   * Initialize theme from storage or system preference
   */
  private initializeTheme(): void {
    // Check for saved theme preference
    const savedTheme = this.storage.getItem<Theme>(THEME_STORAGE_KEY);
    
    // Detect system theme preference
    this.updateSystemPreference();
    
    // Set initial theme
    const initialTheme = savedTheme || Theme.AUTO;
    this.setTheme(initialTheme);
  }

  /**
   * Set theme preference
   */
  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    this.themeSubject.next(theme);
    
    // Persist theme preference
    this.storage.setItem(THEME_STORAGE_KEY, theme);
    
    console.log(`🎨 Theme changed to: ${theme}`);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this._currentTheme();
    const effectiveTheme = this.getEffectiveTheme();
    
    if (currentTheme === Theme.AUTO) {
      // If auto, switch to opposite of current effective theme
      this.setTheme(effectiveTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
    } else {
      // Toggle between light and dark
      this.setTheme(currentTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    }
  }

  /**
   * Set to auto theme (follow system preference)
   */
  setAutoTheme(): void {
    this.setTheme(Theme.AUTO);
  }

  /**
   * Get current effective theme (resolves AUTO to actual theme)
   */
  getEffectiveTheme(): Theme {
    const theme = this._currentTheme();
    if (theme === Theme.AUTO) {
      return this._systemPrefersDark() ? Theme.DARK : Theme.LIGHT;
    }
    return theme;
  }

  /**
   * Get theme configuration
   */
  getThemeConfig(theme?: Theme): ThemeConfig {
    const effectiveTheme = theme || this.getEffectiveTheme();
    return this.themeConfigs[effectiveTheme] || this.themeConfigs['light'];
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Array<{ value: Theme; label: string; icon: string }> {
    return [
      { value: Theme.LIGHT, label: 'Light', icon: '☀️' },
      { value: Theme.DARK, label: 'Dark', icon: '🌙' },
      { value: Theme.AUTO, label: 'Auto', icon: '⚡' }
    ];
  }

  /**
   * Check if current theme is dark
   */
  isCurrentThemeDark(): boolean {
    return this.isDarkMode();
  }

  /**
   * Get CSS custom properties for current theme
   */
  getCssProperties(): Record<string, string> {
    const config = this.getThemeConfig();
    
    return {
      '--theme-primary': config.primary,
      '--theme-secondary': config.secondary,
      '--theme-accent': config.accent,
      '--theme-background': config.background,
      '--theme-surface': config.surface,
      '--theme-text': config.text,
    };
  }

  /**
   * Apply theme transition animation
   */
  private applyThemeTransition(): void {
    const duration = '300ms';
    const easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)';
    
    // Add transition class
    this.renderer.addClass(this.document.documentElement, 'theme-transitioning');
    
    // Apply transition styles
    const style = `
      * {
        transition: background-color ${duration} ${easing},
                    color ${duration} ${easing},
                    border-color ${duration} ${easing},
                    box-shadow ${duration} ${easing} !important;
      }
    `;
    
    const styleElement = this.renderer.createElement('style');
    this.renderer.appendChild(styleElement, this.renderer.createText(style));
    this.renderer.appendChild(this.document.head, styleElement);
    
    // Remove transition after animation
    setTimeout(() => {
      this.renderer.removeChild(this.document.head, styleElement);
      this.renderer.removeClass(this.document.documentElement, 'theme-transitioning');
    }, parseInt(duration));
  }

  /**
   * Setup system theme preference listener
   */
  private setupSystemThemeListener(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listen for changes
      fromEvent(mediaQuery, 'change').pipe(
        map((event: any) => event.matches)
      ).subscribe(prefersDark => {
        this._systemPrefersDark.set(prefersDark);
        console.log(`🎨 System theme preference changed: ${prefersDark ? 'dark' : 'light'}`);
      });
    }
  }

  /**
   * Update system preference
   */
  private updateSystemPreference(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._systemPrefersDark.set(prefersDark);
    }
  }

  /**
   * Setup theme effect to apply changes
   */
  private setupThemeEffect(): void {
    effect(() => {
      const isDark = this.isDarkMode();
      this.applyTheme(isDark);
    });
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(isDark: boolean): void {
    const htmlElement = this.document.documentElement;
    
    // Apply smooth transition
    this.applyThemeTransition();
    
    // Toggle dark class
    if (isDark) {
      this.renderer.addClass(htmlElement, 'dark');
      this.renderer.removeClass(htmlElement, 'light');
    } else {
      this.renderer.addClass(htmlElement, 'light');
      this.renderer.removeClass(htmlElement, 'dark');
    }
    
    // Apply CSS custom properties
    const cssProperties = this.getCssProperties();
    Object.entries(cssProperties).forEach(([property, value]) => {
      this.renderer.setStyle(htmlElement, property, value);
    });
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(isDark);
    
    console.log(`🎨 Applied ${isDark ? 'dark' : 'light'} theme to DOM`);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(isDark: boolean): void {
    const config = this.getThemeConfig();
    let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = this.renderer.createElement('meta');
      this.renderer.setAttribute(metaThemeColor, 'name', 'theme-color');
      this.renderer.appendChild(this.document.head, metaThemeColor);
    }
    
    this.renderer.setAttribute(metaThemeColor, 'content', config.background);
  }

  /**
   * Preload theme assets (for better performance)
   */
  preloadThemeAssets(): void {
    // Preload theme-specific images or assets
    const themes = ['light', 'dark'];
    
    themes.forEach(theme => {
      // Example: preload theme-specific background images
      const link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', 'preload');
      this.renderer.setAttribute(link, 'as', 'image');
      this.renderer.setAttribute(link, 'href', `/assets/images/backgrounds/${theme}-bg.webp`);
      this.renderer.appendChild(this.document.head, link);
    });
  }

  /**
   * Get theme statistics (for debugging)
   */
  getThemeStats(): {
    currentTheme: Theme;
    effectiveTheme: Theme;
    isDarkMode: boolean;
    systemPrefersDark: boolean;
    cssPropertiesCount: number;
  } {
    return {
      currentTheme: this._currentTheme(),
      effectiveTheme: this.getEffectiveTheme(),
      isDarkMode: this.isDarkMode(),
      systemPrefersDark: this._systemPrefersDark(),
      cssPropertiesCount: Object.keys(this.getCssProperties()).length
    };
  }
}