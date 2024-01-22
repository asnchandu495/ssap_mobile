import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
	name: 'momentPipe',
})
export class MomentPipe implements PipeTransform {
	transform(date: any, format: any) {
		console.log(date);
		console.log(format);
		return moment(date).format(format);
	}
}
