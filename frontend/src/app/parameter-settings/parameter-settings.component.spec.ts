import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterSettingsComponent } from './parameter-settings.component';

describe('ParameterSettingsComponent', () => {
  let component: ParameterSettingsComponent;
  let fixture: ComponentFixture<ParameterSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParameterSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParameterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
