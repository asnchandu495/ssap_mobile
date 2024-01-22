import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { Observable, Subject } from 'rxjs';
declare var window: any;

@Injectable({
	providedIn: 'root',
})
export class PinmicroService {
	// public spotId = new Subject<any>();
	// public spotIdBehaviour = this.spotId.asObservable();

	constructor(public app: AppService) {}

	// isSpotID(param: any) {
	// 	this.spotId.next(param);
	// }

	async beaconInitialize() {
		let referenceId = await this.app.getStorage('rlapUserReferenceId');
		let refID = parseInt(referenceId);
		window.cordova.plugins.PinMicro.beaconInitialize(
			refID,
			function (res: any) {
				console.log(res);
			},
			function (error: any) {
				console.log(error);
			}
		);
		this.app.setStorage('PinMicroInit', true);
		console.log('beaconInitialize');
	}

	startScanning() {
		window.cordova.plugins.PinMicro.startScanning(
			(res: any) => {
				console.log(res);
				if (res == 'OK') {
					console.log('Scanning stopped');
				} else {
					let data = JSON.parse(res);
					if (data.eventType === 'onSpotEntry') {
						if (data.onSpotEntry.length > 0) {
							this.app.isSpotID(data.onSpotEntry[0]);
						}
					}
					if (data.eventType === 'onSpotExit') {
						if (data.onSpotExit.length > 0) {
							this.app.isSpotID('0');
						}
					}
					if (data.eventType === 'onScanResult') {
						if (data.onScanResult.length > 0) {
							this.app.isSpotID(data.onScanResult[0]);
						}
					}
					if (data.eventType === 'onScanFailure') {
						this.startScanning();
					}
				}
			},
			(error: any) => {
				console.log(error);
			}
		);
		this.app.setStorage('PinMicroScanning', true);
		this.app.setStorage('PinMicroScanTime', new Date());
		console.log('startScanning');
	}

	stopScanning() {
		window.cordova.plugins.PinMicro.stopScanning(
			function (res: any) {
				console.log(res);
			},
			function (error: any) {
				console.log(error);
			}
		);
		this.app.removeStorage('PinMicroScanning');
		this.app.removeStorage('PinMicroScanTime');
		console.log('stopScanning');
	}

	resetSDK() {
		window.cordova.plugins.PinMicro.resetSDK();
	}

	async checkShitTimeEnd() {
		const shiftStartTime = await this.app.getStorage('shiftStartTime');
		const shiftEndTime = await this.app.getStorage('shiftEndTime');
		const isSelfCheckTaken: boolean = await this.app.getStorage(
			'isSelfCheckTaken'
		);
		const PinMicroScanning = await this.app.getStorage('PinMicroScanning');
		if (shiftEndTime && PinMicroScanning && isSelfCheckTaken) {
			let endTimeHours = new Date(shiftEndTime).getHours();
			let currentHours = new Date().getHours();
			let endTimeMinutes = new Date(shiftEndTime).getMinutes();
			let currentMinutes = new Date().getMinutes();
			let isNextDay = currentHours == endTimeHours ? true : false;
			if (
				currentHours >= endTimeHours &&
				currentMinutes >= endTimeMinutes &&
				isNextDay
			) {
				console.log('success');
				this.stopScanning();
			}
		}
	}

	disableBattery() {
		window.cordova.plugins.PinMicro.disableBattery();
	}
}
