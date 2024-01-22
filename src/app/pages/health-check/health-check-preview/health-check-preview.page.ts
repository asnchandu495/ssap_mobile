import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AppService } from '../../../services/app.service';
import { ComponentService } from '../../../services/component.service';
import { forkJoin } from 'rxjs';
import { PinmicroService } from 'src/app/services/pinmicro.service';

@Component({
	selector: 'app-health-check-preview',
	templateUrl: './health-check-preview.page.html',
	styleUrls: ['./health-check-preview.page.scss'],
})
export class HealthCheckPreviewPage implements OnInit {
	// Properties
	items: Array<any> = [];
	date: any;
	createdDate: string;
	createdTime: string;
	surveyName: string;
	displayDateFormat = 'dd/MM/yyyy';
	displayTimeFormat = 'hh:mm a';

	covidState: any;
	colorCode: any;
	stateName: any;

	constructor(
		private route: ActivatedRoute,
		private location: Location,
		public api: ApiService,
		public app: AppService,
		public component: ComponentService,
		public pinmicro: PinmicroService
	) {
		//Get Global Setting
		this.getGlobalSetting();
		this.route.queryParams.subscribe((params) => {
			this.items = [];
			const id = JSON.parse(params.id);
			const cid = JSON.parse(params.cid);
			this.date = JSON.parse(params.date);
			this.surveyName = JSON.parse(params.text);
			this.getALlAnswer(id, cid);
		});
	}

	ngOnInit() {}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.displayDateFormat = globalsettings['dateFormat'];
		this.displayTimeFormat = globalsettings['timeFormat'];

		this.createdDate = this.app.moment(this.date, this.displayDateFormat);
		this.createdTime = this.app.moment(this.date, this.displayTimeFormat);
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}

	getALlAnswer(id: any, cid: any) {
		this.component.presentLoader();
		let forkParams = [];
		const params = `ResponseId=${id}`;
		forkParams.push(this.api.getAllPastAnswers(params));
		forkParams.push(this.api.getCovidStateById(cid));
		forkJoin(forkParams).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result1 = response[0].body;
				const result2 = response[1].body;
				if (response[0].status === 200) {
					this.items = result1;
				}

				if (response[1].status === 200) {
					this.colorCode = result2.colorCode;
					this.stateName = result2.stateName;
					this.covidState = result2;
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
				this.items = [];
			}
		);
	}

	async showMessage() {
		let isTodaysDate = this.app.momentDateCompare(this.date);
		let colorCode = this.covidState.colorCode.toLowerCase();
		if(isTodaysDate && (colorCode == 'green')) {
			this.app.checkBluetoothEnable().then(
				(resolve) => {
					console.log(resolve);
					this.app.checkLocationEnable().then(
						(resolve) => {
							console.log(resolve);
							this.pinmicro.startScanning();
							this.showPoPMessage(this.covidState.stateName, this.covidState.message, this.covidState.colorCode);
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
		}else {
			this.showPoPMessage(this.covidState.stateName, this.covidState.message, this.covidState.colorCode);
		}
	}

	showPoPMessage(stateName: any, message: any, colorCode: any) {
		this.component.presentAlertWithEmojiPreview(
			stateName,
			message,
			colorCode.toLowerCase()
		);
	}

	onBack() {
		this.location.back();
	}
}
