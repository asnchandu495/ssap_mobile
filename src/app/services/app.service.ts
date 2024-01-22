import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Storage } from '@ionic/storage';
import {
	NativeGeocoder,
	NativeGeocoderResult,
	NativeGeocoderOptions,
} from '@ionic-native/native-geocoder/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

import * as moment from 'moment';

@Injectable({
	providedIn: 'root',
})
export class AppService {
	// Properties
	public subject = new Subject<boolean>();
	public subjectBehaviour = this.subject.asObservable();

	public role = new Subject<boolean>();
	public roleBehaviour = this.role.asObservable();

	public spotId = new Subject<any>();
	public spotIdBehaviour = this.spotId.asObservable();

	options : InAppBrowserOptions = {
		location : 'no',//Or 'no'
		hidden : 'no', //Or  'yes'
		clearcache : 'yes',
		clearsessioncache : 'yes',
		zoom : 'no',//Android only ,shows browser zoom controls
		hardwareback : 'yes',
		mediaPlaybackRequiresUserAction : 'no',
		shouldPauseOnSuspend : 'no', //Android only
		closebuttoncaption : 'Close', //iOS only
		disallowoverscroll : 'no', //iOS only
		toolbar : 'yes', //iOS only
		enableViewportScale : 'no', //iOS only
		allowInlineMediaPlayback : 'no',//iOS only
		presentationstyle : 'pagesheet',//iOS only
		fullscreen : 'yes',//Windows only
	};
	inAppBrowser: any;

	constructor(
		public alertController: AlertController,
		public platform: Platform,
		private camera: Camera,
		private diagnostic: Diagnostic,
		private storage: Storage,
		private nativeGeocoder: NativeGeocoder,
		private geolocation: Geolocation,
		private api: ApiService,
		private router: Router,
		private iab: InAppBrowser
	) {}

	isCheckedIN(param: any) {
		this.subject.next(param);
	}

	isSupervisor(param: any) {
		this.role.next(param);
	}

	isSpotID(param: any) {
		this.spotId.next(param);
	}

	/**
	 * * Capture Picture
	 */
	capturePicture() {
		return new Promise((resolve, reject) => {
			const options: CameraOptions = {
				quality: 75,
				destinationType: this.camera.DestinationType.DATA_URL,
				sourceType: this.camera.PictureSourceType.CAMERA,
				encodingType: this.camera.EncodingType.JPEG,
				mediaType: this.camera.MediaType.PICTURE,
				cameraDirection: this.camera.Direction.FRONT,
				saveToPhotoAlbum: false,
				correctOrientation: true,
			};

			this.camera.getPicture(options).then(
				(imageData) => {
					resolve(imageData);
				},
				(err) => {
					reject(err);
				}
			);
		});
	}

	/**
	 * * Check Location Enabled or Not
	 */
	checkLocationEnable() {
		return new Promise((resolve, reject) => {
			this.diagnostic
				.isLocationEnabled()
				.then(async (isAvailable) => {
					if (!isAvailable) {
						const alert = await this.alertController.create({
							cssClass: 'custom-alert',
							header: 'GPS',
							message: 'Please enable your GPS',
							backdropDismiss: false,
							buttons: [
								{
									text: 'Ok',
									cssClass: 'btn-success',
									handler: () => {
										if (this.platform.is('android')) {
											this.diagnostic.switchToLocationSettings();
											reject(false);
										} else {
											this.diagnostic.requestLocationAuthorization();
											reject(false);
										}
									},
								},
							],
						});
						await alert.present();
					} else {
						resolve(true);
					}
				})
				.catch((e) => {
					console.log(e);
					reject(false);
				});
		});
	}

	/**
	 * Check Bluetooth Enabled or Not
	 */
	checkBluetoothEnable() {
		return new Promise((resolve, reject) => {
			this.diagnostic
				.isBluetoothAvailable()
				.then(async (isAvailable) => {
					if (!isAvailable && this.platform.is('android')) {
						const alert = await this.alertController.create({
							cssClass: 'custom-alert',
							header: 'Bluetooth',
							message: 'Please enable your Bluetooth',
							backdropDismiss: false,
							buttons: [
								{
									text: 'Ok',
									cssClass: 'btn-success',
									handler: () => {
										if (this.platform.is('android')) {
											this.diagnostic.switchToBluetoothSettings();
											resolve(true);
										} else {
											this.diagnostic.requestBluetoothAuthorization().then(
												() => {
													resolve(true);
												},
												(error) => {
													resolve(true);
												}
											);
										}
									},
								},
							],
						});
						await alert.present();
					} else {
						resolve(true);
					}
				})
				.catch((e) => {
					console.log(e);
					reject(false);
				});
		});
	}

