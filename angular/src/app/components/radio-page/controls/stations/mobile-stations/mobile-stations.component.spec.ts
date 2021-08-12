import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileStationsComponent } from './mobile-stations.component';

describe('MobileStationsComponent', () => {
  let component: MobileStationsComponent;
  let fixture: ComponentFixture<MobileStationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobileStationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileStationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
