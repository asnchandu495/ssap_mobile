import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';
import { AppService } from '../../services/app.service';
import { ComponentService } from '../../services/component.service';
import { PinmicroService } from 'src/app/services/pinmicro.service';
import { IbeaconService } from 'src/app/services/ibeacon.service';
import { FcmService } from 'src/app/services/fcm.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
	selector: 'app-side-menu',
	templateUrl: './side-menu.component.html',
	styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
	// Properties
	UserName: any;
	Desgination: any;
	UserImage: any;
	UploadProfileImage: any;
	LastUpdated: any;
	LastUpdatedDate: any;
	LastUpdatedTime: any;
	Status: any;
	checkedIn: boolean;
	displayDateFormat = 'dd/MM/yyyy';
	displayTimeFormat = 'hh:mm a';
	isSupervisor: boolean = false;

	constructor(
		public api: ApiService,
		public app: AppService,
		public component: ComponentService,
		private camera: Camera,
		private menu: MenuController,
		private router: Router,
		private sanitizer: DomSanitizer,
		public pinmicro: PinmicroService,
		public ibeacon: IbeaconService,
		public fcm: FcmService,
		private backgroundMode: BackgroundMode
	) {}

	ngOnInit() {}

	/**
	 * * On Menu Open Get User Profile Detail
	 */
	onMenuOpen() {
		this.UserImage = this.UserImage
			? this.UserImage
			: '/assets/img/default-user.png';
		this.UploadProfileImage = this.UploadProfileImage
			? this.UploadProfileImage
			: '';

		//Get Global Setting
		this.getGlobalSetting();
		// Get User Profile
		this.getUserProfile();
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
	 * * Get User Profile Details from Storage
	 */
	async getUserProfile() {
		this.isSupervisor = await this.app.getStorage('isSupervisor');
		this.UserName = await this.app.getStorage('UserName');
		this.Desgination = await this.app.getStorage('Desgination');
		const ProfileImage = await this.app.getStorage('ProfileImage');
		this.UserImage = ProfileImage
			? ProfileImage
			: '/assets/img/default-user.png';
		this.UploadProfileImage = await this.app.getStorage(
			'UploadProfileImage'
		);
		this.LastUpdated = await this.app.getStorage('ProfileDateTime');
		this.Status = await this.app.getStorage('ProfileStatus');
		const checkedIN = await this.app.getStorage('checkedIN');
		this.checkedIn = checkedIN ? checkedIN : false;
		this.LastUpdatedDate = this.app.moment(
			this.LastUpdated,
			this.displayDateFormat
		);
		this.LastUpdatedTime = this.app.moment(
			this.LastUpdated,
			this.displayTimeFormat
		);
	}

	/**
	 * * Capture Selfie
	 */
	captureSelfie() {
		this.menu.close();
		if (this.Status === 'Pending') {
			this.component.presentAlert(
				'',
				'Your profile picture is still in pending state. please wait till the supervisor to approve',
				'OK'
			);
		} else {
			this.router.navigate(['/tabs/profile-selfie'], {
				queryParams: { newuser: JSON.stringify(false) },
			});
		}
	}

	/**
	 * * Close Side Menu
	 */
	onCloseSideMenu() {
		this.menu.close();
	}

	/**
	 * * On Health Check Tab Clicked
	 */
	async myHealthDeclaration() {
		const isSelfCheckTaken = await this.app.getStorage('isSelfCheckTaken');
		this.router.navigate(['/tabs/health-check'], {
			queryParams: {
				isSelfCheckTaken: isSelfCheckTaken,
				selectedTab: 'past',
			},
		});
	}

	async takeSelfCheck() {
		const isSelfCheckTaken = await this.app.getStorage('isSelfCheckTaken');
		this.router.navigate(['/tabs/health-check'], {
			queryParams: {
				isSelfCheckTaken: isSelfCheckTaken,
				selectedTab: isSelfCheckTaken ? 'past' : 'new',
			},
		});
	}

	/**
	 * * On Logout Method
	 */
	async onLogout() {
		const checkedIn = await this.app.getStorage('checkedIN');
		const locationID = await this.app.getStorage('checkInID');
		const lat = await this.app.getStorage('checkInLAT');
		const long = await this.app.getStorage('checkInLONG');
		const PinMicroScanning = await this.app.getStorage('PinMicroScanning');
		if (checkedIn) {
			this.component
				.presentAlertWithConfirm(
					'On logging Out, your Check-In will get expired. Are you sure, you want to Log Out?'
				)
				.then(
					(resolve) => {
						console.log(resolve);
						this.component.presentLoader();
						this.checkOutOnLogOut(locationID, lat, long);
					},
					(reject) => {
						console.log(reject);
					}
				);
		} else if (PinMicroScanning) {
			this.component
				.presentAlertWithConfirm(
					'Please stay logged in to SAFE till your shift gets over'
				)
				.then(
					(resolve) => {
						console.log(resolve);
						this.component.presentLoader();
						this.pinmicro.stopScanning();
						this.logoutSession();
					},
					(reject) => {
						console.log(reject);
					}
				);
		} else {
			this.component.presentLoader();
			this.logoutSession();
		}
	}

	async logoutSession() {
		const accessToken = await this.app.getStorage('AccessToken');
		this.app.onConcurrentLogin(true, accessToken);
		this.api.authLogout(accessToken).subscribe(
			(response: any) => {
				this.component.dismissLoader();
				if (response.status === 200) {
					// this.app.clearStorage();
					this.app.removeStorage('UserID');
					this.app.removeStorage('UserName');
					this.app.removeStorage('Desgination');
					this.app.removeStorage('countryName');
					this.app.removeStorage('appUserLocations');
					this.app.removeStorage('ProfileStatus');
					this.app.removeStorage('ProfileDateTime');
					this.app.removeStorage('ProfileImage');
					this.app.removeStorage('UploadProfileImage');
					this.app.removeStorage('UserEmail');
					this.app.removeStorage('SurveyResponseId');
					this.app.removeStorage('AccessToken');
					this.app.removeStorage('ExpiresIn');
					this.app.removeStorage('Scope');
					this.app.removeStorage('TokenType');
					this.app.removeStorage('validId');
					this.app.removeStorage('BaseImage');
					this.app.removeStorage('Base64Image');
					this.app.removeStorage('checkedIN');
					this.app.removeStorage('checkInLAT');
					this.app.removeStorage('checkInLONG');
					this.app.removeStorage('checkInID');
					this.app.removeStorage('checkInTime');
					this.app.removeStorage('isSelfCheckTaken');
					this.app.removeStorage('covidStateId');
					this.app.removeStorage('covidState');
					this.app.removeStorage('colorCode');
					this.app.removeStorage('stateName');
					this.app.removeStorage('message');
					this.app.removeStorage('PinMicroScanning');
					this.app.removeStorage('PinMicroScanTime');
					this.app.removeStorage('PinMicroInit');
					this.menu.close();
					this.fcm.unRegister();
					this.pinmicro.resetSDK();
					this.ibeacon.stopScannning();
					this.backgroundMode.setEnabled(false);
					// Navigate to /view
					this.router.navigate(['/login'], { replaceUrl: true });
				}
			},
			(error) => {
				this.component.dismissLoader();
				this.fcm.unRegister();
				this.pinmicro.resetSDK();
				this.ibeacon.stopScannning();
				if (error.status === 401) {
					this.menu.close();
					this.app.clearStorage();
					this.component.presentAlert(
						'Oops...!',
						'Your session got expired. Please login again.',
						'OK'
					);
				}
			}
		);
	}

	async isCheckedIn() {
		const checkedIN = await this.app.getStorage('checkedIN');
		this.checkedIn = checkedIN ? checkedIN : false;
	}

	/**
	 * * On Logout CheckOut
	 * @param locationId
	 * @param lat
	 * @param long
	 */
	checkOutOnLogOut(locationId: any, lat: any, long: any) {
		const params = {
			location: locationId,
			latitude: lat,
			longitude: long,
		};
		this.api.checkOut(params).subscribe(
			(response: any) => {
				console.log(response);
				this.app.isCheckedIN(null);
				this.app.removeStorage('checkedIN');
				this.app.removeStorage('checkInLAT');
				this.app.removeStorage('checkInLONG');
				this.app.removeStorage('checkInID');
				this.app.removeStorage('checkInTime');
				this.router.navigateByUrl('/tabs/dashboard?isCheckOut=true');
				this.logoutSession();
			},
			(error) => {
				console.log(error);
			}
		);
	}

	/**
	 * Check In
	 */
	onCheckIn() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				console.log(resolve);
				this.menu.close();
				this.router.navigate(['/tabs/profile-selfie'], {
					queryParams: {
						newuser: JSON.stringify(false),
						checkIn: JSON.stringify(true),
					},
				});
			},
			(reject) => {
				this.menu.close();
				console.log(reject);
				console.log('Error getting location');
			}
		);
	}

	/**
	 * Check Out
	 */
	onCheckOut() {
		this.component
			.presentAlertWithConfirm('Are you sure, you want to Check Out?')
			.then(
				async (resolve) => {
					console.log(resolve);
					const locationID = await this.app.getStorage('checkInID');
					const lat = await this.app.getStorage('checkInLAT');
					const long = await this.app.getStorage('checkInLONG');
					const params = {
						location: locationID,
						latitude: lat,
						longitude: long,
					};
					this.api.checkOut(params).subscribe(
						(response: any) => {
							console.log(response);
							const result = response.body;
							if (response.status === 200) {
								this.app.isCheckedIN(null);
								this.app.removeStorage('checkedIN');
								this.app.removeStorage('checkInLAT');
								this.app.removeStorage('checkInLONG');
								this.app.removeStorage('checkInID');
								this.app.removeStorage('checkInTime');
								this.component.presentAlertWithURL(
									'Check-Out Successful',
									'',
									'OK',
									'/tabs/dashboard?isCheckOut=true'
								);
								this.isCheckedIn();
								this.menu.close();
							}
						},
						(error) => {
							console.log(error);
							this.menu.close();
							if (error.status === 400) {
								this.component.presentAlert(
									'',
									error.error.errors.CheckOut[0],
									'OK'
								);
							}
						}
					);
				},
				(reject) => {
					console.log(reject);
				}
			);
	}
}
