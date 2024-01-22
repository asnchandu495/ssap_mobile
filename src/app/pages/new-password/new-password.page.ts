import { Component, OnInit } from '@angular/core';
import {
	FormControl,
	FormBuilder,
	Validators,
	FormGroup,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-new-password',
	templateUrl: './new-password.page.html',
	styleUrls: ['./new-password.page.scss'],
})
export class NewPasswordPage implements OnInit {
	// Properties
	form: FormGroup;
	showPassword = false;
	showConfirmPassword = false;
	submitted = false;
	showLoader = false;
	minPasswordlength: number = 8;
	errorMessages = {
		nPassword: [],
		cPassword: []
	};

	constructor(
		private fb: FormBuilder,
		private router: Router,
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {
		// Get Global Settings
		this.getGlobalSetting();
		// Reactive Form
		this.form = this.fb.group(
			{
				nPassword: new FormControl(
					'',
					Validators.compose([
						Validators.required,
						Validators.minLength(this.minPasswordlength),
						Validators.maxLength(15),
					])
				),
				cPassword: new FormControl(
					'',
					Validators.compose([
						Validators.required,
						Validators.minLength(this.minPasswordlength),
						Validators.maxLength(15),
					])
				),
			},
			{
				validators: this.password.bind(this),
			}
		);
	}

	ngOnInit() {}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.minPasswordlength = globalsettings['minPasswordlength'];
		this.form.controls['nPassword'].setValidators(
			Validators.compose([
				Validators.required,
				Validators.minLength(this.minPasswordlength),
				Validators.maxLength(15),
			])
		);
		this.form.controls['cPassword'].setValidators(
			Validators.compose([
				Validators.required,
				Validators.minLength(this.minPasswordlength),
				Validators.maxLength(15),
			])
		);
		this.errorMessages = {
			nPassword: [
				{
					type: 'required',
					message: 'Please fill in the mandatory field',
				},
				{
					type: 'minlength',
					message: `Your password should have Minimum ${this.minPasswordlength} characters. At least one special character, upper case and number.`,
				},
				{
					type: 'maxlength',
					message: 'Your password should have Maximum 15 characters.',
				},
			],
			cPassword: [
				{
					type: 'required',
					message: 'Please fill in the mandatory field',
				},
				{
					type: 'minlength',
					message: `Your password should have Minimum ${this.minPasswordlength} characters. At least one special character, upper case and number.`,
				},
				{
					type: 'maxlength',
					message: 'Your password should have Maximum 15 characters.',
				},
			],
		};
	}

	// Password Validator Method
	password(formGroup: FormGroup) {
		const { value: nPassword } = formGroup.get('nPassword');
		const { value: cPassword } = formGroup.get('cPassword');
		return nPassword === cPassword ? null : { passwordNotMatch: true };
	}

	/**
	 * * Password Show/Hide Method
	 */
	onPasswordToggle() {
		this.showPassword = !this.showPassword;
	}

	/**
	 * * Confirm Password Show/Hide Method
	 */
	onConfirmPasswordToggle() {
		this.showConfirmPassword = !this.showConfirmPassword;
	}

	async onSubmit() {
		console.log(this.form);
		this.submitted = true;
		if (this.form.invalid) {
			return;
		} else {
			this.showLoader = true;
			const validID = await this.app.getStorage('validId');
			const params = {
				validId: validID,
				password: this.form.value.nPassword,
				confirmPassword: this.form.value.cPassword,
			};
			console.log(params);
			this.api.resetPassword(params).subscribe(
				(response: any) => {
					console.log(response);
					this.showLoader = false;
					if (response.status === 200) {
						this.app.removeStorage('UserEmail');
						this.app.removeStorage('validId');
						this.component.presentAlertWithURL(
							'Congratulations!',
							'Your new password changed successfully.',
							'Login Now',
							'/login'
						);
					}
				},
				(error) => {
					console.log(error);
					this.showLoader = false;
					if (error.status === 400) {
						let finalErrorMsg = '';
						const messageArray = [error.error.errors];
						for (const i in messageArray) {
							if (
								Object.prototype.hasOwnProperty.call(
									messageArray,
									i
								)
							) {
								for (const key in messageArray[i]) {
									if (
										Object.prototype.hasOwnProperty.call(
											messageArray[i],
											key
										)
									) {
										const getErrorObject = messageArray[i];
										finalErrorMsg += `${getErrorObject[key][0]}. `;
									}
								}
							}
						}
						// this.invalidOTP = true;
						// this.passwordErrorLog = error.error.errors.Password[0];
						this.component.presentAlert('', finalErrorMsg, 'OK');
					}
				}
			);
		}
	}
}
