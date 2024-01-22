import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileSelfiePageRoutingModule } from './profile-selfie-routing.module';

import { ProfileSelfiePage } from './profile-selfie.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileSelfiePageRoutingModule
  ],
  declarations: [ProfileSelfiePage]
})
export class ProfileSelfiePageModule {}
