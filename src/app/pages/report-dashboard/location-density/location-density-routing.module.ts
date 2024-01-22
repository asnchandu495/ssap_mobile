import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationDensityPage } from './location-density.page';

const routes: Routes = [
  {
    path: '',
    component: LocationDensityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationDensityPageRoutingModule {}
