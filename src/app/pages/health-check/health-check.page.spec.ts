import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthCheckPage } from './health-check.page';

describe('HealthCheckPage', () => {
  let component: HealthCheckPage;
  let fixture: ComponentFixture<HealthCheckPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthCheckPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
