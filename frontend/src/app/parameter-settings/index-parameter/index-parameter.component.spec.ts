import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexParameterComponent } from './index-parameter.component';

describe('IndexParameterComponent', () => {
  let component: IndexParameterComponent;
  let fixture: ComponentFixture<IndexParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexParameterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
