import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmergencyContactPageRoutingModule } from './emergency-contact-routing.module';

import { EmergencyContactPage } from './emergency-contact.page';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		EmergencyContactPageRoutingModule,
	],
	declarations: [EmergencyContactPage],
})
export class EmergencyContactPageModule {}
