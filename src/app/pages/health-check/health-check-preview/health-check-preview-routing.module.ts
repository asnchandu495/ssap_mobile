import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HealthCheckPreviewPage } from './health-check-preview.page';

const routes: Routes = [
  {
    path: '',
    component: HealthCheckPreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthCheckPreviewPageRoutingModule {}
