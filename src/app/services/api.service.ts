import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class ApiService {
	// Properties
	private AUTH_URL: string;
	private SERVER_URL: string;
	private SURVEY_URL: string;
	public accessToken: string;

	constructor(private http: HTTP, private storage: Storage) {
		this.AUTH_URL = environment.AUTH_URL;
		this.SERVER_URL = environment.SERVER_URL;
		this.SURVEY_URL = environment.SURVEY_URL;
	}

	setAccessToken(token: any) {
		this.accessToken = token;
	}

	/**
	 * * LOGIN API
	 * @param username - Email ID (string)
	 * @param password - Password (string)
	 */
	authLogin(username: string, password: string) {
		const url = this.AUTH_URL + '/connect/token';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: {
					client_id: 'SsapAuth',
					grant_type: 'password',
					username: username,
					password: password,
					scope: 'openid profile ssapauth',
					client_secret: 'Flex@123$',
				},
				responseType: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * LockOut API (Account Lockout Check API)
	 * @param data - Email Id
	 */
	authLockout(data: any) {
		const url = this.AUTH_URL + '/AuthAPI/Lockout';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				serializer: 'json',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * LOGOUT API
	 * @param token - string
	 */
	authLogout(token: string) {
		const url = this.AUTH_URL + '/connect/revocation';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: {
					token: token,
					token_type_hint: 'access_token',
					client_id: 'SsapAuth',
					client_secret: 'Flex@123$',
				},
				responseType: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Check First Time
	 * @param data - { Email ID }
	 */
	checkFirstTimeUser(data: any) {
		const url =
			this.SERVER_URL + 'ApplicationUser/CheckUserFirstTimeLogin';
		const params = {id: data};
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: params,
				serializer: 'json',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Forgot Password API
	 * @param data - Email Id
	 */
	forgotPassword(data: any) {
		const url = this.SERVER_URL + 'Login/ForgotPassword';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				serializer: 'json',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Verify OTP API
	 * @param data - OTP
	 */
	verifyOTP(data: any) {
		const url = this.SERVER_URL + 'Login/VerifyOTP';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				serializer: 'json',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Reset Password API
	 * @param data - valid Id, password, confirmPassword
	 */
	resetPassword(data: any) {
		const url = this.SERVER_URL + 'Login/ResetPassword';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				serializer: 'json',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Reset Password API
	 * @param data - valid Id, password, confirmPassword
	 */
	changePassword(data: any) {
		const url = this.SERVER_URL + 'Login/ChangePassword';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				serializer: 'json',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get User Details
	 */
	getUserDetails() {
		const url = this.SERVER_URL + 'ApplicationUser/GetLoggedInUserDetails';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Global Settings
	 */
	getGlobalSettings() {
		const url = this.SERVER_URL + 'GlobalSetting/GetGlobalSettings';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Emergency Contact
	 */
	getEmergencyContact() {
		const url =
			this.SERVER_URL + 'EmergencyContact/ReferEmergencyContactForUser';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get FAQ
	 */
	getFAQForUser() {
		const url = this.SERVER_URL + 'FAQ/GetFAQForUser';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Upload Profile Picture
	 * @param data - File (PNG, JPEG)
	 */
	base64ProfileUpload(data: any) {
		const url = this.SERVER_URL + 'Common/FileUploadProfilePicToAzure';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Verify Profile Picture
	 * @param data - File (PNG, JPEG)
	 */
	base64VerifySelfie(data: any) {
		const url = this.SERVER_URL + 'Common/VerifyProfileSelfie';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get WFHLs
	 */
	getWFHLs() {
		const url = this.SERVER_URL + 'WFH/MyWFHLocations';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Add WFH Location
	 * @param data - { id, name, latitude, longitude, location }
	 */
	addWFHLocation(data: any) {
		const url = this.SERVER_URL + 'WFH/AddWFHLocation';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get All Team Requests
	 * @param status - Status (Pending/Approved/Rejected)
	 */
	getAllRequestsByStatus(status: any) {
		const url = this.SERVER_URL + 'ApplicationUser/GetAllRequestsByStatus';
		return from(
			this.http.sendRequest(`${url}?Status=${status}`, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Team Requests
	 * @param status - Status (Pending/Approved/Rejected)
	 * @param userIds - User ID (Array[])
	 */
	getUserRequestsByStatus(data: any) {
		const url = this.SERVER_URL + 'ApplicationUser/GetUserRequestsByStatus';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Approve Uploaded Profile Photo
	 * @param data - { applicationUserId: string }
	 */
	approveUploadProfile(data: any) {
		const url =
			this.SERVER_URL + 'ApplicationUser/ApproveUploadedProfilePhoto';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Reject Uploaded Profile Photo
	 * @param data - { applicationUserId: string }
	 */
	rejectUploadProfile(data: any) {
		const url =
			this.SERVER_URL + 'ApplicationUser/RejectUploadedProfilePhoto';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Approve WFH
	 * @param data - { appUserLocations: string }
	 */
	approveWFH(data: any) {
		const url = this.SERVER_URL + 'WFH/ApproveWFH';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Reject WFH
	 * @param data - { appUserLocations: string }
	 */
	rejectWFH(data: any) {
		const url = this.SERVER_URL + 'WFH/RejectWFH';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Check IN
	 * @param data - { location, latitude,longitude }
	 */
	checkIn(data: any) {
		const url = this.SERVER_URL + 'ApplicationUser/CheckIn';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'text',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Check OUT
	 * @param data - { location, latitude, longitude }
	 */
	checkOut(data: any) {
		const url = this.SERVER_URL + 'ApplicationUser/CheckOut';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 *
	 * @param data - { "fromDate": "YYYY-MM-DD", "toDate": "YYYY-MM-DD", "isActive": true, "isOrder": true }
	 */
	getUserAttendance(data: any) {
		const url =
			this.SERVER_URL +
			'ApplicationUser/GetUsersAttendanceStatusForSupervisor';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Geo Breach
	 * @param data - { id, latitude, longitude, location }
	 */
	geoBreach(data: any) {
		const url = this.SERVER_URL + 'ApplicationUserGeoBreach/GeoBreach';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get Frequency
	 */
	getFrequency() {
		const url = this.SERVER_URL + 'GlobalSetting/geo/frequency';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * Get Tolerance
	 */
	getTolerance() {
		const url = this.SERVER_URL + 'GlobalSetting/geo/tolerance';
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	//! Self-Check APIs

	/**
	 * * Get First Question By Default
	 * @param id - Survey ID
	 * @returns
	 */
	getSurveyId() {
		const url =
			this.SURVEY_URL +
			`AssignQuestionnaire/ReferQuestionnaireToGroupById`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		)
			.pipe(map((event: any) => ({ ...event, body: event.data })))
			.toPromise();
	}

	/**
	 * ! Add Response
	 * @param data - {surveyId: id}
	 * @returns
	 */
	addResponse(data: any) {
		const url = this.SURVEY_URL + 'Response/AddResponse';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get First Question By Default
	 * @param id - Survey ID
	 * @returns
	 */
	getFirstQuestion(id: any) {
		const url = this.SURVEY_URL + `Survey/GetFirstQuestion/${id}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Next Question IF SKIP
	 * @param surveyId - survey Id
	 * @param quesId - question Id
	 * @returns
	 */
	getNextQuestion(data: any) {
		const url =
			this.SURVEY_URL + `OrderOfExecution/GetNextQuestion?${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * ! Add Boolean Answer
	 * @param data - { answer: boolean, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addBooleanAns(data: any) {
		const url = this.SURVEY_URL + 'BooleanQuestion/AddBooleanAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Boolean Answer
	 * @param data - { id, answer: boolean, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateBooleanAns(data: any) {
		const url = this.SURVEY_URL + 'BooleanQuestion/UpdateBooleanAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Numeric Answer
	 * @param data - { answer: number, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addNumericAns(data: any) {
		const url = this.SURVEY_URL + 'NumericQuestion/AddNumericAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Numeric Answer
	 * @param data - { id, answer: number, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateNumericAns(data: any) {
		const url = this.SURVEY_URL + 'NumericQuestion/UpdateNumericAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Free-Text Answer
	 * @param data - { answer: string, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addFreeTextAns(data: any) {
		const url = this.SURVEY_URL + 'FreeTextQuestion/AddFreeTextAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Free-Text Answer
	 * @param data - { id, answer: string, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateFreeTextAns(data: any) {
		const url = this.SURVEY_URL + 'FreeTextQuestion/UpdateFreeTextAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Date Answer
	 * @param data - { answer: date, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addDateAns(data: any) {
		const url = this.SURVEY_URL + 'QuestionDate/AddAnswerDate';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Date Answer
	 * @param data - { id, answer: date, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateDateAns(data: any) {
		const url = this.SURVEY_URL + 'QuestionDate/UpdateAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Time Answer
	 * @param data - { answer: time, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addTimeAns(data: any) {
		const url = this.SURVEY_URL + 'QuestionTime/AddTimeAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Time Answer
	 * @param data - { id, answer: time, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateTimeAns(data: any) {
		const url = this.SURVEY_URL + 'QuestionTime/UpdateTimeAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Single-Choice Answer
	 * @param data - { answerChoiceId: Id, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addSingleChoiceAns(data: any) {
		const url =
			this.SURVEY_URL + 'SingleChoiceQuestion/AddSingleChoiceAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Single-Choice Answer
	 * @param data - { id, answerChoiceId: Id, surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateSingleChoiceAns(data: any) {
		const url =
			this.SURVEY_URL + 'SingleChoiceQuestion/UpdateSingleChoiceAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Add Multi-Choice Answer
	 * @param data - { "answers": [surveyReplyChoiceId], surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	addMultiChoiceAns(data: any) {
		const url =
			this.SURVEY_URL + 'MultipleChoiceQuestion/AddMultiChoiceAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Update Multi-Choice Answer
	 * @param data - { id, "answers":[surveyReplyChoiceId], surveyResponseId, surveyQuestionId }
	 * @returns
	 */
	updateMultiChoiceAns(data: any) {
		const url =
			this.SURVEY_URL + 'MultipleChoiceQuestion/UpdateMultiChoiceAnswer';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * ! Evaluate Answers
	 * @param data - { "surveyId": "", "surveyResponseBaseId": "" }
	 * @returns
	 */
	evaluateAnswers(data: any) {
		const url = this.SURVEY_URL + 'Evaluation/EvaluateAnswers';
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	// Get Past Check-Ups

	/**
	 * * Get All Past-Checkup Using Date Filters
	 * @param data - RespondentId=${userID}&FromDate=${fromdate}&ToDate=${todate}
	 * @returns
	 */
	getAllPastCheckUps(data: any) {
		const url = this.SURVEY_URL + `Response/GetAllUsersResponse?${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Answers For Particular Past-Checkup
	 * @param data - ResponseId=${id}
	 * @returns
	 */
	getAllPastAnswers(data: any) {
		const url = this.SURVEY_URL + `Survey/GetAllAnswers?${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Covid State By ID
	 * @param data - id
	 * @returns
	 */
	getCovidStateById(data: any) {
		const url = this.SERVER_URL + `COVIDState/GetCOVIDStateById/${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Shift Status
	 * @param data - id
	 * @returns
	 */
	getShiftStatus(data: any) {
		const url = this.SERVER_URL + `ApplicationUser/ViewShiftStatus/${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * User Proximity
	 * @param data - {userId, contactId, location}
	 * @returns
	 */
	captureUserProximity(data: any) {
		const url = this.SERVER_URL + `ApplicationUser/CaptureUserProximity`;
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get Latest Attandance Activity
	 * @returns -
	 */
	getAttendanceActivity() {
		const url =
			this.SERVER_URL +
			`ApplicationUser/GetLoggedInUserLatestAttendanceActivity`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get Latest Health Check Acitivty
	 * @returns -
	 */
	getHealthCheckActivity() {
		const url =
			this.SURVEY_URL + `Survey/GetLoggedInUserLatestHealthCheckDetails`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Validate Auth TOken
	 * @returns -
	 */
	checkTokenValid() {
		const url = this.SERVER_URL + `Common/CheckToken`;
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: {},
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Get Density Report
	 * @returns
	 */
	getDensityReport() {
		const url = this.SERVER_URL + `Reports/Density/mobile`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Get User Notification
	 * @param data - isRead - TRUE/FALSE/NULL
	 * @returns
	 */
	getUserNotification(data: any) {
		const url =
			this.SERVER_URL +
			`UserCommunication/GetAllUserCommunicationsForLoggedInUser?${data}`;
		return from(
			this.http.sendRequest(url, {
				method: 'get',
				responseType: 'json',
				headers: { Authorization: `Bearer ${this.accessToken}` },
			})
		).pipe(map((event: any) => ({ ...event, body: event.data })));
	}

	/**
	 * * Mark Notification Status
	 * @param data - { "id": "string","isRead": true}
	 * @returns
	 */
	markNotificationStatus(data: any) {
		const url =
			this.SERVER_URL + 'UserCommunication/MarkNotificationAsRead';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		)
			.pipe(
				map((event: any) => {
					return { ...event, body: event.data };
				})
			)
			.toPromise();
	}

	/**
	 * * Send Alert To Contact
	 * @param data - { userId: "string"}
	 * @returns
	 */
	sendAlertToContact(data: any) {
		const url = this.SERVER_URL + `ApplicationUser/SendAlertToContact`;
		return from(
			this.http.sendRequest(url, {
				method: 'post',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Save FCM TOKEN
	 * @param data - {"token": "string"}
	 */
	saveFCMToken(data: any) {
		const url =
			this.SERVER_URL +
			'ApplicationUser/UpdateConcurrentLoginForNotification';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${this.accessToken}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}

	/**
	 * * Concurrent Login For Auth
	 * @param data - { "isLoggedOut": Login(FALSE)/Logout(TRUE) }
	 * @returns
	 */
	conCurrentLoginAuth(data: any, token: string) {
		const url =
			this.SERVER_URL + 'ApplicationUser/UpdateConcurrentLoginForAuth';
		return from(
			this.http.sendRequest(url, {
				method: 'put',
				data: data,
				headers: { Authorization: `Bearer ${token}` },
				responseType: 'json',
				serializer: 'json',
			})
		).pipe(
			map((event: any) => {
				return { ...event, body: event.data };
			})
		);
	}
}
