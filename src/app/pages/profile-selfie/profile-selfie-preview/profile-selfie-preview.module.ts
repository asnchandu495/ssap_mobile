import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileSelfiePreviewPageRoutingModule } from './profile-selfie-preview-routing.module';

import { ProfileSelfiePreviewPage } from './profile-selfie-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileSelfiePreviewPageRoutingModule
  ],
  declarations: [ProfileSelfiePreviewPage]
})
export class ProfileSelfiePreviewPageModule {}
