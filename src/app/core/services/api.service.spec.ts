import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a GET request', () => {
    const testUrl = 'https://test.com/api/data';
    const testData = [{ id: 1, name: 'test' }];

    service.get(testUrl).subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });

  it('should track request count', () => {
    const stats = service.getApiStats();
    expect(stats.requestCount).toBeGreaterThanOrEqual(0);
    expect(stats.remainingRequests).toBeLessThanOrEqual(100);
  });


});