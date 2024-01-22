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
	selector: 'app-change-password',
	templateUrl: './change-password.page.html',
	styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
	// Properties
	form: FormGroup;
	showCurrentPassword = false;
	showPassword = false;
	showConfirmPassword = false;
	submitted = false;
	showLoader = false;
	minPasswordlength: number = 8;
	errorMessages = {
		oPassword: [],
		nPassword: [],
		cPassword: [],
	};
	unReadCount: number = 0;

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
				oPassword: new FormControl(
					'',
					Validators.compose([
						Validators.required,
						Validators.minLength(this.minPasswordlength),
						Validators.maxLength(15),
					])
				),
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

	ionViewWillEnter() {
		this.submitted = false;
		this.form.reset();
		this.getUnReadCount();
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.minPasswordlength = globalsettings['minPasswordlength'];
		this.form.controls['oPassword'].setValidators(
			Validators.compose([
				Validators.required,
				Validators.minLength(this.minPasswordlength),
				Validators.maxLength(15),
			])
		);
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
			oPassword: [
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
	 * * Confirm Password Show/Hide Method
	 */
	onCurrentPasswordToggle() {
		this.showCurrentPassword = !this.showCurrentPassword;
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
			const accessToken = await this.app.getStorage('AccessToken');
			const userID = await this.app.getStorage('UserID');
			const params = {
				oldPassword: this.form.value.oPassword,
				newPassword: this.form.value.nPassword,
				confirmPassword: this.form.value.cPassword,
				statusMessage: 'Password Changed',
				userId: userID,
			};
			console.log(params);
			this.api.changePassword(params).subscribe(
				(response: any) => {
					console.log(response);
					this.showLoader = false;
					if (response.status === 200) {
						this.api.authLogout(accessToken).subscribe(
							(response: any) => {
								if (response.status === 200) {
									this.app.clearStorage();
								}
							},
							(error) => {
								if (error.status === 401) {
									this.app.clearStorage();
								}
							}
						);
						this.component.presentAlertWithURL(
							'',
							`Password Changed Successfully. Please login with your New Password`,
							'Ok',
							'/login'
						);
					}
				},
				(errors) => {
					console.log(errors);
					this.showLoader = false;
					const error = JSON.parse(errors.error);
					if (errors.status === 400) {
						this.component.presentAlert(
							'',
							error.error_description,
							'OK'
						);
					}
				}
			);
		}
	}
}
