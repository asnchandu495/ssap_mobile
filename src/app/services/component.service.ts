import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
	AlertController,
	LoadingController,
	ToastController,
} from '@ionic/angular';

@Injectable({
	providedIn: 'root',
})
export class ComponentService {
	// Properties
	loader: any;
	toast: any;
	isPresentAlertWithURL: boolean = false;

	constructor(
		public alertController: AlertController,
		public loadingController: LoadingController,
		public toastController: ToastController,
		private router: Router
	) {}

	async presentAlert(title: string, msg: string, btnText: string) {
		const alert = await this.alertController.create({
			cssClass: 'custom-alert',
			header: title,
			message: msg,
			backdropDismiss: false,
			buttons: [
				{
					text: btnText,
					role: 'cancel',
					cssClass: 'btn-danger',
					handler: (blah) => {
						console.log('Confirm Cancel: blah');
					},
				},
			],
		});

		await alert.present();
	}

	async presentAlertWithURL(
		title: string,
		msg: string,
		btnText: string,
		url: string
	) {
		this.isPresentAlertWithURL = true;
		const alert = await this.alertController.create({
			cssClass: 'custom-alert',
			header: title,
			message: msg,
			backdropDismiss: false,
			buttons: [
				{
					text: btnText,
					cssClass: 'btn-success',
					handler: () => {
						console.log('Confirm Okay');
						this.isPresentAlertWithURL = false;
						this.router.navigateByUrl(url);
					},
				},
			],
		});

		await alert.present();
	}

	isAlertPresent() {
		return this.isPresentAlertWithURL;
	}

	/**
	 * * Alert For Reason
	 * @returns
	 */
	async presentAlertWithInput(
		headerTitle: string,
		inputType: any,
		btnText: string
	) {
		return new Promise(async (resolve, reject) => {
			let create = {
				cssClass: 'custom-alert custom-alert-input',
				header: `Reason for ${headerTitle}`,
				inputs: [],
				backdropDismiss: false,
				buttons: [
					{
						text: 'Cancel',
						role: 'cancel',
						cssClass: 'btn-danger',
						handler: () => {
							console.log('Confirm Cancel');
							reject(false);
						},
					},
					{
						text: btnText,
						cssClass: 'btn-success',
						handler: (data) => {
							if (headerTitle == 'Rejection') {
								let ppp: boolean, wfhl: boolean;
								for (const key in inputType) {
									if (key == 'ppp') {
										ppp = inputType[key]
											? inputType[key]
											: false;
									}
									if (key == 'wfhl') {
										wfhl = inputType[key]
											? inputType[key]
											: false;
									}
								}
								if (
									(data.ppp == '' && ppp) ||
									(data.wfhl == '' && wfhl)
								) {
									this.presentToast();
									return false;
								} else {
									console.log('Confirm Ok');
									console.log(data);
									resolve(data);
								}
							} else {
								console.log('Confirm Ok');
								console.log(data);
								resolve(data);
							}
						},
					},
				],
			};

			for (const key in inputType) {
				create.inputs.push({
					name: key,
					id: key,
					type: 'textarea',
					cssClass: `${
						inputType[key]
							? 'form-control'
							: 'form-control ion-hide'
					}`,
					placeholder: `Reason for ${key.toUpperCase()}`,
				});
			}

			const alert = await this.alertController.create(create);

			await alert.present();
		});
	}

	/**
	 * * Toast Alert
	 */
	async presentToast() {
		const toast = await this.toastController.create({
			message: 'Please fill out mandatory field',
			keyboardClose: true,
			duration: 3000,
		});
		toast.present();
	}

	/**
	 * Dynamic Toast
	 */
	async dynamicToast(msg: string) {
		this.toast = await this.toastController.create({
			message: msg,
			keyboardClose: true,
		});
		await this.toast.present();
	}

	/**
	 * Dismiss Dynamic Toast
	 */
	async dismissToast() {
		await this.toast.dismiss();
	}

	/**
	 * * Dynamic Loader
	 */
	async presentLoader() {
		this.loader = await this.loadingController.create({
			cssClass: 'custom-loader',
			spinner: 'circles',
			message: 'Please wait...',
			duration: 0,
		});
		await this.loader.present();
	}

	/**
	 * Dismiss Dynamic Loader
	 */
	async dismissLoader() {
		await this.loader.dismiss();
	}

