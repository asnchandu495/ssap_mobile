import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	// {
	// 	path: '',
	// 	redirectTo: 'login',
	// 	pathMatch: 'full',
	// },
	{
		path: 'login',
		loadChildren: () =>
			import('./pages/login/login.module').then((m) => m.LoginPageModule),
	},
	{
		path: 'forget-password',
		loadChildren: () =>
			import('./pages/forget-password/forget-password.module').then(
				(m) => m.ForgetPasswordPageModule
			),
	},
	{
		path: 'otp',
		loadChildren: () =>
			import('./pages/otp/otp.module').then((m) => m.OtpPageModule),
	},
	{
		path: 'new-password',
		loadChildren: () =>
			import('./pages/new-password/new-password.module').then(
				(m) => m.NewPasswordPageModule
			),
	},
	{
		path: 'tabs',
		loadChildren: () =>
			import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
	},
	{
		path: 'faq',
		loadChildren: () =>
			import('./pages/faq/faq.module').then((m) => m.FaqPageModule),
	},
	{
		path: 'profile-selfie',
		loadChildren: () =>
			import('./pages/profile-selfie/profile-selfie.module').then(
				(m) => m.ProfileSelfiePageModule
			),
	},
	{
		path: 'work-location',
		loadChildren: () =>
			import('./pages/work-location/work-location.module').then(
				(m) => m.WorkLocationPageModule
			),
	},
	{
		path: 'manage-team',
		loadChildren: () =>
			import('./pages/manage-team/manage-team.module').then(
				(m) => m.ManageTeamPageModule
			),
	},
	{
		path: 'attendance-report',
		loadChildren: () =>
			import('./pages/attendance-report/attendance-report.module').then(
				(m) => m.AttendanceReportPageModule
			),
	},
	{
		path: 'health-check-preview',
		loadChildren: () =>
			import(
				'./pages/health-check/health-check-preview/health-check-preview.module'
			).then((m) => m.HealthCheckPreviewPageModule),
	},
  {
    path: 'change-password',
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./pages/notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'report-dashboard',
    loadChildren: () => import('./pages/report-dashboard/report-dashboard.module').then( m => m.ReportDashboardPageModule)
  },


	// {
	// 	path: 'emergency-contact',
	// 	loadChildren: () =>
	// 		import('./pages/emergency-contact/emergency-contact.module').then(
	// 			(m) => m.EmergencyContactPageModule
	// 		),
	// },
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
