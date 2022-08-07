import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolizaDialogComponent } from './poliza-dialog.component';

describe('PolizaDialogComponent', () => {
  let component: PolizaDialogComponent;
  let fixture: ComponentFixture<PolizaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PolizaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PolizaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
