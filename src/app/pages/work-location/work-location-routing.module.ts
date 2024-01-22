import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkLocationPage } from './work-location.page';

const routes: Routes = [
  {
    path: '',
    component: WorkLocationPage
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then( m => m.MapPageModule)
  },
  {
    path: 'manage-wfhl',
    loadChildren: () => import('./manage-wfhl/manage-wfhl.module').then( m => m.ManageWfhlPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkLocationPageRoutingModule {}
