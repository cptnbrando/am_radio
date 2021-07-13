import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeekerComponent } from './seeker.component';

describe('SeekerComponent', () => {
  let component: SeekerComponent;
  let fixture: ComponentFixture<SeekerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeekerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeekerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
