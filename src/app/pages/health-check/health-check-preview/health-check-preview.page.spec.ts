import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HealthCheckPreviewPage } from './health-check-preview.page';

describe('HealthCheckPreviewPage', () => {
  let component: HealthCheckPreviewPage;
  let fixture: ComponentFixture<HealthCheckPreviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthCheckPreviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthCheckPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
