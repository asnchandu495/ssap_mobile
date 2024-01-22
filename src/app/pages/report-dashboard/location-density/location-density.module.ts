import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocationDensityPageRoutingModule } from './location-density-routing.module';

import { LocationDensityPage } from './location-density.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocationDensityPageRoutingModule
  ],
  declarations: [LocationDensityPage]
})
export class LocationDensityPageModule {}
