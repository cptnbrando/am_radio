import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationBarComponent } from './station-bar.component';

describe('StationBarComponent', () => {
  let component: StationBarComponent;
  let fixture: ComponentFixture<StationBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StationBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
