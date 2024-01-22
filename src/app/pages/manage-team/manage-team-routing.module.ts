import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageTeamPage } from './manage-team.page';

const routes: Routes = [
  {
    path: '',
    component: ManageTeamPage
  },
  {
    path: 'manage-team-details',
    loadChildren: () => import('./manage-team-details/manage-team-details.module').then( m => m.ManageTeamDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageTeamPageRoutingModule {}
