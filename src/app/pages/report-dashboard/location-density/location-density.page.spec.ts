import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LocationDensityPage } from './location-density.page';

describe('LocationDensityPage', () => {
  let component: LocationDensityPage;
  let fixture: ComponentFixture<LocationDensityPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationDensityPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationDensityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
