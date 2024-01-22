import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { IBeacon } from '@ionic-native/ibeacon/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Network } from '@ionic-native/network/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { InterceptorService } from './services/interceptor.service';
import { SideMenuComponent } from './components/side-menu/side-menu.component';

@NgModule({
	declarations: [AppComponent, SideMenuComponent],
	entryComponents: [],
	imports: [
		AppRoutingModule,
		BrowserModule,
		HttpClientModule,
		IonicModule.forRoot(),
		IonicStorageModule.forRoot(),
	],
	providers: [
		StatusBar,
		SplashScreen,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptorService,
			multi: true,
		},
		BackgroundGeolocation,
		Camera,
		Diagnostic,
		Keyboard,
		Geolocation,
		NativeGeocoder,
		IBeacon,
		AndroidPermissions,
		FirebaseX,
		Network,
		BackgroundMode,
		Clipboard,
		HTTP,
		InAppBrowser
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
