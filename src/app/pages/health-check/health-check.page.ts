import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AppService } from '../../services/app.service';
import { ComponentService } from '../../services/component.service';
import { AlertController } from '@ionic/angular';

@Component({
	selector: 'app-health-check',
	templateUrl: './health-check.page.html',
	styleUrls: ['./health-check.page.scss'],
})
export class HealthCheckPage implements OnInit {
	// Properties
	// New Tab
	@ViewChild(IonContent, { static: false }) content: IonContent;
	selectedTab = 'new';
	// questions: Array<any> = [];
	question: Array<any> = [];
	answers: Array<any> = [];
	reCheckAnswers: Array<any> = [];
	singleSelectId: null;
	optionSetId: null;
	multiSelectIds: Array<any> = [];
	showSubmitBtn: boolean = false;
	isSurveyEnd: boolean = false;

	// Pro
	surveyID: string;
	showLoader = false;
	showLoaderReCheck = false;

	// Past Tab
	datepickerFormat = 'MMM DD YYYY';
	timepickerFormat = 'hh:mm A';

	datedisplayFormat = 'DD/MM/YYYY';
	timedisplayFormat = 'hh:mm a';

	dateFormatPipe = 'dd/MM/yyyy';
	timeFormatPipe = 'hh:mm a';

	fromDate: String = new Date().toISOString();
	toDate: String = new Date().toISOString();
	items: Array<any> = [];
	ionChangeDate: boolean = false;

	isSelfCheckTaken: boolean;
	noSurveyForUser: boolean = false;

