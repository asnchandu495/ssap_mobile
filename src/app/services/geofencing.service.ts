import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { ApiService } from './api.service';
import { AppService } from './app.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
	BackgroundGeolocation,
	BackgroundGeolocationConfig,
	BackgroundGeolocationEvents,
	BackgroundGeolocationResponse,
} from '@ionic-native/background-geolocation/ngx';

declare var google;

@Injectable({
	providedIn: 'root',
})
export class GeofencingService {
	intervalHandle: any = null;
	latitude: any;
	longitude: any;
	config: BackgroundGeolocationConfig = {
		desiredAccuracy: 1,
		stationaryRadius: 2,
		distanceFilter: 2,
		notificationsEnabled: false,
		startForeground: false,
		debug: false,
		stopOnTerminate: true,
		notificationTitle: 'Geofence Enabled',
		notificationText: 'Your app running in background',
	};
	isGeoFenceBreached: boolean = true;

	constructor(
		private api: ApiService,
		private app: AppService,
		private geolocation: Geolocation,
		private backgroundGeolocation: BackgroundGeolocation
	) {}

	async setInterval() {
		const geoFrequency = await this.app.getStorage('geoFrequency');
		this.config.interval = geoFrequency;
		this.backgroundGeolocation.configure(this.config).then((res) => {
			console.log(res);
			// start recording location
			this.backgroundGeolocation.start();
		});
		this.intervalHandle = interval(geoFrequency).subscribe((x) => {
			console.log('Next: ', x);
			this.app.isAutoCheckOut(); //Auto Check-Out Foreground
			this.checkLocationEnabled();
		});
	}

	clearInterval() {
		if (this.intervalHandle) {
			this.intervalHandle.unsubscribe();
			this.backgroundGeolocation.stop();
		}
	}

	checkLocationEnabled() {
		this.app.checkLocationEnable().then(
			(resolve) => {
				let options = {enableHighAccuracy: true};
				this.geolocation
					.getCurrentPosition(options)
					.then((resp) => {
						this.latitude = resp.coords.latitude;
						this.longitude = resp.coords.longitude;
						this.checkLocationBreach();
					})
					.catch((error) => {
						console.log('Error getting location', error);
					});

				this.backgroundGeolocation
					.on(BackgroundGeolocationEvents.location)
					.subscribe((location: BackgroundGeolocationResponse) => {
						console.log(location);
						this.latitude = location.latitude;
						this.longitude = location.longitude;
						this.checkLocationBreach();
						this.app.isAutoCheckOut(); //Auto Check-Out Background
						this.backgroundGeolocation.finish(); // FOR IOS ONLY
					});
			},
			(reject) => {
				console.log('Error getting location', reject);
				this.reportGeoBreach(
					0,
					0,
					'Error getting location. Maybe User turned off location'
				);
			}
		);
	}

	async checkLocationBreach() {
		const geoFence = await this.app.getStorage('geoFence');
		const lat = await this.app.getStorage('checkInLAT');
		const long = await this.app.getStorage('checkInLONG');
		const from = new google.maps.LatLng(lat, long);
		const to = new google.maps.LatLng(this.latitude, this.longitude);
		const distance = google.maps.geometry.spherical.computeDistanceBetween(
			from,
			to
		);
		let currentDistance = Math.round(distance);
		if (currentDistance <= geoFence) {
			console.log('User inside Geofence');
		} else {
			console.log('User breached Geofence');
			if(this.isGeoFenceBreached) {
				this.isGeoFenceBreached = false;
				this.app.getAddressFromCoords(this.latitude, this.longitude).then(
					(res) => {
						//Geo Breach API
						this.reportGeoBreach(this.latitude, this.longitude, res);
					},
					(err) => {
						this.reportGeoBreach(this.latitude, this.longitude, err);
					}
				);
			}
		}
	}

	/**
	 * * Report Geo Breach
	 * @param lat
	 * @param long
	 * @param address
	 */
	reportGeoBreach(lat: any, long: any, address: any) {
		//Geo Breach API
		const params = {
			id: '',
			latitude: lat,
			longitude: long,
			location: address,
		};
		this.api.geoBreach(params).subscribe(
			(response: any) => {
				console.log(response);
				this.isGeoFenceBreached = true;
			},
			(error) => {
				console.log(error);
				this.isGeoFenceBreached = true;
			}
		);
	}
}
