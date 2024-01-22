import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageTeamDetailsPage } from './manage-team-details.page';

const routes: Routes = [
  {
    path: '',
    component: ManageTeamDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageTeamDetailsPageRoutingModule {}
