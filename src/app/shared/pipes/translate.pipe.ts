import { Pipe, PipeTransform, inject, signal, computed } from '@angular/core';
import { I18nService, TranslationKeys } from '../../core/services/i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to react to language changes
})
export class TranslatePipe implements PipeTransform {
  private i18nService = inject(I18nService);
  
  // Cache for computed translations to avoid recreation
  private translationCache = new Map<string, any>();

  transform(key: keyof TranslationKeys, params?: Record<string, string>): string {
    const cacheKey = `${key}-${JSON.stringify(params || {})}`;
    
    if (!this.translationCache.has(cacheKey)) {
      const translationSignal = computed(() => {
        return this.i18nService.translate(key, params);
      });
      this.translationCache.set(cacheKey, translationSignal);
    }
    
    return this.translationCache.get(cacheKey)();
  }
}

// Additional pipes for common formatting needs

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private i18nService = inject(I18nService);

  transform(
    date: Date | string | number, 
    options?: Intl.DateTimeFormatOptions
  ): string {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';

    return this.i18nService.formatDate(dateObj, options);
  }
}

@Pipe({
  name: 'localizedNumber',
  standalone: true,
  pure: false
})
export class LocalizedNumberPipe implements PipeTransform {
  private i18nService = inject(I18nService);

  transform(
    value: number | string, 
    options?: Intl.NumberFormatOptions
  ): string {
    if (value === null || value === undefined) return '';
    
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numberValue)) return value.toString();

    return this.i18nService.formatNumber(numberValue, options);
  }
}

@Pipe({
  name: 'temperature',
  standalone: true,
  pure: false
})
export class TemperaturePipe implements PipeTransform {
  transform(
    value: number, 
    unit: 'celsius' | 'fahrenheit' = 'celsius',
    displayUnit?: 'celsius' | 'fahrenheit'
  ): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    let convertedValue = value;
    
    // Convert if needed
    if (unit === 'celsius' && displayUnit === 'fahrenheit') {
      convertedValue = (value * 9/5) + 32;
    } else if (unit === 'fahrenheit' && displayUnit === 'celsius') {
      convertedValue = (value - 32) * 5/9;
    }
    
    const unitSymbol = (displayUnit || unit) === 'celsius' ? '°C' : '°F';
    const roundedValue = Math.round(convertedValue * 10) / 10;
    
    return `${roundedValue}${unitSymbol}`;
  }
}

@Pipe({
  name: 'altitude',
  standalone: true,
  pure: false
})
export class AltitudePipe implements PipeTransform {
  private i18nService = inject(I18nService);

  transform(
    value: number, 
    unit: 'meters' | 'feet' = 'meters',
    displayUnit?: 'meters' | 'feet'
  ): string {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    let convertedValue = value;
    
    // Convert if needed
    if (unit === 'meters' && displayUnit === 'feet') {
      convertedValue = value * 3.28084;
    } else if (unit === 'feet' && displayUnit === 'meters') {
      convertedValue = value / 3.28084;
    }
    
    const unitKey = (displayUnit || unit) === 'meters' ? 'units.meters' : 'units.feet';
    const unitText = this.i18nService.translate(unitKey as keyof TranslationKeys);
    const roundedValue = Math.round(convertedValue);
    
    return `${roundedValue} ${unitText}`;
  }
}