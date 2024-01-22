import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Router } from '@angular/router';
import { AppService } from './services/app.service';
import { ApiService } from './services/api.service';
import { GeofencingService } from './services/geofencing.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Network } from '@ionic-native/network/ngx';
import { ComponentService } from './services/component.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { HTTP } from '@ionic-native/http/ngx';

declare var IRoot: any;
declare let window: any;

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
	// Properties
	loggedIn: boolean;
	constructor(
		private keyboard: Keyboard,
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		private router: Router,
		private app: AppService,
		private api: ApiService,
		private component: ComponentService,
		private geoFence: GeofencingService,
		private location: Location,
		private androidPermissions: AndroidPermissions,
		private network: Network,
		private backgroundMode: BackgroundMode,
		private clipboard: Clipboard,
		private httpSSL: HTTP
	) {
		this.initializeApp();
		this.backButtonEvent();
		this.loggedIn = true;
	}

	initializeApp() {
		this.platform.ready().then(() => {
			// SSL Enable
			// this.httpSSL
			// .setServerTrustMode('pinned')
			// .then(() => {
			// 	console.log('Congratulaions, you have set up SSL Pinning.');
			// })
			// .catch(() => {
			// 	console.error('Opss, SSL pinning failed.');
			// });

			// if (IRoot) {
			// 	// Check For Rooted Devices
			// 	IRoot.isRooted(
			// 		(data: any) => {
			// 			if (data && data === true) {
			// 				alert(
			// 					'This application can not be used on rooted device.'
			// 				);
			// 				navigator['app'].exitApp();
			// 			} else {
			// 				console.log('This is not rooted device');
			// 			}
			// 		},
			// 		(data: any) => {
			// 			console.log(
			// 				'rooted device detection failed case ' + data
			// 			);
			// 		}
			// 	);
			// }

			this.statusBar.styleLightContent();
			// this.splashScreen.hide();
			// KeyBoard Show
			this.keyboard.onKeyboardWillShow().subscribe((value) => {
				document.body.classList.add('hide-on-keyboard-open');
			});
			// KeyBoard Hide
			this.keyboard.onKeyboardWillHide().subscribe((value) => {
				document.body.classList.remove('hide-on-keyboard-open');
			});

			// Set Background Mode Enable
			this.backgroundMode.setEnabled(true);

			// Disable Screenshot
			// window.plugins.preventscreenshot.disable(
			// 	(res: any) => console.log('preventscreenshot: ' + res),
			// 	(error: any) => console.log('preventscreenshot Error: ' + error)
			// );

			// Check App is backgroundMode
			this.backgroundMode.on('activate').subscribe(() => {
				this.backgroundMode.disableWebViewOptimizations();
				this.clipboard.clear().then(
					(res: any) => console.log('clipboard clear: ' + res),
					(error: any) =>
						console.log('clipboard clear Error: ' + error)
				);
			});

			setInterval(() => {
				console.log('background wakeup....');
				this.backgroundMode.wakeUp();
			}, 300000);

			// watch network for a disconnection
			this.network.onDisconnect().subscribe(() => {
				console.log('network was disconnected :-(');
				this.component.dynamicToast(
					'Please check your Internet Connection'
				);
			});

			// watch network for a connection
			this.network.onConnect().subscribe(() => {
				this.component.dismissToast();
			});

			this.app.getStorage('AccessToken').then((data) => {
				if (data) {
					this.api.setAccessToken(data);
					// Check Token Validity
					this.api.checkTokenValid().subscribe(
						(response: any) => {
							console.log(response);
							if (response.status === 200) {
								this.splashScreen.hide();
								this.router.navigateByUrl('/tabs');
								this.getApplevelPermission();
							}
						},
						(error) => {
							console.log(error);
							this.splashScreen.hide();
							this.router.navigateByUrl('/login');
							this.getApplevelPermission();
						}
					);
				} else {
					this.splashScreen.hide();
					this.router.navigateByUrl('/login');
					this.getApplevelPermission();
				}
			});

			this.isCheckIn();

			this.app.subjectBehaviour.subscribe((res) => {
				if (res) {
					console.log('checked In', res);
					this.geoFence.setInterval();
				} else {
					console.log('checked Out', res);
					this.geoFence.clearInterval();
				}
			});

			// Enable Bluetooth/Location
			this.app.checkBluetoothEnable().then(
				(resolve) => {
					console.log(resolve);
					this.app.checkLocationEnable().then(
						(resolve) => {
							console.log(resolve);
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
		});
	}

	async isCheckIn() {
		const checkedIN = await this.app.getStorage('checkedIN');
		this.app.isCheckedIN(checkedIN);
	}

	getApplevelPermission() {
		this.androidPermissions.requestPermissions([
			'android.permission.ACCESS_BACKGROUND_LOCATION',
			'android.permission.ACCESS_COARSE_LOCATION',
			this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
		]);
	}

	// active hardware back button
	backButtonEvent() {
		this.platform.backButton.subscribe(async () => {
			if (this.router.url === '/tabs/dashboard') {
				// tslint:disable-next-line:no-string-literal
				navigator['app'].exitApp();
			} else if (this.router.url === '/login') {
				// tslint:disable-next-line:no-string-literal
				this.backgroundMode.setEnabled(false);
				navigator['app'].exitApp();
			} else {
				this.location.back();
			}
		});
	}

	ngOnInit() {}
}
