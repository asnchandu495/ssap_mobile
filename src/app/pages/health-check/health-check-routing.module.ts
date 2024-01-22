import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HealthCheckPage } from './health-check.page';

const routes: Routes = [
  {
    path: '',
    component: HealthCheckPage
  },
  {
    path: 'health-check-preview',
    loadChildren: () => import('./health-check-preview/health-check-preview.module').then( m => m.HealthCheckPreviewPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthCheckPageRoutingModule {}
