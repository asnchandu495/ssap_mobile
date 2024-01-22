import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInput } from '@ionic/angular';
import { Location } from '@angular/common';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-otp',
	templateUrl: './otp.page.html',
	styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
	// Properties
	@ViewChild('otp1', { static: false }) inputEl: IonInput;
	@ViewChild('otpForm', { static: false }) otpForm: NgForm;
	showLoader = false;
	invalidOTP = false;
	otpErrorLog: string;

	constructor(
		private router: Router,
		private location: Location,
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {}

	ngOnInit() {}

	/**
	 * Focus On First Input Using Ionic(ionViewDidEnter) Method
	 */
	ionViewDidEnter() {
		this.inputEl.setFocus();
	}

	// On Back Btn
	onBack() {
		this.location.back();
	}

	/**
	 * Submit OTP Form
	 */
	onSubmit() {
		this.showLoader = true;
		const otps =
			this.otpForm.value.pin1 +
			this.otpForm.value.pin2 +
			this.otpForm.value.pin3 +
			this.otpForm.value.pin4 +
			this.otpForm.value.pin5 +
			this.otpForm.value.pin6;
		const params = {
			otp: Number(otps),
		};
		this.api.verifyOTP(params).subscribe(
			(response: any) => {
				console.log(response);
				this.showLoader = false;
				const result = response.body;
				if (response.status === 201) {
					this.app.setStorage('validId', result.validId);
					this.router.navigateByUrl('/new-password');
				}
			},
			(error) => {
				console.log(error);
				this.showLoader = false;
				if (error.status === 400) {
					this.invalidOTP = true;
					this.otpErrorLog = error.error.errors.Otp[0];
					this.component.presentAlert(
						'',
						error.error.errors.Otp,
						'OK'
					);
				}
			}
		);
	}

	/**
	 * Resend OTP Method
	 */
	async onResendOTP() {
		this.component.presentLoader();
		const username = await this.app.getStorage('UserEmail');
		const params = { email: username };
		this.api.forgotPassword(params).subscribe(
			(response: any) => {
				this.component.dismissLoader();
				if (response.status === 201) {
					this.otpForm.reset();
					this.invalidOTP = false;
					this.component.presentAlert(
						'',
						'OTP Sent Successfully to your Email',
						'OK'
					);
				}
			},
			(error) => {
				this.component.dismissLoader();
				if (error.status === 400) {
					this.component.presentAlert(
						'',
						'Something went wrong. Please try again.',
						'OK'
					);
				}
			}
		);
	}

	/**
	 * on Key Up From OTP Input
	 * @param event -
	 * @param next -
	 * @param prev -
	 */
	onKeyupOTP(event: any, next: IonInput, prev: IonInput) {
		this.invalidOTP = false;
		if (event.target.value.length < 1 && prev) {
			prev.setFocus();
		} else if (next && event.target.value.length > 0) {
			next.setFocus();
		} else {
			return 0;
		}
	}
}
