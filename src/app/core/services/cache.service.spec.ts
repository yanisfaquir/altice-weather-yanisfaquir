import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and get data', () => {
    const testData = { message: 'Hello World' };
    
    service.set('test-key', testData);
    const result = service.get('test-key');
    
    expect(result).toBeTruthy();
  });

  it('should return null for missing key', () => {
    const result = service.get('missing-key');
    expect(result).toBeNull();
  });

  it('should clear all data', () => {
    service.set('key1', 'data1');
    service.set('key2', 'data2');
    
    service.clear();
    
    const stats = service.getStats();
    expect(stats.size).toBe(0);
  });
});