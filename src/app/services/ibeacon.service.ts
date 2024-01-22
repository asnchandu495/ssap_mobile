import { Injectable } from '@angular/core';
import { IBeacon, IBeaconPluginResult } from '@ionic-native/ibeacon/ngx';
import { Platform } from '@ionic/angular';
import { AppService } from './app.service';
import { ApiService } from './api.service';
import { PinmicroService } from './pinmicro.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Injectable({
	providedIn: 'root',
})
export class IbeaconService {
	// Properties
	uuid = '4cb95aa6-9c3c-4bc5-8d3d-7f48c7264d43';
	beaconData = [];
	beaconUuid: String;
	scanStatus: boolean = false;
	private delegate: any = null;
	public beaconRegion: any = null;
	public iosDevice: boolean = false;
	auther: any;
	buke: any;
	inputdata: any;
	advertinputdata: any;
	alertMessage: any;
	spotId: any = '0';
	isIndoor: boolean = false;

	constructor(
		public ibeacon: IBeacon,
		public platform: Platform,
		public app: AppService,
		public api: ApiService,
		public pinmicro: PinmicroService,
		private backgroundMode: BackgroundMode,
	) {
		// Get SPOT ID
		this.app.spotIdBehaviour.subscribe((res) => {
			console.log('Spot ID Subscribe:' + res);
			this.spotId = res;
			this.isIndoor = res == '0' ? false : true;
			console.log(this.spotId);
			console.log(this.isIndoor);
		});
	}

	requestLocPermissoin(): void {
		// Request permission to use location on iOS
		if (this.platform.is('ios')) {
			this.ibeacon.requestAlwaysAuthorization();
			console.log(`: request ios permisson`);
		}
	}

	async watch() {
		let majorCode = await this.app.getStorage('majorCode');
		let minorCode = await this.app.getStorage('minorCode');

		console.log('watch Method Alert');
		// create a new delegate and register it with the native layer
		this.delegate = this.ibeacon.Delegate();

		this.ibeacon.setDelegate(this.delegate);

		this.ibeacon.getAuthorizationStatus().then(
			(data) => (this.auther = data.authorizationStatus),
			(error) => console.error(error)
		);
		this.platform.ready().then(() => {
			this.ibeacon.isBluetoothEnabled().then(
				() => (this.buke = this.ibeacon.isBluetoothEnabled()),
				(error) => console.error(error)
			);

			// Verify the platform supports transmitting as a beacon
			this.ibeacon.isAdvertisingAvailable().then(
				(isSupported) => {
					if (isSupported) {
						this.ibeacon
							.startAdvertising(
								this.ibeacon.BeaconRegion(
									'deskBeacon',
									'4cb95aa6-9c3c-4bc5-8d3d-7f48c7264d43',
									majorCode,
									minorCode
								)
							)
							.then(
								() =>
									(this.inputdata =
										'yay!' + console.log('yay! task done')),
								(error) => console.error(error)
							);
					} else {
						console.log('Advertising not supported');
					}
				},
				(error) => {
					console.log('Advertising not supported.');
				}
			);

			this.ibeacon.isAdvertising().then(
				() => (this.advertinputdata = this.ibeacon.isAdvertising()),
				(error) => console.error(error)
			);

			// Event when advertising starts (there may be a short delay after the request)
			// The property 'region' provides details of the broadcasting Beacon
			this.delegate
				.peripheralManagerDidStartAdvertising()
				.subscribe((pluginResult) => {
					console.log(
						'peripheralManagerDidStartAdvertising: ' +
							JSON.stringify(pluginResult.region)
					);
				});
			// Event when bluetooth transmission state changes
			// If 'state' is not set to BluetoothManagerStatePoweredOn when advertising cannot start
			this.delegate
				.peripheralManagerDidUpdateState()
				.subscribe((pluginResult) => {
					console.log(
						'peripheralManagerDidUpdateState: ' +
							JSON.stringify(pluginResult.state)
					);
				});
		});
	}

	public stopScannning(): void {
		// stop ranging
		this.ibeacon
			.stopRangingBeaconsInRegion(this.beaconRegion)
			.then(async () => {
				console.log(
					`Stopped ranging beacon region:`,
					this.beaconRegion
				);
			})
			.catch((error: any) => {
				console.log(
					`Failed to stop ranging beacon region: `,
					this.beaconRegion
				);
			});
	}