	// async presentAlert(title: string, msg: string, url: string) {
	// 	const alert = await this.alertController.create({
	// 		cssClass: 'custom-alert',
	// 		header: title,
	// 		message: msg,
	// 		buttons: [
	// 			// {
	// 			// 	text: "Cancel",
	// 			// 	role: "cancel",
	// 			// 	cssClass: "btn-danger",
	// 			// 	handler: (blah) => {
	// 			// 		console.log("Confirm Cancel: blah");
	// 			// 	},
	// 			// },
	// 			{
	// 				text: 'Login Now',
	// 				cssClass: 'btn-success',
	// 				handler: () => {
	// 					console.log('Confirm Okay');
	// 					this.router.navigateByUrl(url);
	// 				},
	// 			},
	// 		],
	// 	});

	// 	await alert.present();
	// }

	/**
	 * * Check In Alert With Buttons
	 * @param msg -
	 * @param types -
	 */
	async presentAlertWithButtons(msg: string, types: number) {
		const btn = [
			{
				text: 'OK',
				role: 'cancel',
				cssClass: 'btn-danger',
				handler: (blah) => {
					console.log('Confirm Cancel: blah');
				},
			},
			{
				text: 'Add New PPP',
				cssClass: 'btn-orange',
				handler: () => {
					this.router.navigateByUrl(
						'/tabs/profile-selfie?newuser=false&checkIn=true'
					);
				},
			},
			{
				text: 'Add New WFHL',
				cssClass: 'btn-black',
				handler: () => {
					this.router.navigateByUrl(
						'/tabs/work-location?newuser=false'
					);
				},
			},
		];

		const dynBTN: any = [];
		for (let i = 0; i <= types; i++) {
			dynBTN.push(btn[i]);
		}

		const alert = await this.alertController.create({
			cssClass: 'custom-alert',
			header: 'Oops! Can’t Check-In',
			message: msg,
			backdropDismiss: false,
			buttons: dynBTN,
		});

		await alert.present();
	}

	/**
	 * * Check In Successful
	 * @param msg -
	 */
	async presentAlertWithSuccess(msg: string) {
		const alert = await this.alertController.create({
			cssClass: 'custom-alert',
			header: 'Check-In Successful!',
			message: msg,
			backdropDismiss: false,
			buttons: [
				{
					text: 'OK',
					cssClass: 'btn-success',
					handler: (blah) => {
						this.router.navigateByUrl('/tabs/dashboard');
					},
				},
			],
		});

		await alert.present();
	}

	/**
	 * * Self Check Alert
	 * @param msg -
	 */
	async presentAlertWithEmoji(title: string, msg: string, css: string) {
		let isClass: string;
		let cssBtnClass: string;
		isClass = `custom-alert custom-alert-emoji ${css}`;
		cssBtnClass = `btn-${css}`;
		const alert = await this.alertController.create({
			cssClass: isClass,
			header: title,
			message: msg,
			backdropDismiss: false,
			buttons: [
				{
					text: 'OK',
					cssClass: cssBtnClass,
					handler: (blah) => {
						this.router.navigateByUrl('/tabs/dashboard');
					},
				},
			],
		});

		await alert.present();
	}

	async presentAlertWithEmojiPreview(
		title: string,
		msg: string,
		css: string
	) {
		let isClass: string;
		let cssBtnClass: string;
		isClass = `custom-alert custom-alert-emoji ${css}`;
		cssBtnClass = `btn-${css}`;
		const alert = await this.alertController.create({
			cssClass: isClass,
			header: title,
			message: msg,
			backdropDismiss: false,
			buttons: [
				{
					text: 'Ok',
					role: 'cancel',
					cssClass: cssBtnClass,
					handler: (blah) => {
						console.log('Confirm Cancel: blah');
					},
				},
			],
		});

		await alert.present();
	}

	presentAlertWithConfirm(msg: string) {
		return new Promise(async (resolve, reject) => {
			const alert = await this.alertController.create({
				cssClass: 'custom-alert',
				header: msg,
				backdropDismiss: false,
				buttons: [
					{
						text: 'Yes',
						cssClass: 'btn-success',
						handler: () => {
							console.log('Confirm Okay');
							alert.dismiss();
							resolve(true);
						},
					},
					{
						text: 'No',
						role: 'cancel',
						cssClass: 'btn-danger',
						handler: (blah) => {
							console.log('Confirm Cancel: blah');
							alert.dismiss();
							reject(false);
						},
					},
				],
			});

			await alert.present();
		});
	}
}
