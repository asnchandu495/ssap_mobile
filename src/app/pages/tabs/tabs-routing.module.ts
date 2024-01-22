import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
	{
		path: '',
		component: TabsPage,
		children: [
			{
				path: 'dashboard',
				loadChildren: () =>
					import('../dashboard/dashboard.module').then(
						(m) => m.DashboardPageModule
					),
			},
			{
				path: 'health-check',
				loadChildren: () =>
					import('../health-check/health-check.module').then(
						(m) => m.HealthCheckPageModule
					),
			},
			{
				path: 'emergency-contact',
				loadChildren: () =>
					import(
						'../emergency-contact/emergency-contact.module'
					).then((m) => m.EmergencyContactPageModule),
			},
			{
				path: 'faq',
				loadChildren: () =>
					import('../faq/faq.module').then((m) => m.FaqPageModule),
			},
			{
				path: 'profile-selfie',
				loadChildren: () =>
					import('../profile-selfie/profile-selfie.module').then(
						(m) => m.ProfileSelfiePageModule
					),
			},
			{
				path: 'work-location',
				loadChildren: () =>
					import('../work-location/work-location.module').then(
						(m) => m.WorkLocationPageModule
					),
			},
			{
				path: 'manage-team',
				loadChildren: () =>
					import('../manage-team/manage-team.module').then(
						(m) => m.ManageTeamPageModule
					),
			},
			{
				path: 'attendance-report',
				loadChildren: () =>
					import(
						'../attendance-report/attendance-report.module'
					).then((m) => m.AttendanceReportPageModule),
			},
			{
				path: 'change-password',
				loadChildren: () =>
					import('../change-password/change-password.module').then(
						(m) => m.ChangePasswordPageModule
					),
			},
			{
				path: 'notification',
				loadChildren: () =>
					import('../notification/notification.module').then(
						(m) => m.NotificationPageModule
					),
			},
			{
				path: 'report-dashboard',
				loadChildren: () =>
					import('../report-dashboard/report-dashboard.module').then(
						(m) => m.ReportDashboardPageModule
					),
			},
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full',
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
