import {
	Component,
	OnInit,
	AfterViewInit,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
	NativeGeocoder,
	NativeGeocoderResult,
	NativeGeocoderOptions,
} from '@ionic-native/native-geocoder/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AppService } from '../../../services/app.service';
import { ComponentService } from '../../../services/component.service';

declare var google;

@Component({
	selector: 'app-map',
	templateUrl: './map.page.html',
	styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
	// Properties
	@ViewChild('map', { static: false }) mapElement: ElementRef;
	@ViewChild('searchInput', { static: false }) searchElement: ElementRef;
	map: any;
	marker: any;
	address: string;
	stateName: string;
	latitude: number;
	longitude: number;
	isEditable: boolean;

	constructor(
		private geolocation: Geolocation,
		private nativeGeocoder: NativeGeocoder,
		private route: ActivatedRoute,
		private router: Router,
		private location: Location,
		private api: ApiService,
		private app: AppService,
		private component: ComponentService
	) {
		this.route.queryParams.subscribe((params) => {
			console.log(params);
			this.isEditable = JSON.parse(params.newuser);
			if (!this.isEditable) {
				this.latitude = JSON.parse(params.lat);
				this.longitude = JSON.parse(params.long);
				this.address = JSON.parse(params.address);
			}
		});
	}

	ngOnInit() {}

	/**
	 * Load Map After View INIT
	 */
	ngAfterViewInit() {
		if (this.isEditable) {
			this.getUserCountry();
		} else {
			this.loadMapForViewLocation(this.latitude, this.longitude);
		}
	}

	/**
	 * * GO back TO Previous Page
	 */
	onBack() {
		this.location.back();
	}

	loadMapForViewLocation(latitude: any, longitude: any) {
		const latLng = new google.maps.LatLng(latitude, longitude);
		const mapOptions = {
			center: latLng,
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			fullscreenControl: false,
			zoomControl: false,
			animation: google.maps.Animation.DROP,
		};

		const map = new google.maps.Map(
			this.mapElement.nativeElement,
			mapOptions
		);

		const contentString = `<h4>${this.address}</h4>`;

		const infowindow = new google.maps.InfoWindow({
			content: contentString,
		});

		const marker = new google.maps.Marker({
			position: latLng,
			map,
			title: 'User Location on MAP',
		});

		infowindow.open(map, marker);
	}

	/**
	 * * Show MAP Based on User Country Name
	 */
	async getUserCountry() {
		const countryName = await this.app.getStorage('countryName');
		const options: NativeGeocoderOptions = {
			useLocale: true,
			maxResults: 5,
		};
		this.nativeGeocoder
			.forwardGeocode(countryName, options)
			.then((result: NativeGeocoderResult[]) => {
				this.loadMap(result[0].latitude, result[0].longitude);
			})
			.catch((error: any) => console.log(error));
	}

	/**
	 * * Load MAP
	 * @param latitude - user country lat
	 * @param longitude - user country long
	 */
	loadMap(latitude: any, longitude: any) {
		const latLng = new google.maps.LatLng(latitude, longitude);
		const mapOptions = {
			center: latLng,
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			fullscreenControl: false,
			zoomControl: false,
			animation: google.maps.Animation.DROP,
		};

		this.map = new google.maps.Map(
			this.mapElement.nativeElement,
			mapOptions
		);

		// Location Button
		const locationButton = document.createElement('button');
		const img = document.createElement('IMG');
		img.setAttribute('src', '/assets/icon/gps2.svg');
		img.setAttribute('class', 'location-icon');
		img.setAttribute('alt', 'Location');
		locationButton.appendChild(img);
		locationButton.classList.add('custom-location-button');

		this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
			locationButton
		);

		locationButton.addEventListener('click', () => {
			this.app.checkLocationEnable().then(
				(resolve) => {
					this.component.presentLoader();
					let options = {enableHighAccuracy: true};
					this.geolocation
						.getCurrentPosition(options)
						.then((resp) => {
							this.component.dismissLoader();
							this.latitude = resp.coords.latitude;
							this.longitude = resp.coords.longitude;
							this.drawMarker(this.latitude, this.longitude);
						})
						.catch((error) => {
							this.component.dismissLoader();
							console.log('Error getting location', error);
						});
				},
				(reject) => {
					console.log(reject);
					console.log('Error getting location');
				}
			);
		});

		// Add Search Box
		// Create the search box and link it to the UI element.
		// const input = document.getElementById('search-input');
		const input = this.searchElement.nativeElement;
		const searchBox = new google.maps.places.SearchBox(input);
		this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
		// Bias the SearchBox results towards current map's viewport.
		this.map.addListener('bounds_changed', () => {
			searchBox.setBounds(this.map.getBounds());
		});
		let markers = [];
		// Listen for the event fired when the user selects a prediction and retrieve
		// more details for that place.
		searchBox.addListener('places_changed', () => {
			const places = searchBox.getPlaces();

			if (places.length === 0) {
				return;
			}
			// Clear out the old markers.
			markers.forEach((marker) => {
				marker.setMap(null);
			});
			markers = [];
			// For each place, get the icon, name and location.
			const bounds = new google.maps.LatLngBounds();
			places.forEach((place) => {
				if (!place.geometry || !place.geometry.location) {
					console.log('Returned place contains no geometry');
					return;
				}

				const marker = new google.maps.Marker({
					map: this.map,
					title: place.name,
					position: place.geometry.location,
					draggable: true,
				});

				marker.addListener('dragend', (event) => {
					this.latitude = event.latLng.lat();
					this.longitude = event.latLng.lng();
					console.log(this.latitude);
					console.log(this.longitude);
					this.getAddressFromCoords(this.latitude, this.longitude);
				});

				// Create a marker for each place.
				markers.push(marker);
				this.address = '';

				if (place.geometry.viewport) {
					// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			this.map.fitBounds(bounds);
		});
	}

	/**
	 * * Draw Marker For Current Location
	 * @param latitude - User Current Lat
	 * @param longitude - User Current Long
	 */
	drawMarker(latitude: any, longitude: any) {
		const latLng = new google.maps.LatLng(latitude, longitude);
		this.getAddressFromCoords(latitude, longitude);
		this.map.setCenter(latLng);
		this.map.setZoom(15);

		if (this.marker && this.marker.setMap) {
			this.marker.setMap(null);
		}

		this.marker = new google.maps.Marker({
			position: latLng,
			map: this.map,
			draggable: true,
		});

		this.marker.addListener('dragend', (event: any) => {
			this.latitude = event.latLng.lat();
			this.longitude = event.latLng.lng();
			console.log(this.latitude);
			console.log(this.longitude);
			this.getAddressFromCoords(this.latitude, this.longitude);
		});
	}

	/**
	 * * Get Current Address from Coords
	 * @param latitude - user current lat
	 * @param longitude - user current long
	 */
	getAddressFromCoords(latitude: any, longitude: any) {
		console.log('getAddressFromCoords ' + latitude + ' ' + longitude);
		const options: NativeGeocoderOptions = {
			useLocale: true,
			maxResults: 5,
		};

		this.nativeGeocoder
			.reverseGeocode(latitude, longitude, options)
			.then((result: NativeGeocoderResult[]) => {
				this.address = '';
				this.stateName = '';
				const responseAddress = [];
				for (const [key, value] of Object.entries(result[0])) {
					if (value.length > 0) {
						responseAddress.push(value);
					}
				}
				this.stateName = `${result[0].locality} - ${result[0].administrativeArea}`;
				responseAddress.pop();
				responseAddress.reverse();
				this.address = responseAddress.join(', ');
			})
			.catch((error: any) => {
				this.address = 'Address Not Available!';
				this.stateName = 'Address Not Available!';
			});
	}

	/**
	 * * On Submit WFHLs
	 */
	onSubmitWFHL() {
		if (this.latitude && this.longitude && this.address && this.stateName) {
			const params = {
				id: '',
				name: this.stateName,
				latitude: this.latitude,
				longitude: this.longitude,
				location: this.address,
			};
			this.component.presentLoader();
			this.api.addWFHLocation(params).subscribe(
				(response: any) => {
					this.component.dismissLoader();
					console.log(response);
					if (response.status === 201) {
						this.component.presentAlertWithURL(
							'',
							'Your Work From Home Location request is sent to your supervisor for approval.',
							'OK',
							'/tabs/work-location/manage-wfhl'
						);
					}
				},
				(error) => {
					console.log(error);
					this.component.dismissLoader();
				}
			);
		} else {
			this.component.presentAlert(
				'Oops...!',
				'Please select your location',
				'OK'
			);
		}
	}
}
