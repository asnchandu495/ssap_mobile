import { Injectable } from '@angular/core';
import {
	HttpInterceptor,
	HttpEvent,
	HttpHandler,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AppService } from './app.service';
import { ComponentService } from './component.service';
import { IbeaconService } from './ibeacon.service';
import { PinmicroService } from './pinmicro.service';
import { FcmService } from './fcm.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {
	isAlCreated: false;
	constructor(private app: AppService, private component: ComponentService, public pinmicro: PinmicroService, public ibeacon: IbeaconService, public fcm: FcmService ) {}

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		// * Authentication by setting header with token
		return from(this.app.getStorage('AccessToken')).pipe(
			mergeMap((token: any) => {
				if (token) {
					req = req.clone({
						setHeaders: {
							Authorization: `Bearer ${token}`,
						},
					});
				}
				return next.handle(req).pipe(
					catchError((error) => {
						if (error.status === 401) {
							if(!this.component.isAlertPresent()) {
								this.fcm.unRegister();
								this.pinmicro.resetSDK();
								this.ibeacon.stopScannning();
								this.component.presentAlertWithURL(
									'Oops...!',
									'You have been signed out because either your last session expired or you are currently signed in on another device. ',
									'OK',
									'/login'
								);
							}
						}
						return throwError(error);
					})
				);
			})
		);
	}
}
