import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AppService } from '../../services/app.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-work-location',
	templateUrl: './work-location.page.html',
	styleUrls: ['./work-location.page.scss'],
})
export class WorkLocationPage implements OnInit {
	// Properties
	isNewUser: boolean;
	unReadCount: number = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private app: AppService,
		private component: ComponentService
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.isNewUser = JSON.parse(params.newuser);
			console.log(this.isNewUser);
		});
	}

	ionViewWillEnter() {
		this.getUnReadCount();
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	onAddWFHL() {
		this.router.navigate(['/tabs/work-location/map'], {
			queryParams: { newuser: JSON.stringify(true) },
		});
	}
}