	/**
	 * * Get Current Address from Coords
	 * @param latitude - user current lat
	 * @param longitude - user current long
	 */
	getAddressFromCoords(latitude: any, longitude: any) {
		return new Promise((resolve, reject) => {
			const options: NativeGeocoderOptions = {
				useLocale: true,
				maxResults: 5,
			};
			this.nativeGeocoder
				.reverseGeocode(latitude, longitude, options)
				.then((result: NativeGeocoderResult[]) => {
					const responseAddress = [];
					for (const [key, value] of Object.entries(result[0])) {
						if (value.length > 0) {
							responseAddress.push(value);
						}
					}
					responseAddress.pop();
					responseAddress.reverse();
					let address = responseAddress.join(', ');
					resolve(address);
				})
				.catch(() => {
					reject('Address Not Available!');
				});
		});
	}

	/**
	 * * Get Current LAT/LONG
	 * @returns -
	 */
	getCurrentLocation() {
		return new Promise((resolve, reject) => {
			let options = { enableHighAccuracy: true };
			this.geolocation
				.getCurrentPosition(options)
				.then((resp) => {
					resolve(resp);
				})
				.catch((error) => {
					reject('Error getting location');
					console.log('Error getting location', error);
				});
		});
	}

	/**
	 * Set Storage Global Method
	 * @param key - string
	 * @param value - string
	 */
	setStorage(key: string, value: any) {
		// set a key/value
		this.storage.set(key, value);
	}

	/**
	 * Get Storage Global Method
	 * @param key - string
	 */
	getStorage(key: string) {
		// Or to get a key/value pair
		return this.storage.get(key);
	}

	/**
	 * Remove Storage Global Method
	 * @param key - string
	 */
	removeStorage(key: string) {
		// Or to remove a key/value pair
		this.storage.remove(key);
	}

	/**
	 * Clear Storage Global Method
	 */
	clearStorage() {
		this.storage.clear();
	}

	getGlobalAPI() {
		this.api.getGlobalSettings().subscribe(
			(response: any) => {
				console.log(response);
				const result = response.body;
				if (response.status === 200) {
					this.setStorage('dateFormat', result.dateFormat);
					this.setStorage('timeFormat', result.timeFormat);
					// if (result.timeFormat == '12 Hours') {
					// 	this.setStorage('timeFormat', 'h:mm A');
					// 	this.setStorage('timeFormatPipe', 'hh:mm a');
					// } else if (result.timeFormat == '24 Hours') {
					// 	this.setStorage('timeFormat', 'H:mm');
					// 	this.setStorage('timeFormatPipe', 'HH:mm');
					// }
					this.setStorage(
						'maxFileSizeSelfie',
						result.maximumFileSizeOfUserSelfie
					);
					this.setStorage(
						'minPasswordlength',
						result.maxPasswordlength
					);
					this.setStorage(
						'automatedCheckoutTime',
						result.automatedCheckoutTime
					);
					this.setStorage(
						'durationToLockUserAccount',
						result.durationToLockUserAccount
					);
					// Geo Frequency
					const frequencyUnit = result.frequencyOfGeoLocationUnit;
					const frequency = result.frequencyOfGeoLocation;
					if (frequencyUnit === 'Seconds') {
						const totFrequency = frequency * 1000;
						this.setStorage('geoFrequency', totFrequency);
					} else if (frequencyUnit === 'Minutes') {
						const totFrequency = frequency * 60 * 1000;
						this.setStorage('geoFrequency', totFrequency);
					}

					// Geo Fencing
					const toleranceUnit = result.geoFencingToleranceUnit;
					const tolerance = result.geoFencingTolerance;
					if (toleranceUnit === 'Feet') {
						const tolMeters = tolerance * 0.3048;
						this.setStorage('geoFence', Math.round(tolMeters));
					} else if (toleranceUnit === 'Meter') {
						this.setStorage('geoFence', tolerance);
					}

					// SelfCheck Reminder
					const unit = result.selfHealthCheckReminderUnit;
					const time = result.selfHealthCheckReminder;
					if (unit === 'Minute') {
						const totTime = time * 0.0166667;
						this.setStorage('selfHealthReminder', totTime);
					} else if (unit === 'Hours') {
						this.setStorage('selfHealthReminder', time);
					}

					// Social Distancing
					const socialUnit = result.socialDistanceToleranceUnit;
					const social = result.socialDistanceTolerance;
					if (socialUnit === 'Feet') {
						const tolMeters = social * 0.3048;
						this.setStorage(
							'socialDistance',
							Math.round(tolMeters)
						);
					} else if (socialUnit === 'Meter') {
						this.setStorage('socialDistance', social);
					}
				}
			},
			(error) => {
				console.log(error);
			}
		);
	}

