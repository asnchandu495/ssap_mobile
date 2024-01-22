import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { AppService } from 'src/app/services/app.service';
import { ComponentService } from 'src/app/services/component.service';
import { Router } from '@angular/router';
import { Animation, AnimationController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';

@Component({
	selector: 'app-notification',
	templateUrl: './notification.page.html',
	styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
	filterBy: any;
	items: Array<any> = [];
	isLoading: boolean = false;

	constructor(
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router,
		private animationCtrl: AnimationController,
		private menu: MenuController
	) {
		this.filterBy = 'Unread';
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.items = [];
		this.getUserNotification(true);
	}

	/**
	 * * On Filter Message - READ/UNREAD/ALL
	 */
	onFilterChange() {
		this.items = [];
		this.isLoading = true;
		this.getUserNotification(false);
	}

	/**
	 * * Get Time From DATE
	 * @param date - message date
	 * @returns
	 */
	getTimeFromNow(date: any) {
		return this.app.momentTime(date);
	}

	/**
	 * * View Message - For Changing READ/UNREAD Status
	 * @param msg - {msg}
	 */
	async onViewMessage(msg: any, index: any) {
		if (!msg.isRead) {
			const animation: Animation = this.animationCtrl
				.create()
				.addElement(document.getElementById(msg.id))
				.duration(1000)
				.fromTo('transform', 'translateX(0px)', 'translateX(100%)')
				.fromTo('opacity', '1', '0.2');
			animation.play();
			setTimeout(() => {
				this.items.splice(index, 1);
			}, 1000);
			let params = { id: msg.id, isRead: true };
			let unReadCount = await this.app.getStorage('unReadCount');
			await this.api.markNotificationStatus(params).then(
				(response: any) => {
					console.log(response);
					this.app.setStorage('unReadCount', unReadCount - 1);
				},
				(error) => {
					console.log(error);
				}
			);
		}

		// Redirect Page for Action Type Notification
		if (msg.messageType == 'TeamRequest') {
			this.router.navigateByUrl('/tabs/manage-team');
		} else if (msg.messageType == 'WFHL') {
			this.router.navigateByUrl('/tabs/work-location/manage-wfhl');
		} else if (msg.messageType == 'PPP') {
			this.menu.open();
		}
	}

	/**
	 * * On Alert Contact Tracing Method For YES/NO Type Action
	 * @param msg - {msg}
	 * @param actionType - YES/NO TYPE
	 */
	onAlertToContact(msg: any, actionType: boolean, index: any) {
		if (actionType) {
			this.alertToContactTrace(msg, index);
		} else {
			this.onViewMessage(msg, index);
		}
	}

	/**
	 * * On Alert Contact Tracing API Method
	 * @param msg - {msg}
	 */
	alertToContactTrace(msg: any, index: any) {
		this.component.presentLoader();
		const params = { userId: msg.alertToContact };
		this.api.sendAlertToContact(params).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				if (response.status === 201) {
					this.onViewMessage(msg, index);
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
			}
		);
	}

	/**
	 * * Get User Notification
	 */
	getUserNotification(isLoader: boolean) {
		isLoader ? this.component.presentLoader() : '';
		let filterBy = this.filterBy;
		let isRead =
			filterBy == 'Unread' ? false : filterBy == 'Read' ? true : '';
		const params = `IsRead=${isRead}`;
		this.api.getUserNotification(params).subscribe(
			(response: any) => {
				console.log(response);
				this.isLoading = false;
				isLoader ? this.component.dismissLoader() : '';
				const result = response.body;
				if (response.status === 200) {
					let msgList = result.getAllList;
					if (msgList) {
						this.items = msgList;
					} else {
						this.items = [];
					}
				}
				console.log(this.items);
			},
			(error) => {
				this.isLoading = false;
				isLoader ? this.component.dismissLoader() : '';
				console.log(error);
				this.items = [];
			}
		);
	}
}
