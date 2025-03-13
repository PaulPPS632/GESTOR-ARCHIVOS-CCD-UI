import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatefolderComponent } from './createfolder.component';

describe('CreatefolderComponent', () => {
  let component: CreatefolderComponent;
  let fixture: ComponentFixture<CreatefolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatefolderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatefolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
