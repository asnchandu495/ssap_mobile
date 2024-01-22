import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-emergency-contact',
	templateUrl: './emergency-contact.page.html',
	styleUrls: ['./emergency-contact.page.scss'],
})
export class EmergencyContactPage implements OnInit {
	// Properties
	expandedItem = 0;
	items: Array<any> = [];
	filterItems: Array<any> = [];
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getUnReadCount();

		// Get Emergency Contact
		this.component.presentLoader();
		this.api.getEmergencyContact().subscribe(
			(response: any) => {
				const result = response.body;
				this.component.dismissLoader();
				if (response.status === 200) {
					const contactDetails = result.contactDetails.map(
						(data: any) => {
							return {
								...data,
								numbers: data.numbers.split(','),
							};
						}
					);
					this.items = contactDetails;
					this.filterItems = contactDetails;
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
	 * * On Search Filter
	 * @param event - Search Event
	 */
	onSearch(event: any) {
		// Reset items back to all of the items
		this.items = this.filterItems;
		const searchTerm: string = event.target.value;
		if (searchTerm !== '') {
			this.items = this.filterItems.filter((item) => {
				return (
					item.purpose
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1
				);
			});
		}
	}
}
