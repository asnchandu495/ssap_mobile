import { Component, OnInit } from '@angular/core';
import {
	FormControl,
	FormBuilder,
	Validators,
	FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../../services/app.service';
import { ApiService } from '../../services/api.service';
import { ComponentService } from '../../services/component.service';

@Component({
	selector: 'app-forget-password',
	templateUrl: './forget-password.page.html',
	styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
	// Properties
	form: FormGroup;
	submitted = false;
	invalidUser = false;
	showLoader = false;
	isNewUser: boolean;
	errorMessages = {
		email: [
			{ type: 'required', message: 'Please fill in the mandatory field' },
			{ type: 'minlength', message: 'Minimum email length 5 character' },
			{ type: 'maxlength', message: 'Maximum email length 50 character' },
		],
	};

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		public app: AppService,
		public api: ApiService,
		public component: ComponentService
	) {
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
		});

		this.route.queryParams.subscribe((params) => {
			this.isNewUser = JSON.parse(params.isNewUser);
		});
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.submitted = false;
		this.form.reset();
	}

	ionInputChange() {
		this.invalidUser = false;
	}

	clearInput() {
		this.form.reset();
	}

	/**
	 * Submit Form Method
	 */
	onSubmit() {
		this.submitted = true;
		if (this.form.invalid) {
			return;
		} else {
			this.showLoader = true;
			const username = this.form.value.formEmail;
			if (this.isNewUser) {
				this.api.checkFirstTimeUser(username).subscribe(
					(response: any) => {
						console.log(response);
						const result = response.body;
						if (response.status === 200) {
							if (result.isFirstTimeLogin) {
								this.forgetPassword(username);
							} else {
								this.showLoader = false;
								this.form.reset();
								this.component.presentAlertWithURL(
									'',
									'Password is already set for your account. Reset your password if forgotten',
									'OK',
									'/login'
								);
							}
						} else if (response.status === 204) {
							this.showLoader = false;
							this.invalidUser = true;
							this.component.presentAlert(
								'',
								"User doesn't exist",
								'OK'
							);
						}
					},
					(error) => {
						this.showLoader = false;
						if (error.status === 400) {
							this.component.presentAlert(
								'',
								'Please try again',
								'OK'
							);
						}
					}
				);
			} else {
				this.forgetPassword(username);
			}
		}
	}

	forgetPassword(username: any) {
		const params = { email: username };
		this.api.forgotPassword(params).subscribe(
			(response: any) => {
				this.showLoader = false;
				const result = response.body;
				console.log(response);
				if (response.status === 201) {
					this.app.setStorage('UserEmail', username);
					this.router.navigateByUrl('/otp');
				}
			},
			(error) => {
				this.showLoader = false;
				this.invalidUser = true;
				if (error.status === 400) {
					this.component.presentAlert(
						'',
						error.error.errors.ApplicationUser[0],
						'OK'
					);
				}
			}
		);
	}
}
