import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FragmentOverviewComponent } from './fragment-overview.component';

describe('FragmentOverviewComponent', () => {
  let component: FragmentOverviewComponent;
  let fixture: ComponentFixture<FragmentOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FragmentOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FragmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
