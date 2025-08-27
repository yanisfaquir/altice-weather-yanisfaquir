import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { AVAILABLE_TIMEZONES } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  private currentTimezoneSubject = new BehaviorSubject<string>('Europe/Lisbon');
  
  // Signals for reactive approach
  public readonly currentTimezone = signal<string>('Europe/Lisbon');
  public readonly timezoneInfo = computed(() => {
    const timezone = this.currentTimezone();
    const now = new Date();
    
    return {
      timezone,
      offset: this.getTimezoneOffset(timezone),
      offsetString: this.getOffsetString(timezone),
      displayName: this.getTimezoneDisplayName(timezone)
    };
  });

  // Observable for components that prefer RxJS
  public readonly currentTimezone$ = this.currentTimezoneSubject.asObservable();

  constructor() {
    // Initialize with browser timezone or default
    const browserTimezone = this.getBrowserTimezone();
    this.setTimezone(browserTimezone);

    // Effect to update timezone info when signal changes
    effect(() => {
      console.log('Timezone changed to:', this.currentTimezone());
    });
  }

  setTimezone(timezone: string): void {
    if (this.isTimezoneValid(timezone)) {
      this.currentTimezone.set(timezone);
      this.currentTimezoneSubject.next(timezone);
    }
  }

  // Format date in current timezone
  formatDate(
    date: Date, 
    formatPattern: string = 'yyyy-MM-dd HH:mm:ss',
    timezone?: string
  ): string {
    const tz = timezone || this.currentTimezone();
    return formatInTimeZone(date, tz, formatPattern);
  }

  // Format date with locale consideration
  formatDateLocalized(
    date: Date,
    locale: string = 'pt-PT',
    options?: Intl.DateTimeFormatOptions,
    timezone?: string
  ): string {
    const tz = timezone || this.currentTimezone();
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz,
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  }

  // Convert UTC date to current timezone
  toCurrentTimezone(utcDate: Date): Date {
    return toZonedTime(utcDate, this.currentTimezone());
  }

  // Convert current timezone date to UTC
  toUtc(localDate: Date): Date {
    return fromZonedTime(localDate, this.currentTimezone());
  }

  // Get current time in selected timezone
  getCurrentTime(): Date {
    return this.toCurrentTimezone(new Date());
  }

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: Date, locale: string = 'pt-PT'): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (Math.abs(diffInSeconds) < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (Math.abs(diffInSeconds) < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  // Get timezone offset in minutes
  getTimezoneOffset(timezone?: string): number {
    const tz = timezone || this.currentTimezone();
    
    try {
      const now = new Date();
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const targetTime = new Intl.DateTimeFormat('sv-SE', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date(utcTime));
      
      const targetDate = new Date(targetTime);
      const utcDate = new Date(utcTime);
      
      return Math.round((targetDate.getTime() - utcDate.getTime()) / 60000);
    } catch {
      return 0;
    }
  }

  // Get timezone offset as string (e.g., "+01:00")
  getOffsetString(timezone?: string): string {
    const offset = this.getTimezoneOffset(timezone);
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Get human-readable timezone name
  getTimezoneDisplayName(timezone?: string): string {
    const tz = timezone || this.currentTimezone();
    
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'long'
      });
      
      const parts = formatter.formatToParts(new Date());
      const timeZoneName = parts.find(part => part.type === 'timeZoneName');
      
      return timeZoneName?.value || tz;
    } catch {
      return tz;
    }
  }

  // Get available timezones
  getAvailableTimezones() {
    return AVAILABLE_TIMEZONES;
  }

  // Validate if timezone is supported
  isTimezoneValid(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  // Get browser's timezone
  private getBrowserTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon';
    } catch {
      return 'Europe/Lisbon';
    }
  }

  // Format business hours according to timezone
  formatBusinessHours(
    openTime: string, 
    closeTime: string, 
    locale: string = 'pt-PT'
  ): string {
    const today = new Date();
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);
    
    const openDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), openHour, openMinute);
    const closeDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), closeHour, closeMinute);
    
    const openTimeFormatted = this.formatDateLocalized(openDate, locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const closeTimeFormatted = this.formatDateLocalized(closeDate, locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${openTimeFormatted} - ${closeTimeFormatted}`;
  }
}