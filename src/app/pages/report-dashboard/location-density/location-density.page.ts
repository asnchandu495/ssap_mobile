import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSelect, IonInput } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';

@Component({
	selector: 'app-location-density',
	templateUrl: './location-density.page.html',
	styleUrls: ['./location-density.page.scss'],
})
export class LocationDensityPage implements OnInit {
	// Properties
	@ViewChild('sortList') selectRef: IonSelect;
	@ViewChild('search', { static: false }) inputEl: IonInput;
	showSearch = false;
	showSortList = true;
	customAlertOptions: any = {
		header: 'Sort By',
	};
	items: Array<any> = [];
	filterItems: Array<any> = [];
	isLoading: boolean = false;
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getDensityReport(true);
		this.getUnReadCount();
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Refresh Report
	 */
	onRefreshReport() {
		this.items = [];
		this.filterItems = [];
		this.isLoading = true;
		this.selectRef.value = '';
		this.getDensityReport(false);
	}

	/**
	 * * Get Density Report
	 */
	getDensityReport(isLoader: boolean) {
		isLoader ? this.component.presentLoader() : '';
		this.api.getDensityReport().subscribe(
			(response: any) => {
				console.log(response);
				this.isLoading = false;
				isLoader ? this.component.dismissLoader() : '';
				const result = response.body;
				if (response.status === 200) {
					if (result.length > 0) {
						this.items = result;
						this.filterItems = result;
					} else {
						this.items = [];
						this.filterItems = [];
					}
				}
			},
			(error) => {
				this.isLoading = false;
				isLoader ? this.component.dismissLoader() : '';
				console.log(error);
				this.items = [];
				this.filterItems = [];
			}
		);
	}

	/**
	 * * Open Sort BY POPUP
	 */
	openSortBy() {
		this.selectRef.open();
	}

	/**
	 * * On SORT BY LOW/MEDIUM/HIGH/NODATA
	 * @param event - value
	 */
	onSortBy(event: any) {
		console.log(event.detail.value);
		// Reset items back to all of the items
		this.items = this.filterItems;
		const sortBy: string = event.detail.value;
		if (sortBy) {
			this.items = this.filterItems.filter((item) => {
				return (
					item.color.toLowerCase().indexOf(sortBy.toLowerCase()) > -1
				);
			});
		}
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
					item.locationName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1
				);
			});
		}
	}
}
