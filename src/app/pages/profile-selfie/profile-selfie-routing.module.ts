import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileSelfiePage } from './profile-selfie.page';

const routes: Routes = [
	{
		path: '',
		component: ProfileSelfiePage,
	},
	{
		path: 'profile-selfie-preview',
		loadChildren: () =>
			import(
				'./profile-selfie-preview/profile-selfie-preview.module'
			).then((m) => m.ProfileSelfiePreviewPageModule),
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ProfileSelfiePageRoutingModule {}
