import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';
import { IonInput } from '@ionic/angular';

@Component({
	selector: 'app-manage-team',
	templateUrl: './manage-team.page.html',
	styleUrls: ['./manage-team.page.scss'],
})
export class ManageTeamPage implements OnInit {
	// Properties
	showSearch = false;
	@ViewChild('search', { static: false }) inputEl: IonInput;
	selectedAll: any;
	selectTabs: string;
	items: Array<any> = [];
	filterItems: Array<any> = [];
	itemId: Array<any> = [];
	displayDateFormat = 'dd/MM/yyyy';
	displayTimeFormat = 'hh:mm a';
	searchTerm: any;
	sortIcon = true;
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router
	) {
		this.selectTabs = 'Pending';
		this.selectedAll = false;
		//Get Global Setting
		this.getGlobalSetting();
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.items = [];
		this.itemId = [];
		this.selectedAll = false;
		this.sortIcon = true;
		this.getAllTeamRequest(this.selectTabs);
		this.getUnReadCount();
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	// Sort
	sortItem(sortBy: boolean) {
		this.sortIcon = !this.sortIcon;
		console.log(this.sortIcon);
		var items = this.items;
		var sortItems = items.sort(function (a, b) {
			var nameA = a.firstName.toUpperCase();
			var nameB = b.firstName.toUpperCase();
			if (!sortBy) {
				return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
			} else {
				return nameB < nameA ? -1 : nameB > nameA ? 1 : 0;
			}
		});
		this.items = sortItems;
		console.log(sortItems);
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.displayDateFormat = globalsettings['dateFormat'];
		this.displayTimeFormat = globalsettings['timeFormat'];
		console.log(this.displayDateFormat);
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}

	/**
	 * * Show Search Box On Icon Click
	 */
	onshowSearch() {
		this.showSearch = !this.showSearch;
		this.inputEl.setFocus();
	}

	/**
	 * * On Search Filter
	 * @param event - Search Event
	 */
	onSearch(event: any) {
		console.log(event.target.value);
		// Reset items back to all of the items
		this.items = this.filterItems;
		const searchTerm: string = event.target.value;
		if (searchTerm) {
			this.items = this.filterItems.filter((item) => {
				return (
					item.firstName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1 ||
					item.middleName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1 ||
					item.lastName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1
				);
			});
		}
	}

	/**
	 * * Tab/Segment Change
	 * @param event - Tab Segment event
	 */
	segmentChanged(event: any) {
		this.items = [];
		this.itemId = [];
		this.selectedAll = false;
		this.inputEl.value = '';
		this.sortIcon = true;
		this.getAllTeamRequest(event.target.value);
	}

	/**
	 * * Ion Checkbox Value Change
	 * @param event - checkbox event
	 */
	onCheckBoxChange(event: any) {
		const checkboxId = event.detail.value;
		if (event.detail.checked) {
			this.itemId.push(checkboxId);
		} else {
			const index = this.itemId.findIndex((ids) => ids === checkboxId);
			this.itemId.splice(index, 1);
		}
		console.log(this.itemId);
	}

	/**
	 * * Get All Team Request by Status
	 * @param statusType -(Pending/Approved/Rejected)
	 */
	getAllTeamRequest(statusType: string) {
		this.component.presentLoader();
		this.api.getAllRequestsByStatus(statusType).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					console.log(result);
					if (result.length > 0) {
						this.items = result;
						this.filterItems = result;
					} else {
						this.items = [];
					}
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
	 * * View Details And Approve For Pending
	 */
	onViewAndApprove() {
		this.router.navigate(['/tabs/manage-team/manage-team-details'], {
			queryParams: {
				status: this.selectTabs,
				ids: JSON.stringify(this.itemId),
			},
		});
	}

	/**
	 * * View Details for Approve and Reject
	 * @param item - items object
	 */
	onViewDetails(item: any) {
		this.router.navigate(['/tabs/manage-team/manage-team-details'], {
			queryParams: {
				status: this.selectTabs,
				ids: JSON.stringify([item.id]),
			},
		});
	}
}
