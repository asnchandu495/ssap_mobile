import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
	FormControl,
	FormBuilder,
	Validators,
	FormGroup,
} from '@angular/forms';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
	// Properties
	form: FormGroup;
	showPassword = false;
	submitted = false;
	invalidUserEmail = false;
	invalidUserPassword = false;
	showLoader = false;
	minPasswordlength: number = 8;
	errorMessages = {
		email: [],
		password: [],
	};

	constructor(
		private fb: FormBuilder,
		private router: Router,
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {
		//Get Global API
		this.app.getGlobalAPI();

		// Reactive Form
		this.form = this.fb.group({
			formEmail: new FormControl(
				'',
				Validators.compose([
					Validators.required,
					Validators.email,
					Validators.minLength(5),
					Validators.maxLength(50),
				])
			),
			formPassword: new FormControl(
				'',
				Validators.compose([
					Validators.required,
					Validators.minLength(this.minPasswordlength),
					Validators.maxLength(15),
				])
			),
		});
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.submitted = false;
		this.form.reset();
		// Get Global Settings
		this.getGlobalSetting();
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		console.log(globalsettings);
		this.minPasswordlength = globalsettings['minPasswordlength'];
		this.form.controls['formPassword'].setValidators(
			Validators.compose([
				Validators.required,
				Validators.minLength(this.minPasswordlength),
				Validators.maxLength(15),
			])
		);
		this.errorMessages = {
			email: [
				{
					type: 'required',
					message: 'Please fill in the mandatory field',
				},
				{
					type: 'minlength',
					message: 'Minimum email length 5 character',
				},
				{
					type: 'maxlength',
					message: 'Maximum email length 50 character',
				},
			],
			password: [
				{
					type: 'required',
					message: 'Please fill in the mandatory field',
				},
				{
					type: 'minlength',
					message: `Minimum password length ${this.minPasswordlength} character`,
				},
				{
					type: 'maxlength',
					message: 'Maximum password length 15 character',
				},
			],
		};
	}

	/**
	 * * Password Show/Hide Method
	 */
	onPasswordToggle() {
		this.showPassword = !this.showPassword;
	}

	ionEmailChange() {
		this.invalidUserEmail = false;
	}

	ionPasswordChange() {
		this.invalidUserPassword = false;
	}

	clearInput(form: any) {
		if (form == 'email') {
			this.form.controls['formEmail'].reset();
		} else if (form == 'password') {
			this.form.controls['formPassword'].reset();
		}
	}

	async onLogIn() {
		this.submitted = true;
		if (this.form.invalid) {
			return;
		} else {
			this.showLoader = true;
			const lockTime = await this.app.getStorage(
				'durationToLockUserAccount'
			);
			const username = this.form.value.formEmail;
			const password = this.form.value.formPassword;
			const params = { emailId: username };
			this.api.authLockout(params).subscribe(
				(response: any) => {
					console.log(response);
					const result = response.body;
					if (result) {
						this.showLoader = false;
						this.component.presentAlert(
							'',
							`Your account is locked due to failed attempts. Please try after ${lockTime} mins.`,
							'OK'
						);
					} else {
						this.api.authLogin(username, password).subscribe(
							(res: any) => {
								this.showLoader = false;
								console.log(res);
								if (res.status === 200) {
									const body = res.body;
									this.api.setAccessToken(body.access_token);
									this.app.setStorage(
										'AccessToken',
										body.access_token
									);
									this.app.setStorage(
										'ExpiresIn',
										body.expires_in
									);
									this.app.setStorage('Scope', body.scope);
									this.app.setStorage(
										'TokenType',
										body.token_type
									);
									this.app.onConcurrentLogin(
										false,
										body.access_token
									);
									this.router.navigateByUrl('/tabs');
								}
							},
							(err) => {
								console.log(err);
								this.showLoader = false;
								this.invalidUserEmail = true;
								this.invalidUserPassword = true;
								if (err.status === 400) {
									this.component.presentAlert(
										'',
										'Invalid Username or Password',
										'OK'
									);
								}
							}
						);
					}
				},
				(error) => {
					console.log(error);
					this.showLoader = false;
					this.invalidUserEmail = true;
					this.invalidUserPassword = true;
					this.component.presentAlert('', error.error.error, 'OK');
				}
			);
		}
	}
}
