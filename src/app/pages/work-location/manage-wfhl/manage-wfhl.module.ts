import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageWfhlPageRoutingModule } from './manage-wfhl-routing.module';

import { ManageWfhlPage } from './manage-wfhl.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageWfhlPageRoutingModule
  ],
  declarations: [ManageWfhlPage]
})
export class ManageWfhlPageModule {}
