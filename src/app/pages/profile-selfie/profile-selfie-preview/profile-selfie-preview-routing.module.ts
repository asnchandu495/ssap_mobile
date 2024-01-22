import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileSelfiePreviewPage } from './profile-selfie-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileSelfiePreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileSelfiePreviewPageRoutingModule {}
