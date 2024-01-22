import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileSelfiePage } from './profile-selfie.page';

describe('ProfileSelfiePage', () => {
  let component: ProfileSelfiePage;
  let fixture: ComponentFixture<ProfileSelfiePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileSelfiePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSelfiePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
