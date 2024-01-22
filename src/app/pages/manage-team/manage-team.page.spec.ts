import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ManageTeamPage } from './manage-team.page';

describe('ManageTeamPage', () => {
  let component: ManageTeamPage;
  let fixture: ComponentFixture<ManageTeamPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTeamPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageTeamPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
