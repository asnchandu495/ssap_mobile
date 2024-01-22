import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageTeamDetailsPageRoutingModule } from './manage-team-details-routing.module';

import { ManageTeamDetailsPage } from './manage-team-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageTeamDetailsPageRoutingModule
  ],
  declarations: [ManageTeamDetailsPage]
})
export class ManageTeamDetailsPageModule {}
