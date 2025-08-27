import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWelcomeCard } from './dashboard-welcome-card';

describe('DashboardWelcomeCard', () => {
  let component: DashboardWelcomeCard;
  let fixture: ComponentFixture<DashboardWelcomeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardWelcomeCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardWelcomeCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
