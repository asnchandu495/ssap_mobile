import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportDashboardPage } from './report-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ReportDashboardPage
  },
  {
    path: 'location-density',
    loadChildren: () => import('./location-density/location-density.module').then( m => m.LocationDensityPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportDashboardPageRoutingModule {}
