import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileSelfiePreviewPage } from './profile-selfie-preview.page';

describe('ProfileSelfiePreviewPage', () => {
  let component: ProfileSelfiePreviewPage;
  let fixture: ComponentFixture<ProfileSelfiePreviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileSelfiePreviewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSelfiePreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
