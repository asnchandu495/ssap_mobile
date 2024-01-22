import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
	name: 'highlightText',
})
export class HighlightTextPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	transform(value: any, args: any): any {
		if (!args) {
			return value;
		}
		// Match in a case insensitive manner
		const re = new RegExp(args, 'gi');
		const match = value.match(re);

		// If there's no match, just return the original value.
		if (!match) {
			return value;
		}

		const replacedValue = value.replace(
			re,
			'<mark>' + match[0] + '</mark>'
		);
		return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
	}
}
