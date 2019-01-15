/*********************************************
version 1.1
@author Sarvar Nigmat HQ\89526

Version History:
1.1: Added the ability to reset the UI using reset().
     Fixed bugs related to queue animations
1.0: Initial concept

Requires jQuery 1.7.x due to the fact events are captured using the .on() function.
If jQuery < 1.7 is used, the .on() functions must be changed to .bind() to work properly with the older versions of jquery.

Add the following HTML Markup:

<div id="passwordResetFormMeter" class="password-strength-meter">
    <p>Your new password must be between 8-16 characters and contain at least one letter and one number. We also recommend that you use at least one upper case letter and one special character to help strengthen your password.</p>

    <div class="password-checklist">
        <ul class="strength-checklist list-unstyled">
            <li>at least one letter</li>
            <li>at least one number</li>
            <li>between 8-16 characters</li>
            <li class="not-required">at least one capital letter (recommended)</li>
            <li class="not-required">at least one special character (recommended)</li>
        </ul>

        <div class="password-meter-container">
            <div class="password-meter">
                <div class="meter-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                <div class="meter-text">Strength Meter</div>
            </div>
        </div>
    </div>
</div>

Usage Example (most common):
$('#newPassword').nfcuPasswordStrength({
	'strengthMeterContainer' : $('#passwordResetFormMeter'),
	'confirmPassword' : $('#confirmPassword')
});

If you want to overwrite the language, the usage is:
$('#newPassword').nfcuPasswordStrength({
	'strengthMeterContainer' : $('#passwordResetFormMeter'),
	'confirmPassword' : $('#confirmPassword'),
	'submitBtn' : $('#btnSubmitResetPassword'),
	'lang' : {
		maxPasswordAlert: 'Passwords may not contain more than 16 characters.',
		verifyPassAlert: 'Your passwords don\'t match',
        spaceAlert: 'Passwords may not contain spaces',
		strength: 'Strength Meter',
		weak : 'Weak',
		fair : 'Fair',
		good : 'Good',
		strong : 'Strong'
	}
});

Here are all the default options:
$('#newPassword').nfcuPasswordStrength({
	'strengthMeterContainer' : null,
	'confirmPassword' : null,
	'submitBtn' : null,
	'minLength' : 8,
	'maxLength' : 16,
	'lang' : {
		maxPasswordAlert: 'Passwords may not contain more than 16 characters.',
		verifyPassAlert: 'Your passwords don\'t match',
        spaceAlert: 'Passwords may not contain spaces',
		strength: 'Strength Meter',
		weak : 'Weak',
		fair : 'Fair',
		good : 'Good',
		strong : 'Strong'
	}
});

Available functions:
reset() - resets the UI to its initial state
submitConditionsMeet() - returns true/false if submit conditions pass/fail

Example usage:
var testPassword = $('#newPassword').nfcuPasswordStrength({
	'strengthMeterContainer' : $('#passwordResetFormMeter'),
	'confirmPassword' : $('#confirmPassword')
});

testPassword.reset();
********************************************/

/*jslint browser: true*/
/*global $, jQuery*/

