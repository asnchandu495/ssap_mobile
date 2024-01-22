import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { ApiService } from '../../../services/api.service';
import { ComponentService } from '../../../services/component.service';
import { forkJoin } from 'rxjs';

@Component({
	selector: 'app-manage-team-details',
	templateUrl: './manage-team-details.page.html',
	styleUrls: ['./manage-team-details.page.scss'],
})
export class ManageTeamDetailsPage implements OnInit {
	// Properties
	status: any;
	toggleBtn = true;
	items: Array<any> = [];
	checkboxPictureIds: Array<any> = [];
	checkboxLocationIds: Array<any> = [];
	selectedAll: any;
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.route.queryParams.subscribe((params) => {
			this.items = [];
			this.checkboxPictureIds = [];
			this.checkboxLocationIds = [];
			this.status = params.status;
			const status = params.status;
			const ids = JSON.parse(params.ids);
			this.getUserRequests(status, ids);
			this.getUnReadCount();
		});
	}

	ngOnInit() {}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Get User Request By status
	 * @param statusType - status (Pending/Approved/Rejected)
	 * @param ids - Array[user ids]
	 */
	getUserRequests(statusType: string, ids: any) {
		const params = {
			status: statusType,
			applicationUserIds: ids,
		};
		this.component.presentLoader();
		this.api.getUserRequestsByStatus(params).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					this.items = result.map((data: any) => {
						return { ...data, show: true, isChecked: false };
					});
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
				this.items = [];
			}
		);
	}

	/**
	 * * Get Profile Picture ID from CheckBox
	 * @param event - btn event
	 */
	checkBoxPicture(event: any) {
		const checkboxId = event.detail.value;
		if (event.detail.checked) {
			this.checkboxPictureIds.push(checkboxId);
		} else {
			const index = this.checkboxPictureIds.findIndex(
				(ids) => ids === checkboxId
			);
			this.checkboxPictureIds.splice(index, 1);
		}
	}

	/**
	 * * Get Location ID from CheckBox
	 * @param event - btn event
	 */
	checkBoxLocation(event: any) {
		const checkboxId = event.detail.value;
		if (event.detail.checked) {
			this.checkboxLocationIds.push(checkboxId);
		} else {
			const index = this.checkboxLocationIds.findIndex(
				(ids) => ids === checkboxId
			);
			this.checkboxLocationIds.splice(index, 1);
		}
	}

	/**
	 * * CheckBox Tab
	 * @param event - btn event
	 * @param id - user id
	 */
	checkBoxTab(event: any, id: any) {
		this.items.find((data) => {
			if (data.userId === id) {
				return (data.isChecked = event.target.checked);
			}
		});
	}

	/**
	 * * Toggle Each User Tab
	 * @param item - User Item
	 */
	onToggleItem(item: any) {
		item.show = !item.show;
		const toggleCheck = this.items.some((el) => (el.show ? true : false));
		if (toggleCheck) {
			this.toggleBtn = true;
		} else {
			this.toggleBtn = false;
		}
	}

	/**
	 * * Collpase/Expand All
	 */
	onCollapseExpandAll() {
		this.toggleBtn = !this.toggleBtn;
		this.items.forEach((item) => {
			return (item.show = this.toggleBtn);
		});
	}

	/**
	 * * Show Collpase After Image Loaded
	 */
	ionImgDidLoad() {
		this.items.forEach((item) => {
			return (item.show = true);
		});
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

	/**
	 * * On Approve Profile/WFHLs
	 * @param event - Button Event
	 */
	onApprove(event: any) {
		let input = { ppp: false, wfhl: false };
		if (this.checkboxPictureIds.length > 0) {
			input.ppp = true;
		}
		if (this.checkboxLocationIds.length > 0) {
			input.wfhl = true;
		}
		this.component.presentAlertWithInput('Approval', input, 'Approve').then(
			async (resolve: any) => {
				console.log(resolve);
				const forkParams = [];
				this.component.presentLoader();
				if (this.checkboxPictureIds.length > 0) {
					const userIds = [];
					// tslint:disable-next-line: prefer-for-of
					for (let i = 0; i < this.checkboxPictureIds.length; i++) {
						userIds.push({
							applicationUserId: this.checkboxPictureIds[i],
						});
					}
					const params = {
						applicationUsers: userIds,
						reason: resolve.ppp,
					};
					forkParams.push(this.api.approveUploadProfile(params));
				}

				if (this.checkboxLocationIds.length > 0) {
					const userIds = [];
					// tslint:disable-next-line: prefer-for-of
					for (let i = 0; i < this.checkboxLocationIds.length; i++) {
						userIds.push({
							id: this.checkboxLocationIds[i],
							reason: resolve.wfhl,
						});
					}
					const params = {
						appUserLocations: userIds,
					};
					forkParams.push(this.api.approveWFH(params));
				}

				forkJoin(forkParams).subscribe(
					(response: any) => {
						console.log(response);
						this.component.dismissLoader();
						const result = response.body;
						if (response[0].status === 200) {
							this.component.presentAlertWithURL(
								'',
								`Profile Photo/Work From Home location approved.`,
								'OK',
								'/tabs/manage-team'
							);
						}
					},
					(error) => {
						this.component.dismissLoader();
						console.log(error);
					}
				);
			},
			(reject) => {
				console.log(reject);
			}
		);
	}

	/**
	 * * On Reject Profile/WFHLs
	 * @param event - Button event
	 */
	onReject(event: any) {
		let input = { ppp: false, wfhl: false };
		if (this.checkboxPictureIds.length > 0) {
			input.ppp = true;
		}
		if (this.checkboxLocationIds.length > 0) {
			input.wfhl = true;
		}
		this.component.presentAlertWithInput('Rejection', input, 'Reject').then(
			async (resolve: any) => {
				console.log(resolve);
				const forkParams = [];
				this.component.presentLoader();
				if (this.checkboxPictureIds.length > 0) {
					const userIds = [];
					// tslint:disable-next-line: prefer-for-of
					for (let i = 0; i < this.checkboxPictureIds.length; i++) {
						userIds.push({
							applicationUserId: this.checkboxPictureIds[i],
						});
					}
					const params = {
						applicationUsers: userIds,
						reason: resolve.ppp,
					};
					forkParams.push(this.api.rejectUploadProfile(params));
				}

				if (this.checkboxLocationIds.length > 0) {
					const userIds = [];
					// tslint:disable-next-line: prefer-for-of
					for (let i = 0; i < this.checkboxLocationIds.length; i++) {
						userIds.push({
							id: this.checkboxLocationIds[i],
							reason: resolve.wfhl,
						});
					}
					const params = {
						appUserLocations: userIds,
					};
					forkParams.push(this.api.rejectWFH(params));
				}

				forkJoin(forkParams).subscribe(
					(response: any) => {
						console.log(response);
						this.component.dismissLoader();
						const result = response.body;
						if (response[0].status === 200) {
							this.component.presentAlertWithURL(
								'',
								`Profile Photo/Work From Home Location rejected.`,
								'OK',
								'/tabs/manage-team'
							);
						}
					},
					(error) => {
						this.component.dismissLoader();
						console.log(error);
					}
				);
			},
			(reject) => {
				console.log(reject);
			}
		);
	}
}
