import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageWfhlPage } from './manage-wfhl.page';

const routes: Routes = [
  {
    path: '',
    component: ManageWfhlPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageWfhlPageRoutingModule {}
