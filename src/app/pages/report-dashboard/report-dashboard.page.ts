import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
	selector: 'app-report-dashboard',
	templateUrl: './report-dashboard.page.html',
	styleUrls: ['./report-dashboard.page.scss'],
})
export class ReportDashboardPage implements OnInit {
	unReadCount: number = 0;
	constructor(public app: AppService) {}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getUnReadCount();
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}
}
