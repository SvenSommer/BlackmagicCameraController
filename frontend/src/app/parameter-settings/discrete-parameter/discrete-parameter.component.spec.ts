import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscreteParameterComponent } from './discrete-parameter.component';

describe('DiscreteParameterComponent', () => {
  let component: DiscreteParameterComponent;
  let fixture: ComponentFixture<DiscreteParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscreteParameterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscreteParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
