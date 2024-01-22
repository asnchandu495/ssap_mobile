import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WorkLocationPage } from './work-location.page';

describe('WorkLocationPage', () => {
  let component: WorkLocationPage;
  let fixture: ComponentFixture<WorkLocationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkLocationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkLocationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
