import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManageWfhlPage } from './manage-wfhl.page';

describe('ManageWfhlPage', () => {
  let component: ManageWfhlPage;
  let fixture: ComponentFixture<ManageWfhlPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageWfhlPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageWfhlPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
