import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportDashboardPageRoutingModule } from './report-dashboard-routing.module';

import { ReportDashboardPage } from './report-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportDashboardPageRoutingModule
  ],
  declarations: [ReportDashboardPage]
})
export class ReportDashboardPageModule {}
