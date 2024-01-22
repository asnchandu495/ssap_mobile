import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HealthCheckPreviewPageRoutingModule } from './health-check-preview-routing.module';

import { HealthCheckPreviewPage } from './health-check-preview.page';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		HealthCheckPreviewPageRoutingModule,
	],
	declarations: [HealthCheckPreviewPage],
})
export class HealthCheckPreviewPageModule {}
