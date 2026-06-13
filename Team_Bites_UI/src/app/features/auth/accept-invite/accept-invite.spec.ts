import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptInvite } from './accept-invite';

describe('AcceptInvite', () => {
  let component: AcceptInvite;
  let fixture: ComponentFixture<AcceptInvite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcceptInvite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptInvite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
