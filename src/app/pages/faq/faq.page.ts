import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-faq',
	templateUrl: './faq.page.html',
	styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
	// Properties
	showSearch = false;
	@ViewChild('search', { static: false }) inputEl: IonInput;
	category: any;
	searchTerm: any;
	actionSheet: Array<any> = [];
	faqItems: Array<any> = [];
	items: Array<any> = [];
	unReadCount: number = 0;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getUnReadCount();

		// Get FAQ
		this.component.presentLoader();
		this.api.getFAQForUser().subscribe(
			(response: any) => {
				this.component.dismissLoader();
				if (response.status === 200) {
					const result = response.body;
					const sections = result.sections;
					// tslint:disable-next-line: prefer-for-of
					for (let i = 0; i < sections.length; i++) {
						this.actionSheet.push({
							id: sections[i].id,
							name: sections[i].sectionName,
							isHighlight: false,
						});
						this.category = sections[0].id;
					}
					this.faqItems = sections;
					// this.filterFAQs(this.category);
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
	 * * On ActionSheet Changes
	 */
	onSectionChange() {
		this.filterFAQs(this.category);
		const searchTerm: string = this.searchTerm;
		if (searchTerm) {
			this.onSearch();
			this.searchTerm = this.searchTerm;
		}
	}

	/**
	 * * Filter FAQs on ActionSheet Changes
	 * @param id - string
	 */
	filterFAQs(id: any) {
		const faqs = this.faqItems.find((item) => item.id === id);
		this.items = faqs.questions;
	}

	/**
	 * * Show Search Box On Icon Click
	 */
	onshowSearch() {
		this.showSearch = !this.showSearch;
		this.inputEl.setFocus();
	}

	/**
	 * * On Search Method
	 */
	onSearch() {
		const searchTerm: string = this.searchTerm;
		const id = this.category;
		if (searchTerm) {
			const faqs = this.faqItems.find((item) => item.id === id);
			this.items = faqs.questions.filter((item: any) => {
				return (
					item.questionName
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1 ||
					item.answer
						.toLowerCase()
						.indexOf(searchTerm.toLowerCase()) > -1
				);
			});

			const filterIds = [];
			this.faqItems.filter((faq: any) => {
				faq.questions.filter((questions: any) => {
					if (
						questions.questionName
							.toLowerCase()
							.indexOf(searchTerm.toLowerCase()) > -1 ||
						questions.answer
							.toLowerCase()
							.indexOf(searchTerm.toLowerCase()) > -1
					) {
						filterIds.push(faq.id);
					}
				});
			});

			console.log(filterIds);
			if (filterIds.length > 0) {
				this.actionSheet.find((data) => {
					return (data.isHighlight = false);
				});
				// tslint:disable-next-line: prefer-for-of
				for (let i = 0; i < filterIds.length; i++) {
					const index = this.actionSheet.findIndex((data) => {
						return data.id === filterIds[i];
					});
					if (this.actionSheet[index].id === filterIds[i]) {
						this.actionSheet[index].isHighlight = true;
					}
				}
			} else {
				this.actionSheet.find((data) => {
					return (data.isHighlight = false);
				});
			}

			console.log(this.actionSheet);
		} else {
			this.actionSheet.find((data) => {
				return (data.isHighlight = false);
			});
			this.filterFAQs(this.category);
		}
	}
}
