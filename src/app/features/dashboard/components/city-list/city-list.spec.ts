import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CityList } from './city-list';

describe('CityList', () => {
  let component: CityList;
  let fixture: ComponentFixture<CityList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityList, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(CityList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with loading state', () => {
    expect(component.isLoading()).toBe(true);
  });

  it('should have refresh method', () => {
    expect(component.refreshData).toBeDefined();
  });

  it('should format dates correctly', () => {
    const testDate = new Date('2024-01-15T10:30:00');
    const formatted = component.formatDate(testDate);
    expect(formatted).toContain('15/01/2024');
  });
});