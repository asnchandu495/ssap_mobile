import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ApiService } from '../../../services/api.service';
import { AppService } from '../../../services/app.service';
import { ComponentService } from '../../../services/component.service';
import { Platform } from '@ionic/angular';

declare var google;

@Component({
	selector: 'app-profile-selfie-preview',
	templateUrl: './profile-selfie-preview.page.html',
	styleUrls: ['./profile-selfie-preview.page.scss'],
})
export class ProfileSelfiePreviewPage implements OnInit {
	// Properties
	isNewUser: boolean;
	profileImage: any;
	checkIn: boolean;
	latitude: number;
	longitude: number;
	locationId: string;
	unReadCount: number = 0;
	displayDateFormat = 'dd/MM/yyyy';
	displayTimeFormat = 'hh:mm a';

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private api: ApiService,
		private app: AppService,
		private component: ComponentService,
		private geolocation: Geolocation,
		public platform: Platform
	) {
		//Get Global Setting
		this.getGlobalSetting();
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			this.getBase64Image();
			this.isNewUser = JSON.parse(params.newuser);
			if (!this.isNewUser) {
				this.checkIn = params.checkIn
					? JSON.parse(params.checkIn)
					: false;
			}
			if (this.checkIn) {
				// Temp
				// this.latitude = 12.7958456;
				// this.longitude = 78.7173287;
				// this.checkLocationMatches();
				// Temp
				this.checkLocationEnabled();
			}
		});
	}

	ionViewWillEnter() {
		this.getUnReadCount();
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.displayDateFormat = globalsettings['dateFormat'];
		this.displayTimeFormat = globalsettings['timeFormat'];
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	checkLocationEnabled() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				if (this.platform.is('android')) {
					this.component.presentLoader();
				}
				let options = { enableHighAccuracy: true };
				this.geolocation
					.getCurrentPosition(options)
					.then((resp) => {
						if (this.platform.is('android')) {
							this.component.dismissLoader();
						}
						this.component.dismissLoader();
						this.latitude = resp.coords.latitude;
						this.longitude = resp.coords.longitude;
						this.checkLocationMatches();
					})
					.catch((error) => {
						if (this.platform.is('android')) {
							this.component.dismissLoader();
						}
						console.log('Error getting location', error);
					});
			},
			(reject) => {
				console.log(reject);
				console.log('Error getting location');
			}
		);
	}

	async checkLocationMatches() {
		const locations = await this.app.getStorage('appUserLocations');
		console.log(locations);
		const geoFence = await this.app.getStorage('geoFence');
		// tslint:disable-next-line: prefer-for-of
		for (let i = 0; i < locations.length; i++) {
			if (
				locations[i].state === 'Pending' ||
				locations[i].state === 'Approved'
			) {
				const lat = locations[i].latitude;
				const long = locations[i].longitude;
				const from = new google.maps.LatLng(lat, long);
				const to = new google.maps.LatLng(
					this.latitude,
					this.longitude
				);
				const distance =
					google.maps.geometry.spherical.computeDistanceBetween(
						from,
						to
					);

				let currentDistance = Math.round(distance);
				if (currentDistance <= geoFence) {
					this.locationId = locations[i].id;
					console.log('Distance matched');
					break;
				} else {
					this.locationId = '';
					console.log('Distance not matched');
				}
			}
		}
	}

	/**
	 * Preview Image
	 */
	async getBase64Image() {
		this.profileImage = await this.app.getStorage('Base64Image');
	}

	/**
	 * * Re-Take Selfie
	 */
	onReTakeSelfie() {
		this.app.capturePicture().then(
			(imageData) => {
				const base64Image = 'data:image/jpeg;base64,' + imageData;
				this.app.setStorage('BaseImage', imageData);
				this.app.setStorage('Base64Image', base64Image);
				this.getBase64Image();
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

	/**
	 * * Request Selfie Approval
	 */
	async onRequestApproval() {
		const baseImage = await this.app.getStorage('BaseImage');
		const maxFileSizeSelfie = await this.app.getStorage(
			'maxFileSizeSelfie'
		);
		const params = {
			base64: baseImage,
		};
		if (baseImage) {
			var baseLength = baseImage.length;
			var sizeInBytes =
				4 * Math.ceil(baseLength / 3) * 0.5624896334383812;
			var sizeInMB = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
			if (sizeInMB > maxFileSizeSelfie) {
				this.component.presentAlert(
					'Oops...!',
					'Image Size is too large. Please retake image with Medium Resolution.',
					'OK'
				);
			} else {
				this.component.presentLoader();
				this.api.base64ProfileUpload(params).subscribe(
					(response: any) => {
						this.component.dismissLoader();
						console.log(response);
						if (response.status === 200) {
							this.app.removeStorage('BaseImage');
							this.app.removeStorage('Base64Image');
							if (this.isNewUser) {
								this.component.presentAlertWithURL(
									'',
									'Your Profile picture request is sent to your supervisor for approval.',
									'OK',
									'/work-location?newuser=true'
								);
							} else {
								this.component.presentAlertWithURL(
									'',
									'Your Profile picture request is sent to your supervisor for approval.',
									'OK',
									'/tabs/dashboard'
								);
							}
						}
					},
					(error) => {
						console.log(error);
						if (error.status === 400) {
							this.component.presentAlert(
								'',
								error.error.UploadFile[0],
								'OK'
							);
						}
						this.component.dismissLoader();
					}
				);
			}
		} else {
			this.component.presentAlert(
				'Oops...!',
				'Please take selfie again',
				'OK'
			);
		}
	}

	/**
	 * * On Verify Selfie
	 */
	async onVerifySelfie() {
		const baseImage = await this.app.getStorage('BaseImage');
		const maxFileSizeSelfie = await this.app.getStorage(
			'maxFileSizeSelfie'
		);
		if (baseImage && this.locationId) {
			var baseLength = baseImage.length;
			var sizeInBytes =
				4 * Math.ceil(baseLength / 3) * 0.5624896334383812;
			var sizeInMB = parseFloat((sizeInBytes / (1024 * 1024)).toFixed(2));
			if (sizeInMB > maxFileSizeSelfie) {
				this.component.presentAlert(
					'Oops...!',
					'Image Size is too large. Please retake image with Medium Resolution.',
					'OK'
				);
			} else {
				const params = {
					base64: baseImage,
				};
				this.component.presentLoader();
				this.api.base64VerifySelfie(params).subscribe(
					(response: any) => {
						this.component.dismissLoader();
						console.log(response);
						if (response.status === 200) {
							this.checkInAPI();
						}
					},
					(error) => {
						console.log(error);
						if (error.status === 400) {
							this.component.presentAlertWithButtons(
								'<p><img src = "/assets/icon/wrong.svg"><span>PPP doesn’t match</span></p><p class="legend-text-black">*PPP: Primary Profile Picture</p>',
								1
							);
						}
						this.component.dismissLoader();
					}
				);
			}
		} else if (!baseImage) {
			this.component.presentAlertWithButtons(
				'<p><img src = "/assets/icon/wrong.svg"><span>Please take selfie again</span></p>',
				0
			);
		} else if (!this.locationId) {
			this.component.presentAlertWithButtons(
				'<p><img src = "/assets/icon/wrong.svg"><span> WFHL doesn’t match</span> </p><p class="legend-text-black">*WFHL: Work From Home Location</p>',
				2
			);
		}
	}

	/**
	 * * Check IN
	 */
	checkInAPI() {
		if (this.locationId) {
			const params = {
				locationId: this.locationId,
				latitude: this.latitude,
				longitude: this.longitude,
			};
			this.component.presentLoader();
			this.api.checkIn(params).subscribe(
				(response: any) => {
					this.component.dismissLoader();
					console.log(response);
					if (response.status === 201) {
						this.app.removeStorage('BaseImage');
						this.app.removeStorage('Base64Image');
						this.app.setStorage('checkedIN', true);
						this.app.setStorage('checkInLAT', this.latitude);
						this.app.setStorage('checkInLONG', this.longitude);
						this.app.setStorage('checkInID', this.locationId);
						this.app.setStorage('checkInTime', new Date());
						this.app.isCheckedIN(true);
						this.component.presentAlertWithSuccess(
							`<p><img src="/assets/icon/right.svg"><span>PPP matched</span></p><p><img src="/assets/icon/right.svg"><span>WFHL matched</span></p><p><img src="/assets/icon/time-outline.svg"><span>${this.transformDate(
								new Date().toLocaleString(),
								this.displayDateFormat
							)} ${this.transformDate(
								new Date().toLocaleString(),
								this.displayTimeFormat
							)}</span></p><p class="legend-text-black">*PPP: Primary Profile Picture</p><p class="legend-text-black">*WFHL: Work From Home Location</p>`
						);
					}
				},
				(error) => {
					console.log(error);
					if (error.status === 400) {
						this.component.presentAlertWithButtons(
							'<p><img src = "/assets/icon/right.svg"><span>PPP matched</span> </p><p><img src = "/assets/icon/wrong.svg"><span>Check-In Failed</span> </p><p class="legend-text-black">*PPP: Primary Profile Picture</p><p class="legend-text-black">*WFHL: Work From Home Location</p>',
							0
						);
					}
					this.component.dismissLoader();
				}
			);
		} else {
			this.component.presentAlertWithButtons(
				'<p><img src = "/assets/icon/right.svg"><span>PPP matched</span> </p><p><img src = "/assets/icon/wrong.svg"><span> WFHL doesn’t match</span> </p><p class="legend-text-black">*PPP: Primary Profile Picture</p><p class="legend-text-black">*WFHL: Work From Home Location</p>',
				2
			);
		}
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}
}
