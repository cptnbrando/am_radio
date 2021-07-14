import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizerSettingsComponent } from './visualizer-settings.component';

describe('VisualizerSettingsComponent', () => {
  let component: VisualizerSettingsComponent;
  let fixture: ComponentFixture<VisualizerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizerSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