	unReadCount: number = 0;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public api: ApiService,
		public app: AppService,
		public component: ComponentService,
		public alertController: AlertController
	) {
		//Get Global Setting
		this.getGlobalSetting();
		this.route.queryParams.subscribe((params) => {
			this.isSelfCheckTaken = JSON.parse(params.isSelfCheckTaken);
			this.selectedTab = params.selectedTab;
			this.ionChangeDate = false;
			if (this.selectedTab == 'past') {
				this.items = [];
				this.getPastCheckUps();
			}
		});
	}

	/**
	 * * Get Global Setting
	 */
	async getGlobalSetting() {
		let globalsettings = await this.app.getGlobalSettings();
		this.dateFormatPipe = globalsettings['dateFormat'];
		this.timeFormatPipe = globalsettings['timeFormat'];

		this.datedisplayFormat = globalsettings['dateFormat'].toUpperCase();
		this.timedisplayFormat = globalsettings['timeFormat'];
	}

	transformDate(date: any, format: any) {
		return this.app.moment(date, format);
	}

	ngOnInit() {}

	ionViewWillEnter() {
		this.getUnReadCount();

		if (!this.isSelfCheckTaken) {
			this.question = [];
			this.answers = [];
			this.reCheckAnswers = [];
			this.singleSelectId = null;
			this.multiSelectIds = [];
			this.showSubmitBtn = false;
			this.isSurveyEnd = false;
			this.surveyID = '';

			// Get Survey ID
			this.getSurveyId();
		}
	}

	ionViewWillLeave() {
		this.ionChangeDate = false;
		this.noSurveyForUser = false;
		// this.app.removeStorage('SurveyResponseId');
	}

	/**
	 * Get UnRead Count
	 */
	async getUnReadCount() {
		this.unReadCount = await this.app.getStorage('unReadCount');
	}

	/**
	 * * Get Survey ID
	 */
	getSurveyId() {
		if (this.selectedTab == 'new') {
			this.component.presentLoader();
		}
		this.api.getSurveyId().then(
			(response: any) => {
				if (response.status === 200) {
					const result = response.body;
					console.log(response);
					this.surveyID = result.surveyId;
					// Create Response ID
					this.createResponseForSurvey();
				} else if (response.status === 204) {
					this.noSurveyForUser = true;
					this.component.dismissLoader();
				}
			},
			(error) => {
				// this.component.dismissLoader();
				console.log(error);
			}
		);
	}

	/**
	 * * Create Respose ID For Answering
	 */
	async createResponseForSurvey() {
		const responseId = await this.app.getStorage('SurveyResponseId');
		if (!responseId) {
			const suveryId = { surveyId: this.surveyID };
			this.api.addResponse(suveryId).subscribe(
				(response: any) => {
					if (response.status === 201) {
						const result = response.body;
						console.log(response);
						this.app.setStorage('SurveyResponseId', result.id);
						// Get First Question
						this.getFirstQuestion();
					}
				},
				(error) => {
					this.component.dismissLoader();
					if (error.status === 400) {
						console.log(error.error.errors.ResponseBase[0]);
						// this.component.presentAlert(
						// 	'',
						// 	error.error.errors.ResponseBase[0],
						// 	'OK'
						// );
					}
				}
			);
		} else if (responseId) {
			// Get First Question
			this.getFirstQuestion();
		}
	}

	/**
	 * * Get Default First Question
	 */
	getFirstQuestion() {
		this.api.getFirstQuestion(this.surveyID).subscribe(
			(response: any) => {
				this.component.dismissLoader();
				if (response.status === 200) {
					const result = response.body;
					console.log(response);
					let question = result['question'];
					if (question) {
						question.isReCheck = false;
						question.isBtnDisabled = false;
						if (question.questionType == 'SingleChoice') {
							const surveyResponseChoices =
								question.surveyResponseChoices.map(
									(data: any) => {
										return { ...data, isChecked: false };
									}
								);
							question = { ...question, surveyResponseChoices };
						}
					}
					this.question.push(question);
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
			}
		);
	}

	/**
	 * ! On Submit Answer
	 * @param item - question item
	 * @param form - form data
	 */
	async onSubmitAnswer(item: any, form: any) {
		console.log(item);
		console.log(form);
		this.showLoader = true;
		let answerApi: any;
		const responseId = await this.app.getStorage('SurveyResponseId');
		if (item.questionType == 'Boolean') {
			const params = {
				answer: form,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = form;
			answerApi = this.api.addBooleanAns(params);
		}

		if (item.questionType == 'Numeric') {
			const params = {
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = form.answer;
			answerApi = this.api.addNumericAns(params);
		}

		if (item.questionType == 'FreeText') {
			const params = {
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = form.answer;
			answerApi = this.api.addFreeTextAns(params);
		}

		if (item.questionType == 'Date') {
			const params = {
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = form.answer;
			answerApi = this.api.addDateAns(params);
		}

		if (item.questionType == 'Time') {
			const params = {
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = form.answer;
			answerApi = this.api.addTimeAns(params);
		}

		if (item.questionType == 'SingleChoice') {
			const params = {
				answerChoiceId: this.singleSelectId,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
				optionSetId: this.optionSetId,
			};
			item.answer = this.singleSelectId;
			answerApi = this.api.addSingleChoiceAns(params);
		}

		if (item.questionType == 'MultiChoice') {
			const params = {
				answers: this.multiSelectIds,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				questionSetId: item.questionSetId,
			};
			item.answer = this.multiSelectIds;
			answerApi = this.api.addMultiChoiceAns(params);
		}

		// Subscribe To API Call
		if (answerApi) {
			console.log(answerApi);
			answerApi.then(
				(response: any) => {
					console.log(response);
					this.showLoader = false;
					this.multiSelectIds = [];
					this.singleSelectId = null;
					if (response.status === 201) {
						const result = response.body;
						let question = result['question'];
						if (question) {
							question.isReCheck = false;
							question.isBtnDisabled = false;
							if (question.questionType == 'SingleChoice') {
								const surveyResponseChoices =
									question.surveyResponseChoices.map(
										(data: any) => {
											return {
												...data,
												isChecked: false,
											};
										}
									);
								question = {
									...question,
									surveyResponseChoices,
								};
							}
							item.answerId = result['id'];
							this.answers.push(item);
							this.question = [];
							this.question.push(question);
						} else {
							item.answerId = result['id'];
							this.answers.push(item);
							this.question = [];
							this.showSubmitBtn = true;
							this.isSurveyEnd = true;
						}
						setTimeout(() => {
							this.content.scrollToBottom(500);
						}, 100);
					}
				},
				(error: any) => {
					this.showLoader = false;
					console.log(error);
				}
			);
		}
	}

	/**
	 * ! On YES/NO Answer
	 * @param item - question item
	 * @param ans - boolean
	 */
	onYesNo(item: any, ans: boolean) {
		this.onSubmitAnswer(item, ans);
	}

	/**
	 * ! On Skip Question
	 * @param item - question item
	 * @param form - form data
	 */
	async onSkipQuestion(item: any, form: any) {
		this.showLoader = true;
		const params = `SurveyId=${this.surveyID}&QuestionId=${item.id}`;
		this.api.getNextQuestion(params).subscribe(
			(response: any) => {
				this.showLoader = false;
				this.multiSelectIds = [];
				this.singleSelectId = null;
				if (response.status === 200) {
					const result = response.body;
					console.log(response);
					let question = result['question'];
					if (question) {
						question.isReCheck = false;
						question.isBtnDisabled = false;
						if (question.questionType == 'SingleChoice') {
							const surveyResponseChoices =
								question.surveyResponseChoices.map(
									(data: any) => {
										return { ...data, isChecked: false };
									}
								);
							question = { ...question, surveyResponseChoices };
						}
						this.question = [];
						this.question.push(question);
					} else {
						this.question = [];
						this.showSubmitBtn = true;
						this.isSurveyEnd = true;
					}
					setTimeout(() => {
						this.content.scrollToBottom(500);
					}, 100);
				}
			},
			(error) => {
				this.showLoader = false;
				console.log(error);
			}
		);
	}

	onReCheckAnswer(item: any) {
		console.log(item);
		console.log(this.answers);
		this.answers.find((data) => {
			if (item.id == data.id) {
				return (data.isReCheck = true);
			}
		});
		this.answers.forEach((data) => {
			if (item.id !== data.id) {
				return (data.isBtnDisabled = true);
			}
		});

		this.multiSelectIds = [];
		this.singleSelectId = null;

		if (item.questionType == 'SingleChoice') {
			item.surveyResponseChoices.forEach((x) => {
				x.isChecked = false;
			});
		}
		this.reCheckAnswers.push(item);
		this.showSubmitBtn = false;
	}

	onUpdateYesNo(item: any, ans: boolean) {
		this.onUpdateAnswer(item, ans);
	}

	async onUpdateAnswer(item: any, form: any) {
		console.log(item);
		console.log(form);
		this.showLoaderReCheck = true;
		let answerApi: any;
		const responseId = await this.app.getStorage('SurveyResponseId');
		if (item.questionType == 'Boolean') {
			const params = {
				id: item.answerId,
				answer: form,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = form;
			answerApi = this.api.updateBooleanAns(params);
		}

		if (item.questionType == 'Numeric') {
			const params = {
				id: item.answerId,
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = form.answer;
			answerApi = this.api.updateNumericAns(params);
		}

		if (item.questionType == 'FreeText') {
			const params = {
				id: item.answerId,
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = form.answer;
			answerApi = this.api.updateFreeTextAns(params);
		}

		if (item.questionType == 'Date') {
			const params = {
				id: item.answerId,
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = form.answer;
			answerApi = this.api.updateDateAns(params);
		}

		if (item.questionType == 'Time') {
			const params = {
				id: item.answerId,
				answer: form.answer,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = form.answer;
			answerApi = this.api.updateTimeAns(params);
		}

		if (item.questionType == 'SingleChoice') {
			const params = {
				id: item.answerId,
				answerChoiceId: this.singleSelectId,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
				optionSetId: this.optionSetId,
			};
			item.answer = this.singleSelectId;
			answerApi = this.api.updateSingleChoiceAns(params);
		}

		if (item.questionType == 'MultiChoice') {
			const params = {
				id: item.answerId,
				answers: this.multiSelectIds,
				surveyResponseId: responseId,
				surveyQuestionId: item.id,
			};
			item.answer = this.multiSelectIds;
			answerApi = this.api.updateMultiChoiceAns(params);
		}

		// Subscribe To API Call
		if (answerApi) {
			console.log(answerApi);
			answerApi.then(
				(response: any) => {
					console.log(response);
					this.showLoaderReCheck = false;
					this.multiSelectIds = [];
					this.singleSelectId = null;
					if (response.status === 200) {
						const result = response.body;
						let question = result['question'];
						let endOfQuestion = result['endOfQuestion'];
						if (endOfQuestion) {
							this.showSubmitBtn = true;
						}

						const index = this.answers.findIndex(
							(el) => el.id === item.id
						);
						console.log(this.answers);
						console.log(index);
						console.log(this.answers[index].answerId);
						console.log(item.id);

						// if (
						// 	this.answers[index].answerId == item.answerId &&
						// 	this.isSurveyEnd
						// ) {
						// 	this.showSubmitBtn = true;
						// }

						if (question) {
							const index = this.answers.findIndex(
								(el) => el.id === item.id
							);
							this.answers[index] = item;
							console.log(this.answers);
							console.log(index);
							console.log(index + 1);
							this.answers.splice(index + 1);

							this.answers.find((data) => {
								if (item.id == data.id) {
									return (data.isReCheck = false);
								}
							});

							this.answers.find((data) => {
								if (item.id !== data.id) {
									return (data.isBtnDisabled = false);
								}
							});

							question.isReCheck = false;
							question.isBtnDisabled = false;
							if (question.questionType == 'SingleChoice') {
								const surveyResponseChoices =
									question.surveyResponseChoices.map(
										(data: any) => {
											return {
												...data,
												isChecked: false,
											};
										}
									);
								question = {
									...question,
									surveyResponseChoices,
								};
							}
							this.answers = this.answers;
							this.question = [];
							this.reCheckAnswers = [];
							this.question.push(question);
							setTimeout(() => {
								this.content.scrollToBottom(500);
							}, 100);
						} else {
							const index = this.answers.findIndex(
								(el) => el.id === item.id
							);
							this.answers[index] = item;

							const indexLength = this.answers.length - 1;
							if (
								index == indexLength &&
								this.isSurveyEnd &&
								this.question.length == 0
							) {
								this.showSubmitBtn = true;
							} else if (
								index != indexLength &&
								this.isSurveyEnd &&
								this.question.length == 0
							) {
								this.showSubmitBtn = true;
							}

							this.answers.find((data) => {
								if (item.id == data.id) {
									return (data.isReCheck = false);
								}
							});

							this.answers.find((data) => {
								if (item.id !== data.id) {
									return (data.isBtnDisabled = false);
								}
							});
							this.reCheckAnswers = [];
						}
					}
				},
				(error: any) => {
					this.showLoaderReCheck = false;
					console.log(error);
					if (error.status === 400) {
						const index = this.answers.findIndex(
							(el) => el.id === item.id
						);
						this.answers[index] = item;
						console.log(this.answers);
						console.log(index);
						console.log(this.answers[index].answerId);
						console.log(item.id);
						const indexLength = this.answers.length - 1;
						if (
							index == indexLength &&
							this.isSurveyEnd &&
							this.question.length == 0
						) {
							this.showSubmitBtn = true;
						} else if (
							index != indexLength &&
							this.isSurveyEnd &&
							this.question.length == 0
						) {
							this.showSubmitBtn = true;
						}

						this.answers.find((data) => {
							if (item.id == data.id) {
								return (data.isReCheck = false);
							}
						});

						this.answers.find((data) => {
							if (item.id !== data.id) {
								return (data.isBtnDisabled = false);
							}
						});
						this.reCheckAnswers = [];
					}
				}
			);
		}
	}

	/**
	 * * CheckBox - SingleChoice Select
	 * @param event - IonChange Event
	 * @param item - Question Item
	 */
	onSingleSelect(event: any, optionSetId: any, item: any) {
		const checkboxId = event.detail.value;
		if (event.detail.checked) {
			this.singleSelectId = checkboxId;
			this.optionSetId = optionSetId;
		} else {
			this.singleSelectId = null;
			this.optionSetId = null;
		}

		item.forEach((x) => {
			if (x.optionId !== checkboxId) {
				x.isChecked = !x.isChecked;
			}
		});
	}

	/**
	 * * CheckBox - MultiChoice Select
	 * @param event - IonChange Event
	 * @param item - Question Item
	 */
	onMultiSelect(event: any, optionSetId: any, item: any) {
		const checkboxId = event.detail.value;
		if (event.detail.checked) {
			this.multiSelectIds.push({
				surveyReplyChoiceId: checkboxId,
				optionSetId: optionSetId,
			});
		} else {
			const index = this.multiSelectIds.findIndex(
				(ids) => ids.surveyReplyChoiceId === checkboxId
			);
			this.multiSelectIds.splice(index, 1);
		}
	}

	// getMultiChoiceOption(subItem, itemOption) {
	// 	const optionArray = itemOption.filter((data: any) => {
	// 		if (subItem == data.optionId) {
	// 			return data.option;
	// 		}
	// 	});
	// 	console.log(optionArray[0].option);
	// 	return optionArray[0].option;
	// }

	async onSubmit() {
		const alert = await this.alertController.create({
			cssClass: 'custom-alert',
			header: 'Are you sure you want to submit?',
			backdropDismiss: false,
			buttons: [
				{
					text: 'Yes',
					cssClass: 'btn-success',
					handler: () => {
						console.log('Confirm Okay');
						alert.dismiss();
						this.submitAllAnswers();
					},
				},
				{
					text: 'No',
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

	async submitAllAnswers() {
		this.component.presentLoader();
		const responseId = await this.app.getStorage('SurveyResponseId');
		const params = {
			surveyId: this.surveyID,
			surveyResponseBaseId: responseId,
		};
		this.api.evaluateAnswers(params).subscribe(
			(response: any) => {
				console.log(response);
				// this.component.dismissLoader();
				const result = response.body;
				if (response.status === 201) {
					console.log(result);
					this.app.removeStorage('SurveyResponseId');
					// this.app.setStorage('isSelfChecked', true);
					this.question = [];
					this.answers = [];
					this.reCheckAnswers = [];
					this.singleSelectId = null;
					this.multiSelectIds = [];
					this.showSubmitBtn = false;
					this.getCovidState(result.covidStateId);
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
			}
		);
		// this.component.presentAlertWithEmoji(
		// 	'You’re SAFE!',
		// 	'“Thanks for taking Self-Health Check. You are SAFE to come to office. Show this message to security on reaching office',
		// 	true
		// );
	}

	getCovidState(id: any) {
		this.api.getCovidStateById(id).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					console.log(result);
					this.component.presentAlertWithEmoji(
						result.stateName,
						result.message,
						result.colorCode.toLowerCase()
					);
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
			}
		);
	}

	/**
	 * * Past Self-Check View
	 */
	onView(item: any) {
		this.router.navigate(['/health-check-preview'], {
			queryParams: {
				id: JSON.stringify(item.id),
				date: JSON.stringify(item.createdDate),
				text: JSON.stringify(item.survey),
				cid: JSON.stringify(item.covidStateId),
			},
		});
	}

	async getPastCheckUps() {
		this.component.presentLoader();
		const userID = await this.app.getStorage('UserID');
		const fromdate = this.fromDate.split('T')[0];
		const todate = this.toDate.split('T')[0];
		const params = `RespondentIds=${userID}&FromDate=${fromdate}&ToDate=${todate}`;
		console.log(params);
		this.ionChangeDate = true;
		this.api.getAllPastCheckUps(params).subscribe(
			(response: any) => {
				console.log(response);
				this.component.dismissLoader();
				const result = response.body;
				if (response.status === 200) {
					console.log(result);
					this.items = result;
				}
			},
			(error) => {
				this.component.dismissLoader();
				console.log(error);
				this.items = [];
			}
		);
	}

	segmentChanged(name: any) {
		console.log(name);
		console.log(name == 'past');
		if (name == 'past') {
			this.items = [];
			this.getPastCheckUps();
		} else {
			this.ionChangeDate = false;
		}
	}

	async onShowPOPUP() {
		const colorCode = await this.app.getStorage('colorCode');
		const stateName = await this.app.getStorage('stateName');
		const message = await this.app.getStorage('message');
		this.component.presentAlertWithEmoji(
			stateName,
			message,
			colorCode.toLowerCase()
		);
	}

	/**
	 * * On Date Change
	 */
	onDateChange() {
		this.items = [];
		if (this.ionChangeDate) {
			this.getPastCheckUps();
		}
	}
}
