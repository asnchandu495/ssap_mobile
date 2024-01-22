import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { ApiService } from '../../../services/api.service';
import { ComponentService } from '../../../services/component.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-manage-wfhl',
	templateUrl: './manage-wfhl.page.html',
	styleUrls: ['./manage-wfhl.page.scss'],
})
export class ManageWfhlPage implements OnInit {
	// Properties
	expandedItem = 0;
	items: Array<any> = [];
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router
	) {}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getUnReadCount();

		this.expandedItem = 0;
		this.items = [];
		// Get WFHLs
		this.component.presentLoader();
		this.api.getWFHLs().subscribe(
			(response: any) => {
				const result = response.body;
				this.component.dismissLoader();
				if (response.status === 200) {
					this.items = result;
				} else if (response.status === 204) {
					this.items = [];
				}
			},
			(error) => {
				this.component.dismissLoader();
				this.items = [];
			}
		);
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Add WFHLs
	 */
	onAddWFHLs() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				console.log(resolve);
				this.router.navigate(['/tabs/work-location'], {
					queryParams: { newuser: JSON.stringify(false) },
				});
			},
			(reject) => {
				console.log(reject);
				console.log('Error getting location');
			}
		);
	}

	/**
	 * * View Location On MAP
	 * @param item -string
	 */
	viewOnMap(item: any) {
		this.router.navigate(['/tabs/work-location/map'], {
			queryParams: {
				newuser: JSON.stringify(false),
				lat: JSON.stringify(item.latitude),
				long: JSON.stringify(item.longitude),
				address: JSON.stringify(item.location),
			},
		});
	}
}