	async startScanning() {
		let majorCode = await this.app.getStorage('majorCode');
		let minorCode = await this.app.getStorage('minorCode');

		// create a new delegate and register it with the native layer
		this.delegate = this.ibeacon.Delegate();

		this.ibeacon.setDelegate(this.delegate);

		this.beaconUuid = this.uuid;

		console.log(
			'--===--- Bluetooth state: ',
			this.ibeacon.isBluetoothEnabled()
		);

		// Check bluetooth status Y.Q
		this.ibeacon.isBluetoothEnabled().then(
			(data) => console.log('-------=== Enabled', data),
			(error: any) => console.error('-------=== Disabled', error)
		);

		var storedRecord = [];
		// Subscribe to some of the delegate's event handlers
		this.delegate.didRangeBeaconsInRegion().subscribe(
			async (pluginResult: IBeaconPluginResult) => {
				const PinMicroScanning = await this.app.getStorage(
					'PinMicroScanning'
				);
				if (PinMicroScanning) {
					this.pinmicro.checkShitTimeEnd();
				}
				if (pluginResult.beacons.length > 0) {
					this.beaconData = [];
					this.beaconData = pluginResult.beacons;
					console.log(JSON.stringify(pluginResult.beacons));
					// alert(JSON.stringify(pluginResult.beacons));
					// var userId = await this.app.getStorage('UserID');
					var socialDistance = await this.app.getStorage(
						'socialDistance'
					);
					this.beaconData.forEach((element) => {
						if (element.accuracy <= socialDistance) {
							let id = element.major + element.minor;
							let storeNewRecord = false;
							let isUserFound = storedRecord.some(
								(item) => item.id == id
							);
							if (isUserFound) {
								var result = storedRecord.find((obj) => {
									return obj.id === id;
								});
								console.log(JSON.stringify(new Date()));
								console.log(JSON.stringify(result.date));
								if (new Date() >= result.date) {
									storeNewRecord = true;
									var index = storedRecord.findIndex(
										(obj) => {
											return obj.id === id;
										}
									);
									storedRecord[index].id = id;
									storedRecord[index].date = new Date(
										new Date().getTime() + 1 * 60000
									);
								} else {
									storeNewRecord = false;
								}
							} else {
								storeNewRecord = true;
								storedRecord.push({
									id: id,
									date: new Date(
										new Date().getTime() + 1 * 60000
									),
								});
							}

							if (storeNewRecord) {
								this.app
									.getCurrentLocation()
									.then((resp: any) => {
										var latitude = resp.coords.latitude;
										var longitude = resp.coords.longitude;
										this.app
											.getAddressFromCoords(
												latitude,
												longitude
											)
											.then(
												(res) => {
													//Capture Proximity API
													this.captureProximity(
														majorCode,
														minorCode,
														element.major,
														element.minor,
														res,
														this.spotId,
														this.isIndoor
													);
												},
												(err) => {
													//Capture Proximity API
													this.captureProximity(
														majorCode,
														minorCode,
														element.major,
														element.minor,
														err,
														this.spotId,
														this.isIndoor
													);
												}
											);
									})
									.catch((error) => {
										console.log(
											'Error getting location',
											error
										);
									});
									this.backgroundMode.wakeUp();
									// this.backgroundMode.moveToForeground();
									console.log('didRangeBeaconsInRegion: ', pluginResult);
									console.log('wake up app on background');
							}
						}
					});
				} else {
					console.log('no beacons nearby');
				}
			},
			(error: any) => console.error(`Failure during ranging: `, error)
		);

		this.delegate.didStartMonitoringForRegion().subscribe(
			(pluginResult: IBeaconPluginResult) =>
				console.log('didStartMonitoringForRegion: ', pluginResult),
			(error: any) =>
				console.error(`Failure during starting of monitoring: `, error)
		);

		console.log(`Creating BeaconRegion with UUID of: `, this.uuid);

		// uuid is required, identifier and range are optional.
		this.beaconRegion = this.ibeacon.BeaconRegion('deskBeacon', this.uuid);

		this.ibeacon.startMonitoringForRegion(this.beaconRegion).then(
			() =>
				console.log('Native layer recieved the request to monitoring'),
			(error: any) =>
				console.error(
					'Native layer failed to begin monitoring: ',
					error
				)
		);

		this.ibeacon
			.startRangingBeaconsInRegion(this.beaconRegion)
			.then(() => {
				console.log(
					`Started ranging beacon region: `,
					this.beaconRegion
				);
			})
			.catch((error: any) => {
				console.error(
					`Failed to start ranging beacon region: `,
					this.beaconRegion
				);
			});
	}

	/**
	 * * Social Distancing Breach API Call Method
	 * @param userMajorId
	 * @param userMinorId
	 * @param contactMajorId
	 * @param contactMinorId
	 * @param address
	 */
	captureProximity(
		userMajorId: any,
		userMinorId: any,
		contactMajorId: any,
		contactMinorId: any,
		address: any,
		locationId: any,
		isIndoor: boolean
	) {
		let contactUserMajorId = parseInt(contactMajorId);
		let contactUserMinorId = parseInt(contactMinorId);
		let params = {
			userMajorId: userMajorId,
			userMinorId: userMinorId,
			contactMajorId: contactUserMajorId,
			contactMinorId: contactUserMinorId,
			location: address,
			locationId: locationId,
			isIndoor: isIndoor,
		};
		this.api.captureUserProximity(params).subscribe(
			(response: any) => {
				if (response.status === 201) {
					console.log('capture proximity api success');
				}
			},
			(error) => {
				console.log(error);
			}
		);
	}
}