	async getGlobalSettings() {
		let settings = {};
		settings['timeFormat'] = await this.getStorage('timeFormat');
		settings['dateFormat'] = await this.getStorage('dateFormat');
		settings['minPasswordlength'] = await this.getStorage(
			'minPasswordlength'
		);
		// settings['timeFormatPipe'] = await this.getStorage('timeFormatPipe');
		// if (dateFormat == 'dd/mm/yyyy') {
		// 	settings['dateFormatPipe'] = 'dd/MM/yyyy';
		// } else if (dateFormat == 'mm/dd/yyyy') {
		// 	settings['dateFormatPipe'] = 'MM/dd/yyyy';
		// }
		// settings['dateFormat'] = dateFormat;
		return settings;
	}

	moment(date: any, format: any) {
		return moment(date).format(format);
	}

	// Auto Checkout
	async isAutoCheckOut() {
		const checkedIN = await this.getStorage('checkedIN');
		let isCheckedIn = checkedIN ? checkedIN : false;

		if (isCheckedIn) {
			const autoCheckOutTime = await this.getStorage(
				'automatedCheckoutTime'
			);
			const locationID = await this.getStorage('checkInID');
			const lat = await this.getStorage('checkInLAT');
			const long = await this.getStorage('checkInLONG');
			const checkInTime = await this.getStorage('checkInTime');

			let date1 = new Date(checkInTime).getTime();
			let date2 = new Date().getTime();
			let msec = date2 - date1;
			let mins = Math.floor(msec / 60000);
			let hrs = Math.floor(mins / 60);

			if (hrs >= autoCheckOutTime) {
				console.log('Auto Checkout');
				this.autoCheckOut(locationID, lat, long);
			}
		}
	}

	// Auto Check-Out API Method
	autoCheckOut(locationId: any, lat: any, long: any) {
		const params = {
			location: locationId,
			latitude: lat,
			longitude: long,
		};
		this.api.checkOut(params).subscribe(
			(response: any) => {
				this.isCheckedIN(null);
				this.removeStorage('checkedIN');
				this.removeStorage('checkInLAT');
				this.removeStorage('checkInLONG');
				this.removeStorage('checkInID');
				this.removeStorage('checkInTime');
				this.router.navigateByUrl('/tabs/dashboard?isCheckOut=true');
			},
			(error) => {
				console.log(error);
			}
		);
	}

	// Time Format for Notification
	momentTime(date: any) {
		return moment(date).fromNow();
	}

	momentDateCompare(date: any) {
		return moment(new Date()).isSame(date, 'day');
	}

	// momentTimeCompare(date: any) {
	// 	console.log(date);
	// 	return moment().isSameOrAfter(date);
	// }

	//Concurrent Login
	onConcurrentLogin(param: boolean, token: string) {
		let params = {
			isLoggedOut: param,
		};
		this.api.conCurrentLoginAuth(params, token).subscribe(
			(response: any) => {
				console.log('onConcurrentLogin success');
			},
			(error) => {
				console.log(error);
			}
		);
	}

	async openSpaceApp() {
		console.log('Open InApp Browser');
		let accessToken = await this.getStorage('AccessToken');
		let city = await this.getStorage('city');
		let emailId = await this.getStorage('emailID');
		this.inAppBrowser = this.iab.create('https://sld.digitalblanket.io/cs_webui/', '_blank', this.options);
		this.inAppBrowser.on('loadstart').subscribe(event => {
			console.log('loadstart', event);
			if(event.url === 'https://com.sumeru.ssap/close') {
                this.inAppBrowser.close();
            }else if(event.url === 'https://com.sumeru.ssap/sessionexpired') {
                this.inAppBrowser.close();
                this.router.navigate(['/login'], { replaceUrl: true });
            }
		});
		this.inAppBrowser.on('loadstop').subscribe(event => {
			console.log('loadstop', event);
			this.inAppBrowser.executeScript({ code: 'initDeskBookingFunction("'+city+'","'+emailId+'","'+accessToken+'");'
    		});
			// this.inAppBrowser.executeScript({ code: 'initDeskBookingFunction(1,"dev2@flamencotech.com","5e801337-734c-41fa-a273-5881e1121b87");'
    		// });
		});
	}
}