(function ($) {
    'use strict';
    
	var nfcuPasswordStrength = new function () {
		var testNum = /[0-9]/g,
			testLower = /[a-z]/g,
			testUpper = /[A-Z]/g,
			testSpecial = /[!@#\$%\^\)\(+.,?_\-;\/\|\'\~\`{\[\]\}\:]/g,
			testaccent = /[<>=\\&\*"]/g,
			chklength = false,
			chknumber = false,
			chkspecial = false,
			chkupper = false,
			chkaccent = false;
		
        // counts the matched regexes
		
		this.countRegexp = function (val, rex) {
			var match = val.match(rex);
			return match ? match.length : 0;
		};
		
        // returns the strength of the password
		
		this.getStrength = function (val, minLength, maxLength) {
			var length = val.length,
                num = this.countRegexp(val, testNum),
				lower = this.countRegexp(val, testLower),
				upper = this.countRegexp(val, testUpper),
				special = this.countRegexp(val, testSpecial),
				accent = this.countRegexp(val, testaccent),
                strength = 0;
			       
            // calculations to add to strength based on requirements
			
			if (num) { strength += 2; }
			if (lower) { strength += 3; }
			if (upper) { strength += 3; }
			if (lower && upper) { strength += 2; }
			if (special) { strength += 5; }
			if (length > 10) { strength += 1; }
			if (length <  minLength || length > maxLength) { strength = 2; }
			if (!num || !(lower || upper) || !(length >= minLength && length <= maxLength)) { strength = 2; }
			if (length === 0) { strength = 0; }
			
			return strength;
		};
		
        // function to get the strength level - 0-5
		
		this.getStrengthLevel = function (val, minLength, maxLength) {
			var strength = this.getStrength(val, minLength, maxLength);
            
			if (strength > 0 && strength <= 4) {
                return 2;
            } else if (strength > 4 && strength <= 8) {
                return 3;
            } else if (strength > 8 && strength <= 12) {
                return 4;
            } else if (strength > 12) {
                return 5;
            } else {
                return 0;
            }
		};
		
        // verifies password length is at least the minimum length
		
		this.verifyPasswordLength = function (confirmPassword, minLength) {
			return (confirmPassword.length >= minLength) ? true : false;
		};
		
        // verifies password is valid
		
		this.verifyPassword = function (password, confirmPassword) {
			return (password !== '' && password === confirmPassword) ? true : false;
		};
        
        // Resets the UI to its initial state
		
        this.resetUI = function(el, settings) {
            // The password strength is disabled
            settings.strengthMeterContainer.removeClass('active');
            
            var meterbar = settings.strengthMeterContainer.find('.password-meter .meter-bar'),
			    meterbarText = settings.strengthMeterContainer.find('.password-meter .meter-text');
            
            // Remove all checkmarks
            
            settings.strengthMeterContainer.find('.strength-checklist li').removeClass('pass');
            
            // No styles set
            // Meter is at 0
            
            meterbar.width('0%').removeClass('strength-weak strength-fair strength-good strength-strong').attr('aria-valuenow', '0');
            
            // Reset meterbar text
            if (meterbarText.text() !== settings.lang.strength) {
                meterbarText.removeClass('active').stop(true, true).fadeOut(400, function () {
                    $(this).text(settings.lang.strength);
                }).fadeIn(400);
            }
            
            // remove alerts
            this.removeAlert(el, 'err-maxPassLimit');
            this.removeAlert(el, 'err-hasspecial');
            this.removeAlert(settings.confirmPassword, 'err-verifyPassword');
        };
		
		this.updateStrengthLevelUI = function (val, settings) {
			
			var currentValue = val.val(),
                meterbar = settings.strengthMeterContainer.find('.password-meter .meter-bar'),
			    meterbarText = settings.strengthMeterContainer.find('.password-meter .meter-text'),
                strength = this.getStrengthLevel(currentValue, settings.minLength, settings.maxLength),
                strengthClass = '',
                strengthText = '',
                strengthValue = '';
			
			/*between min-max characters*/
			if (currentValue.length >= settings.minLength && currentValue.length <= settings.maxLength) {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(1)').addClass('pass');
			    chklength = true;
			} else {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(1)').removeClass('pass');
				chklength = false;
			}
			
			// Alert if max is reached
			if (currentValue.length > settings.maxLength) {
				this.alertUser(val, settings.lang.maxPasswordAlert, 'err-maxPassLimit');
			} else {
				this.removeAlert(val, 'err-maxPassLimit');
			}
			
			/*at least one number*/
			
			if (currentValue.match(testNum)) {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(2)').addClass('pass');
			    chknumber = true;
			} else {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(2)').removeClass('pass');
				chknumber = false;
			}
			
			/*at least one uppercase*/
			
			if (currentValue.match(testUpper)) {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(3)').addClass('pass');
				chkupper = true;
			} else {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(3)').removeClass('pass');
				chkupper = false;
			}
			
			/*at least one special character*/
			
			if (currentValue.match(testSpecial)) {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(4)').addClass('pass');
				chkspecial = true;
			} else {
				settings.strengthMeterContainer.find('.strength-checklist li:nth-child(4)').removeClass('pass');
				chkspecial = false;
			}
			
			/* Test for Accent Characters and not allowable special characters */
			
			if (currentValue.match(testaccent)) {
				this.alertUser(val, settings.lang.specialAlert, 'err-hasspecial');
				//$('.customclass').addClass('form-control-error');
				chkaccent = false;
			} else {
				this.removeAlert(val, 'err-hasspecial');
				//$('.customclass').removeClass('form-control-error');
				chkaccent = true;
			}
			
			switch (strength) {
                case 2:
                    strengthValue = '25%';
                    strengthText = settings.lang.weak;
                    strengthClass = 'strength-weak';

                    break;
                case 3:
                    strengthValue = '50%';
                    strengthText = settings.lang.fair;
                    strengthClass = 'strength-fair';

                    break;
                case 4:
                    strengthValue = '75%';
                    strengthText = settings.lang.good;
                    strengthClass = 'strength-good';

                    break;
                case 5:
                    strengthValue = '100%';
                    strengthText = settings.lang.strong;
                    strengthClass = 'strength-strong';

                    break;
                default:
                    strengthValue = '0%';
                    strengthText = settings.lang.strength;
                    strengthClass = '';
			}
            
            meterbar.width(strengthValue).removeClass('strength-weak strength-fair strength-good strength-strong').addClass(strengthClass).attr('aria-valuenow', strengthValue);

            if (meterbarText.text() !== strengthText) {
                meterbarText
                    .stop(false, true)
                    .fadeOut(400, function () {
                        $(this).text(strengthText);
                    })
                    .stop(false, true)
                    .fadeIn(400)
                    .removeClass('active')
                    .addClass(function() {
                        return (strengthClass !== '') ? 'active' : '';
                    });
            }
			
            // if submit btn is specified, then toggle the submit btn
            if (settings.submitBtn) {
                this.toggleSubmitBtn(settings);
            }
		};
		
		this.alertUser = function (el, msg, className) {
			// Only append once
			if (el.parent().find('.' + className).length === 0 && !el.parent().next().hasClass(className)) {
				// Append to the bottom of the input group since there may be a text right below the password field
				
                // if the parent is either input-group or form-group, then add the has-error on those elements
                if (el.parent().hasClass('form-group')) {
                    el.parent().addClass('has-error');

                    if (el.parent().hasClass('has-group')) {
                        el.parent().after('<p class="text-muted text-danger ' + className + '">' + msg + '</p>');

                        return;
                    }
                } else {
                    el.addClass('has-error');
                }
                
				el.parent().append('<p class="text-muted text-danger ' + className + '">' + msg + '</p>');
			}
		};
		
		this.removeAlert = function (el, className) {
			if (el.parent().find('.' + className).length > 0) {
                
                // if the parent is either input-group or form-group, then remove the has-error from those elements
                if (el.parent().hasClass('form-group')) {
                    el.parent().removeClass('has-error');

                    if (el.parent().hasClass('has-group')) {
                        el.parent().next('.' + className).remove();

                        return;
                    }
                } else {
                    el.removeClass('has-error');
                }

				el.parent().find('.' + className).remove();
			}
		};
		
        // Toggles the submit btn depending on the requirements
		this.toggleSubmitBtn = function (settings) {
			// Enable/disable the submit btn
			if (this.submitConditionsMeet(settings)) {
				settings.submitBtn.removeAttr('disabled', 'disabled');
			} else {
				settings.submitBtn.attr('disabled', 'disabled');
			}
		};
		
        // function that checks if all requirements are fulfilled
		this.submitConditionsMeet = function (settings) {
			// Additional function
			var additionalCheck = true,
                confirmPassVerifies = this.verifyPasswordLength(settings.confirmPassword.val(), settings.minLength);
            // Current validation for confirm password
            
			if ($.isFunction(settings.additionalCheck)) {
	            // call user provided method
				additionalCheck = settings.additionalCheck.call();
	        }
			
			if ((chklength && chknumber && chkaccent && chkupper && chkspecial) && confirmPassVerifies && additionalCheck) {
				return true;
			} else {
				return false;
			}
		};
	};
	
	$.fn.nfcuPasswordStrength = function (options) {
		var settings = $.extend({
			'strengthMeterContainer' : null,
			'confirmPassword' : null,
			'submitBtn' : null,
			'minLength' : 8,
			'maxLength' : 32,
			'lang' : {
				maxPasswordAlert: 'Passwords may not contain more than 32 characters.',
				verifyPassAlert: 'Your passwords don\'t match',
				specialAlert:'Only these Special characters are allowed # $ % ` ^ , ( ) + . : | ? @ &#39; / [ ] _ { } ! ; - ~ ',
				strength: 'Strength Meter',
				weak : 'Weak',
				fair : 'Fair',
				good : 'Good',
				strong : 'Strong'
			},
			'additionalCheck' : null
		}, options);
		
		this.each(function () {
			
			var self = this;
			
			//disable the submit button
            if (settings.submitBtn) {
                settings.submitBtn.attr('disabled', 'disabled');
            }
            
			// The input for the password value changed
			$(this).on('keyup input propertychange', function() {
				nfcuPasswordStrength.updateStrengthLevelUI($(self), settings);
			}).focus(function () {
				settings.strengthMeterContainer.addClass('active');
			});
			
			// Update the ui for each keyup on the confirm password field - in case the user fills this field last
			settings.confirmPassword.on('keyup input propertychange', function () {
				nfcuPasswordStrength.updateStrengthLevelUI($(self), settings);
			});
			
			$(this).closest('form').submit(function (e) {
                // Check confirm password
                if (nfcuPasswordStrength.verifyPassword($(self).val(), settings.confirmPassword.val())) {
                    nfcuPasswordStrength.removeAlert(settings.confirmPassword, 'err-verifyPassword');

                    // Proceed to allow other actions on the click
                    
                    if (!nfcuPasswordStrength.submitConditionsMeet(settings)) {
                        return false;
                    }
                } else {
                    nfcuPasswordStrength.alertUser(settings.confirmPassword, settings.lang.verifyPassAlert, 'err-verifyPassword');
                    return false;
                }
			});
		});
		
        if (settings.submitBtn) {
            this.toggleSubmit = function () {
                nfcuPasswordStrength.toggleSubmitBtn(settings);
            };
        }
		
		this.submitConditionsMeet = function () {
			return nfcuPasswordStrength.verifyPassword($(this).val(), settings.confirmPassword.val()) && nfcuPasswordStrength.submitConditionsMeet(settings);
		};
        
        this.reset = function () {
            nfcuPasswordStrength.resetUI(this, settings);
        };
		
		return this;
	};
}(jQuery));