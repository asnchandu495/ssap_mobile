import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ApiService } from './api.service';
import { ComponentService } from './component.service';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class FcmService {
	constructor(
		public api: ApiService,
		private firebaseX: FirebaseX,
		public component: ComponentService,
		private router: Router
	) {}

	generateFCMToken() {
		this.firebaseX.grantPermission().then(() =>{
			console.log("firebaseX Successfully requested remote notifications authorization");
		},(err) => {
			console.error("firebaseX Error requesting remote notifications authorization: " + err);
		});

		this.firebaseX
			.getToken()
			.then((token) => {
				console.log(`The token is ${token}`);
				let params = {
					token: token,
				};
				this.api.saveFCMToken(params).subscribe(
					(response: any) => {
						console.log(response);
						if (response.status === 200) {
							console.log('Token Stored in DB');
						}
					},
					(error) => {
						console.log(error);
					}
				);
			})
			.catch((error) => {
				console.error('Error getting token', error);
			});

		this.firebaseX.onMessageReceived().subscribe((data) => {
			console.log(`User opened a notification ${JSON.stringify(data)}`);
			if(data.alertType == 'AlertToContact') {
				this.router.navigateByUrl('/tabs/notification');
			}
			// this.component.dynamicToast(data.body);
		});
	}

	unRegister() {
		this.firebaseX.setAutoInitEnabled(false).then(() => {
			console.log("Auto init has been disabled ");
			this.firebaseX.unregister();
		})
		.catch((error) => {
			console.log("Auto init has been disabled ");
			this.firebaseX.unregister();
		});
	}

	// onMessageReceived() {
	// 	this.firebaseX
	// 		.onMessageReceived()
	// 		.subscribe((data) =>
	// 			console.log(`User opened a notification ${data}`)
	// 		);
	// }
}
