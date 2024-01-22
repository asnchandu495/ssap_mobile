import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IbeaconService } from '../../services/ibeacon.service';

// import { IBeacon, IBeaconPluginResult } from '@ionic-native/ibeacon/ngx';
import { Platform } from '@ionic/angular';
import { interval } from 'rxjs';
import * as moment from 'moment';
import { PinmicroService } from 'src/app/services/pinmicro.service';
import { FcmService } from 'src/app/services/fcm.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
	// Properties
	DayTitle: string;
	UserName: string;
	UserImage: string;
	checkedIn: boolean = false;
	isSelfCheckTaken: boolean;
	colorCode: string;
	stateName: string;
	lastCheckInTime: any = null;
	intervalHandle: any = null;
	selfCheckTimer: any;
	attendanceActivity: Array<any> = [];
	selfCheckActivity: Array<any> = [];
	displayDateFormat = 'dd/MM/yyyy';
	displayTimeFormat = 'hh:mm a';
	unReadCount: number = 0;
	selfCheckDate: any;
	timerInterval: any;

	constructor(
		private route: ActivatedRoute,
		public app: AppService,
		public api: ApiService,
		public component: ComponentService,
		private router: Router,
		private changeRef: ChangeDetectorRef,
		public ibeacon: IbeaconService,
		public pinmicro: PinmicroService,
		public fcm: FcmService,
		public platform: Platform
	) {
		this.route.queryParams.subscribe((params) => {
			const isCheckOut: boolean = params.isCheckOut
				? JSON.parse(params.isCheckOut)
				: false;
			if (isCheckOut) {
				this.isCheckedIn();
				this.stopTimerInterval();
			}
		});

		//Get Global API
		this.app.getGlobalAPI();

		// Get GLobal Settings
		this.getGlobalSetting();
	}

	ngOnInit() {
		this.fcm.generateFCMToken();
		if (this.platform.is('android')) {
			this.pinmicro.disableBattery();
		}
		console.log('success');
	}

	ionViewWillEnter() {
		const hours = new Date().getHours();
		this.DayTitle =
			hours < 12
				? 'Good Morning'
				: hours < 17
				? 'Good Afternoon'
				: 'Good Evening';
		this.UserImage = this.UserImage
			? this.UserImage
			: '/assets/img/default-user.png';

		this.component.presentLoader();
		this.api.getUserDetails().subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					this.UserName = `${result.firstName} ${result.lastName}`;
					if (result.profileImage) {
						this.UserImage = result.profileImage;
					} else if (result.uploadedProfileImage) {
						this.UserImage = result.uploadedProfileImage;
					} else {
						this.UserImage = '/assets/img/default-user.png';
					}
					let userRoles = [];
					let userRole = result.applicationUserToRole;
					userRole.forEach((role: any) => {
						userRoles.push(role.id);
					});
					let appRole = userRoles.includes('Supervisor');
					this.app.isSupervisor(appRole);
					this.app.setStorage('isSupervisor', appRole);
					this.app.setStorage('UserID', result.id);
					this.app.setStorage('UserName', this.UserName);
					this.app.setStorage('Desgination', result.designationName);
					this.app.setStorage('countryName', result.countryName);
					this.app.setStorage('majorCode', result.majorCode);
					this.app.setStorage('minorCode', result.minorCode);
					this.app.setStorage('city', result.city);
					this.app.setStorage('emailID', result.emailID);
					this.app.setStorage(
						'unReadCount',
						result.unReadCount ? result.unReadCount : 0
					);
					this.app.setStorage(
						'rlapUserReferenceId',
						result.rlapUserReferenceId
					);
					this.lastCheckInTime = result.lastCheckInTime;
					this.app.setStorage(
						'appUserLocations',
						result.appUserLocations
					);
					this.app.setStorage(
						'isSelfCheckTaken',
						result.isSelfHealthCheckTaken
					);
					this.getShiftStatus(result.id);
					this.app.setStorage('covidStateId', result.covidStateId);
					if (result.covidStateId && result.isSelfHealthCheckTaken) {
						this.getCovidState(result.covidStateId);
						this.isSelfCheckTaken = result.isSelfHealthCheckTaken;
					} else {
						this.isSelfCheckTaken = result.isSelfHealthCheckTaken;
						this.app.removeStorage('covidState');
						this.app.removeStorage('colorCode');
						this.app.removeStorage('stateName');
						this.app.removeStorage('message');
					}
					if (result.profilePhotoWorkFlowState) {
						this.app.setStorage(
							'ProfileStatus',
							result.profilePhotoWorkFlowState.state
						);
						this.app.setStorage(
							'ProfileDateTime',
							result.profilePhotoWorkFlowState.dateTime
						);
						this.app.setStorage(
							'ProfileImage',
							result.profileImage
						);
						this.app.setStorage(
							'UploadProfileImage',
							result.uploadedProfileImage
						);
					} else {
						this.router.navigate(['/profile-selfie'], {
							queryParams: { newuser: JSON.stringify(true) },
						});
					}

					this.isCheckedIn();

					// this.ibeacon.watch();
					// this.ibeacon.startScanning();

					this.scanBLE();
					this.initPinMicro();
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
			}
		);

		this.api.getAttendanceActivity().subscribe(
			(response: any) => {
				console.log(response);
				const result = response.body;
				if (response.status === 200) {
					if (result) {
						this.attendanceActivity = [];
						this.attendanceActivity.push(result);
					}
				}
			},
			(error) => {
				console.log(error);
			}
		);

		this.api.getHealthCheckActivity().subscribe(
			(response: any) => {
				console.log(response);
				const result = response.body;
				if (response.status === 200) {
					if (result) {
						this.selfCheckActivity = [];
						this.selfCheckActivity.push(result);
						this.selfCheckDate = result.time;
					}
				}
			},
			(error) => {
				console.log(error);
			}
		);
	}

	async scanBLE() {
		// const isBLEScanning = await this.app.getStorage('isBLEScanning');
		// if(!isBLEScanning) {
		this.app.setStorage('isBLEScanning', true);
		this.ibeacon.watch();
		setTimeout(() => {
			this.ibeacon.startScanning();
		}, 30000);
		// }
	}

	async initPinMicro() {
		const initPinMicro = await this.app.getStorage('PinMicroInit');
		if (!initPinMicro) {
			this.pinmicro.beaconInitialize();
		}
	}

	async showMessage() {
		let covidState = await this.app.getStorage('covidState');
		let isTodaysDate = this.app.momentDateCompare(this.selfCheckDate);
		let colorCode = covidState.colorCode.toLowerCase();

		if (isTodaysDate && colorCode == 'green') {
			this.app.checkBluetoothEnable().then(
				(resolve) => {
					console.log(resolve);
					this.app.checkLocationEnable().then(
						(resolve) => {
							console.log(resolve);
							this.pinmicro.startScanning();
							this.showPoPMessage(
								covidState.stateName,
								covidState.message,
								covidState.colorCode
							);
						},
						(reject) => {
							console.log(reject);
							console.log('Error getting location');
						}
					);
				},
				(reject) => {
					console.log(reject);
					console.log('Error getting Bluetooth');
				}
			);
		} else {
			this.showPoPMessage(
				covidState.stateName,
				covidState.message,
				covidState.colorCode
			);
		}
	}

	showPoPMessage(stateName: any, message: any, colorCode: any) {
		this.component.presentAlertWithEmojiPreview(
			stateName,
			message,
			colorCode.toLowerCase()
		);
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.displayDateFormat = globalsettings['dateFormat'];
		this.displayTimeFormat = globalsettings['timeFormat'];
	}

	getShiftStatus(userId: any) {
		this.api.getShiftStatus(userId).subscribe(
			(response: any) => {
				console.log(response);
				const result = response.body;
				if (response.status === 200) {
					this.app.setStorage('shiftStartTime', result.startTime);
					this.app.setStorage('shiftEndTime', result.endTime);
					// this.showSelfCheckReminder();
				}
			},
			(error) => {
				console.log(error);
			}
		);
	}

	async showSelfCheckReminder() {
		const shiftStartTime = await this.app.getStorage('shiftStartTime');
		const selfHealthReminder = await this.app.getStorage(
			'selfHealthReminder'
		);
		if (shiftStartTime && selfHealthReminder && !this.isSelfCheckTaken) {
			let date1 = new Date(shiftStartTime).getTime();
			let date2 = new Date().getTime();
			let msec = date2 - date1;
			let mins = Math.floor(msec / 60000);
			let hrs = Math.floor(mins / 60);
			if (hrs == selfHealthReminder) {
				console.log('Self-Check Reminder');
				this.component.presentAlert(
					'Alert!',
					'Please Take Self Health Check',
					'OK'
				);
			}
		}
	}

	async getCovidState(cid: any) {
		const covidState = await this.app.getStorage('covidState');
		// if (!covidState) {
		this.api.getCovidStateById(cid).subscribe(
			(response: any) => {
				console.log(response);
				const result = response.body;
				if (response.status === 200) {
					this.colorCode = result.colorCode;
					this.stateName = result.stateName;
					this.app.setStorage('covidState', result);
					this.app.setStorage('colorCode', result.colorCode);
					this.app.setStorage('stateName', result.stateName);
					this.app.setStorage('message', result.message);
				}
			},
			(error) => {
				console.log(error);
			}
		);
		// }
	}

	/**
	 * * On Health Check Tab Clicked
	 */
	async onHealthCheck() {
		const isSelfCheckTaken: boolean = await this.app.getStorage(
			'isSelfCheckTaken'
		);
		this.router.navigate(['/tabs/health-check'], {
			queryParams: {
				isSelfCheckTaken: isSelfCheckTaken,
				selectedTab: isSelfCheckTaken ? 'past' : 'new',
			},
		});
	}

	async isCheckedIn() {
		const checkedIN = await this.app.getStorage('checkedIN');
		this.checkedIn = checkedIN ? checkedIN : false;

		this.unReadCount = await this.app.getStorage('unReadCount');

		// Start Timer
		this.startCheckInTimer(this.checkedIn);

		// Self-check Button
		this.colorCode = await this.app.getStorage('colorCode');
		this.stateName = await this.app.getStorage('stateName');

		if (this.checkedIn) {
			this.app.isAutoCheckOut();
			// const autoCheckOutTime = await this.app.getStorage(
			// 	'automatedCheckoutTime'
			// );
			// const locationID = await this.app.getStorage('checkInID');
			// const lat = await this.app.getStorage('checkInLAT');
			// const long = await this.app.getStorage('checkInLONG');
			// const checkInTime = await this.app.getStorage('checkInTime');

			// let date1 = new Date(checkInTime).getTime();
			// let date2 = new Date().getTime();
			// let msec = date2 - date1;
			// let mins = Math.floor(msec / 60000);
			// let hrs = Math.floor(mins / 60);

			// this.intervalHandle = interval(300000).subscribe((x) => {
			// 	console.log('Next: ', x);
			// 	let date1 = new Date(checkInTime).getTime();
			// 	let date2 = new Date().getTime();
			// 	let msec = date2 - date1;
			// 	let mins = Math.floor(msec / 60000);
			// 	let hrs = Math.floor(mins / 60);
			// 	if (hrs >= autoCheckOutTime) {
			// 		console.log('Auto Checkout');
			// 		this.autoCheckOut(locationID, lat, long);
			// 	}
			// });

			// if (hrs >= autoCheckOutTime) {
			// 	console.log('Auto Checkout');
			// 	this.autoCheckOut(locationID, lat, long);
			// }
		}
	}

	// clearInterval() {
	// 	if (this.intervalHandle) {
	// 		this.intervalHandle.unsubscribe();
	// 	}
	// }

	// autoCheckOut(locationId: any, lat: any, long: any) {
	// 	const params = {
	// 		location: locationId,
	// 		latitude: lat,
	// 		longitude: long,
	// 	};
	// 	this.api.checkOut(params).subscribe(
	// 		(response: any) => {
	// 			this.app.isCheckedIN(null);
	// 			this.app.removeStorage('checkedIN');
	// 			this.app.removeStorage('checkInLAT');
	// 			this.app.removeStorage('checkInLONG');
	// 			this.app.removeStorage('checkInID');
	// 			this.app.removeStorage('checkInTime');
	// 			this.clearInterval();
	// 			this.isCheckedIn();
	// 		},
	// 		(error) => {
	// 			console.log(error);
	// 		}
	// 	);
	// }

	onCheckIn() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				console.log(resolve);
				this.router.navigate(['/tabs/profile-selfie'], {
					queryParams: {
						newuser: JSON.stringify(false),
						checkIn: JSON.stringify(true),
					},
				});
			},
			(reject) => {
				console.log(reject);
				console.log('Error getting location');
			}
		);
	}

	/**
	 * * Start Timer Method
	 * @param ischeckIn - Boolean
	 */
	async startCheckInTimer(ischeckIn: boolean) {
		if (ischeckIn) {
			const checkInTime = await this.app.getStorage('checkInTime');
			// var now = new Date();
			// var ms = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(checkInTime,"DD/MM/YYYY HH:mm:ss"));
			let date1 = new Date(checkInTime).getTime();
			let date2 = new Date().getTime();
			let msec = date2 - date1;
			var duration = moment.duration(msec);
			this.timerInterval = setInterval(() => {
				duration.add(1, 'second');
				let time = moment
					.utc(duration.as('milliseconds'))
					.format('HH : mm : ss');
				document.getElementById('timer').innerHTML = time;
			}, 1000);
		}
	}

	stopTimerInterval() {
		clearInterval(this.timerInterval);
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}

	/**
	 * * Past Self-Check View
	 */
	onView(item: any) {
		this.router.navigate(['/health-check-preview'], {
			queryParams: {
				id: JSON.stringify(item.responseId),
				date: JSON.stringify(item.time),
				text: JSON.stringify(item.surveyName),
				cid: JSON.stringify(item.covidStateId),
			},
		});
	}

	redirectToSpaceApp() {
		this.app.openSpaceApp();
	}
}
