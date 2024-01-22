import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-profile-selfie',
	templateUrl: './profile-selfie.page.html',
	styleUrls: ['./profile-selfie.page.scss'],
})
export class ProfileSelfiePage implements OnInit {
	// Properties
	isNewUser: boolean;
	checkIn: boolean;
	unReadCount: number = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private app: AppService,
		private component: ComponentService
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.isNewUser = JSON.parse(params.newuser);
			if (!this.isNewUser) {
				this.checkIn = params.checkIn
					? JSON.parse(params.checkIn)
					: false;
			}
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

	/**
	 * * Take Selfie
	 */
	onTakeSelfie() {
		this.app.capturePicture().then(
			(imageData) => {
				const base64Image = 'data:image/jpeg;base64,' + imageData;
				this.app.setStorage('BaseImage', imageData);
				this.app.setStorage('Base64Image', base64Image);
				const url = this.isNewUser
					? '/profile-selfie/profile-selfie-preview'
					: '/tabs/profile-selfie/profile-selfie-preview';
				this.router.navigate([url], {
					queryParams: {
						newuser: JSON.stringify(this.isNewUser),
						checkIn: JSON.stringify(this.checkIn),
					},
				});
			},
			(err) => {
				// Handle error
				console.log(err);
				this.component.presentAlert(
					'Oops...!',
					'Please try again',
					'OK'
				);
			}
		);
	}
}
