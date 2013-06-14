//version 1
Ext.define('Ext.ux.form.field.plugin.PhoneNumber', {
	extend: 'Ext.AbstractPlugin',
	alias: 'plugin.phonenumber',
	
	countryCode: 'ZZ',
	getCleanNumber: true,
	
	init: function(field) {
		var me = this;
		
		Ext.Function.defer(function() {
			this.mon(this.inputEl, 'keypress', me.filterKeys, this);
		}, 1, field);
		
		field.on('change', me.onChange, me);
		field.getPhoneNumberDescription = Ext.bind(me.getPhoneNumberDescription, me, [field]);
		if (me.getCleanNumber) {
			field.getOrigValue = Ext.bind(field.getValue, field);
			field.getValue = Ext.bind(me.getValue, me, [field]);
		} else {
			field.getOrigValue = Ext.bind(me.getValue, me, [field]);
		}
	},
	
	filterKeys: function(e) {
		// copied form extjs
		if (e.ctrlKey && !e.altKey) {
			return;
		}
		var key = e.getKey(),
			charCode = String.fromCharCode(e.getCharCode());

		if ((Ext.isGecko || Ext.isOpera) && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))) {
			return;
		}

		if ((!Ext.isGecko && !Ext.isOpera) && e.isSpecialKey() && !charCode) {
			return;
		}
		
		// this is what i added
		var currentValue = this.getValue();
		if (charCode === '+' && (typeof currentValue === 'undefined' || currentValue === null || currentValue == '')) {
			return;
		}
		if(charCode === '0' || charCode === '1' || charCode === '2' || charCode === '3' || charCode === '4'
			|| charCode === '5' || charCode === '6' || charCode === '7' || charCode === '8' || charCode === '9') {
			return;
		}
		e.stopEvent();
	},
	
	onChange: function(field, newValue, oldValue) {
		var me = this;
		if (oldValue && oldValue.replace(/[^\d\+]+$/, '') === newValue) {
			return;
		}
		newValue = me.cleanPhone(newValue);
		var formatter = new i18n.phonenumbers.AsYouTypeFormatter(me.countryCode);
		var phoneNumberLength = newValue.length;
		var output = '';
		for (var i = 0; i < phoneNumberLength; i++) {
			var inputChar = newValue.charAt(i);
			output = formatter.inputDigit(inputChar);
		}
		field.setRawValue(output);
	},
	
	cleanPhone: function(phoneNumber) {
		var cleaned = '';
		for (var i = 0; i < phoneNumber.length; i++) {
			var digit = phoneNumber.charAt(i);
			if (digit === '+') {
				if(i === 0) {
					cleaned += '+';
				}
			} else if (digit === '0' || digit === '1' || digit === '2' || digit === '3' || digit === '4'
				|| digit === '5' || digit === '6' || digit === '7' || digit === '8' || digit === '9') {
				cleaned += digit;
			}
		}
		return cleaned;
	},
	
	getValue: function(field) {
		return this.cleanPhone(field.getOrigValue());
	},
	
	getPhoneNumberDescription: function(field) {
		var me = this,
			output = '';
		try {
			var phoneUtil = i18n.phonenumbers.PhoneNumberUtil.getInstance();
			var phoneNumber = phoneUtil.parseAndKeepRawInput(field.getValue(), me.countryCode);
			var isPossible = phoneUtil.isPossibleNumber(phoneNumber);
			output += '\nResult from isPossibleNumber(): ';
			output += isPossible;
			if (!isPossible) {
				output += '\nResult from isPossibleNumberWithReason(): ';
				var PNV = i18n.phonenumbers.PhoneNumberUtil.ValidationResult;
				switch (phoneUtil.isPossibleNumberWithReason(phoneNumber)) {
					case PNV.INVALID_COUNTRY_CODE: output += 'INVALID_COUNTRY_CODE'; break;
					case PNV.TOO_SHORT: output += 'TOO_SHORT'; break;
					case PNV.TOO_LONG: output += 'TOO_LONG'; break;
				}
				// IS_POSSIBLE shouldn't happen, since we only call this if _not_
				// possible.
				output += '\nNote: numbers that are not possible have type ' +
					'UNKNOWN, an unknown region, and are considered invalid.';
			} else {
				var isNumberValid = phoneUtil.isValidNumber(phoneNumber);
				output += '\nResult from isValidNumber(): ';
				output += isNumberValid;
				if (isNumberValid && me.countryCode && me.countryCode != 'ZZ') {
					output += '\nResult from isValidNumberForRegion(): ';
					output += phoneUtil.isValidNumberForRegion(phoneNumber, me.countryCode);
				}
				output += '\nPhone Number region: ';
				var regionCodeForNumber = phoneUtil.getRegionCodeForNumber(phoneNumber);
				output += regionCodeForNumber;
				output += '\nResult from getNumberType(): ';
				var PNT = i18n.phonenumbers.PhoneNumberType;
				switch (phoneUtil.getNumberType(phoneNumber)) {
					case PNT.FIXED_LINE: output += 'FIXED_LINE'; break;
					case PNT.MOBILE: output += 'MOBILE'; break;
					case PNT.FIXED_LINE_OR_MOBILE: output += 'FIXED_LINE_OR_MOBILE'; break;
					case PNT.TOLL_FREE: output += 'TOLL_FREE'; break;
					case PNT.PREMIUM_RATE: output += 'PREMIUM_RATE'; break;
					case PNT.SHARED_COST: output += 'SHARED_COST'; break;
					case PNT.VOIP: output += 'VOIP'; break;
					case PNT.PERSONAL_NUMBER: output += 'PERSONAL_NUMBER'; break;
					case PNT.PAGER: output += 'PAGER'; break;
					case PNT.UAN: output += 'UAN'; break;
					case PNT.UNKNOWN: output += 'UNKNOWN'; break;
				}
			}
		} catch (err) {
			output += '\n' + err;
		}
		return output;
	}
});