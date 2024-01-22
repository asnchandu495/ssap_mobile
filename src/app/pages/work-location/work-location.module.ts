import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkLocationPageRoutingModule } from './work-location-routing.module';

import { WorkLocationPage } from './work-location.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkLocationPageRoutingModule
  ],
  declarations: [WorkLocationPage]
})
export class WorkLocationPageModule {}
