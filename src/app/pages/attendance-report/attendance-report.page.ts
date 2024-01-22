import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonSelect } from '@ionic/angular';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-attendance-report',
	templateUrl: './attendance-report.page.html',
	styleUrls: ['./attendance-report.page.scss'],
})
export class AttendanceReportPage implements OnInit {
	// Properties
	showSearch = false;
	searchTerm: any;
	@ViewChild('search', { static: false }) inputEl: IonInput;
	@ViewChild('sortList') selectRef: IonSelect;
	sortBy: any;
	showSortList = true;
	customAlertOptions: any = {
		header: 'Sort By',
	};

	datepickerFormat = 'MMM DD YYYY';
	datedisplayFormat = 'DD/MM/YYYY';

	dateFormatPipe = 'dd/MM/yyyy';
	timeFormatPipe = 'hh:mm a';

	fromDate: String = new Date().toISOString();
	toDate: String = new Date().toISOString();
	toggleBtn = false;
	items: Array<any> = [];
	filterItems: Array<any> = [];
	ionChangeDate: boolean = false;

	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {
		//Get Global Setting
		this.getGlobalSetting();
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.showSearch = false;
		this.searchTerm = '';
		this.toggleBtn = false;
		this.items = [];
		this.getAttendance();
		this.getUnReadCount();
	}

	ionViewWillLeave() {
		this.ionChangeDate = false;
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.dateFormatPipe = globalsettings['dateFormat'];
		this.timeFormatPipe = globalsettings['timeFormat'];

		this.datedisplayFormat = globalsettings['dateFormat'].toUpperCase();
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}

	/**
	 * * On Date Change
	 */
	onDateChange() {
		this.toggleBtn = false;
		this.items = [];
		if (this.ionChangeDate) {
			this.getAttendance();
		}
	}

	/**
	 * * Get SORT BY
	 */
	getSortBy() {
		this.toggleBtn = false;
		this.items = [];
		this.getAttendance();
	}

	/**
	 * * Get Check IN TIME (In Hours)
	 * @param checkIn - checkIn Time
	 * @param checkOut - checkOut Time
	 * @returns
	 */
	getCheckInTime(checkIn: any, checkOut: any) {
		let date1 = new Date(checkIn).getTime();
		let date2 = new Date(checkOut).getTime();
		let msec = date2 - date1;
		let mins = Math.floor(msec / 60000);
		let hrs = Math.floor(mins / 60);
		mins = mins % 60;
		return `${hrs}hr ${mins}mins`;
	}

	/**
	 * * On Search Filter
	 * @param event - Search Event
	 */
	onSearch(event: any) {
		// Reset items back to all of the items
		this.items = this.filterItems;
		const searchTerm: string = event.target.value;
		if (searchTerm) {
			this.items = this.filterItems.filter((item) => {
				return (
					item.userName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1
				);
			});
		}
	}

	/**
	 * * Get Attendance
	 */
	getAttendance() {
		this.component.presentLoader();
		const isOrder = this.sortBy === 'name' ? true : false;
		const isActive = this.sortBy === 'status' ? true : false;
		const params = {
			fromDate: this.fromDate,
			toDate: this.toDate,
			isActive: isActive,
			isOrder: isOrder,
		};
		console.log(params);
		this.ionChangeDate = true;
		this.api.getUserAttendance(params).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					console.log(result);
					if (result.length > 0) {
						const data = result.map((data: any) => {
							if (data.workflowstate.length > 0) {
								data.workflowstate.forEach((el: any) => {
									return (el.show = false);
								});
								return { ...data, show: false };
							} else {
								return { ...data, show: false };
							}
							// return { ...data, show: true };
						});
						console.log(data);
						this.items = data;
						this.filterItems = data;
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
	 * * Open Sort BY POPUP
	 */
	openSortBy() {
		setTimeout(() => {
			this.selectRef.open();
		}, 2);
	}

	/**
	 * * Show Search Box On Icon Click
	 */
	onshowSearch() {
		this.showSearch = !this.showSearch;
		this.inputEl.setFocus();
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
	 * * Toggle Each User Sub Item
	 * @param item - User Item
	 */
	onToggleSubItem(item: any, subItem: any) {
		subItem.show = !subItem.show;
		const toggleCheck = item.workflowstate.some((el: any) =>
			el.show ? true : false
		);
		if (toggleCheck) {
			item.show = true;
		} else {
			item.show = false;
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
}
