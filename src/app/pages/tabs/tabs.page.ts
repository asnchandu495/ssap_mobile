import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';
import { IonTabs } from '@ionic/angular';

@Component({
	selector: 'app-tabs',
	templateUrl: 'tabs.page.html',
	styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
	// Properties
	checkedIn: boolean;
	@ViewChild('tabs', { static: false }) tabs: IonTabs;
	selectedTab: string;
	isSupervisor: boolean = false;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router
	) {
		this.app.roleBehaviour.subscribe((res) => {
			this.isSupervisor = res;
		});
	}

	async isCheckedIn() {
		const checkedIN = await this.app.getStorage('checkedIN');
		this.checkedIn = checkedIN ? checkedIN : false;

		this.selectedTab = this.tabs.getSelected();
	}

	/**
	 * * On Health Check Tab Clicked
	 */
	async onHealthCheck() {
		const isSelfCheckTaken: boolean = await this.app.getStorage(
			'isSelfCheckTaken'
		);
		this.router.navigate(['/tabs/health-check'], {
			queryParams: {
				isSelfCheckTaken: isSelfCheckTaken,
				selectedTab: isSelfCheckTaken ? 'past' : 'new',
			},
		});
	}

	/**
	 * Check In
	 */
	onCheckIn() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				console.log(resolve);
				this.router.navigate(['/tabs/profile-selfie'], {
					queryParams: {
						newuser: JSON.stringify(false),
						checkIn: JSON.stringify(true),
					},
				});
			},
			(reject) => {
				console.log(reject);
				console.log('Error getting location');
			}
		);
	}

	/**
	 * Check Out
	 */
	onCheckOut() {
		this.component.presentAlertWithConfirm('Are you sure, you want to Check Out?').then(
			async (resolve) => {
				console.log(resolve);
				const locationID = await this.app.getStorage('checkInID');
				const lat = await this.app.getStorage('checkInLAT');
				const long = await this.app.getStorage('checkInLONG');
				const params = {
					location: locationID,
					latitude: lat,
					longitude: long,
				};
				this.api.checkOut(params).subscribe(
					(response: any) => {
						console.log(response);
						const result = response.body;
						if (response.status === 200) {
							this.app.isCheckedIN(null);
							this.app.removeStorage('checkedIN');
							this.app.removeStorage('checkInLAT');
							this.app.removeStorage('checkInLONG');
							this.app.removeStorage('checkInID');
							this.app.removeStorage('checkInTime');
							this.component.presentAlertWithURL(
								'Check-Out Successful',
								'',
								'OK',
								'/tabs/dashboard?isCheckOut=true'
							);
							this.isCheckedIn();
						}
					},
					(error) => {
						console.log(error);
						if (error.status === 400) {
							this.component.presentAlert(
								'',
								error.error.errors.CheckOut[0],
								'OK'
							);
						}
					}
				);
			},
			(reject) => {
				console.log(reject);

			}
		);
	}
}
