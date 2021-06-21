import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistBarComponent } from './playlist-bar.component';

describe('PlaylistBarComponent', () => {
  let component: PlaylistBarComponent;
  let fixture: ComponentFixture<PlaylistBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
