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
$('#newPassword').nfcuUsernameStrength({
	'strengthMeterContainer' : $('#passwordResetFormMeter'),
	'confirmPassword' : $('#confirmPassword')
});

If you want to overwrite the language, the usage is:
$('#newPassword').nfcuUsernameStrength({
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
$('#newPassword').nfcuUsernameStrength({
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
var testPassword = $('#newPassword').nfcuUsernameStrength({
	'strengthMeterContainer' : $('#passwordResetFormMeter'),
	'confirmPassword' : $('#confirmPassword')
});

testPassword.reset();
********************************************/

/*jslint browser: true*/
/*global $, jQuery*/

var toggleusersubmit = false;
(function ($) {
    'use strict';

	var nfcuUsernameStrength = new function () {
		var testNum = /[0-9]/g,
			testLower = /[a-z]/g,
			testUpper = /[A-Z]/g,
			testSpecial = /[!@#\$%\^\)\(+.,?_\-;\/\\'\~\`{\[\]\}\:\\]/g,
			testnonSpecial = /[<>\=\\\&\*"]/g,
			chkuserlength = false,
			chkuserletter = false,
			chkusernumber = false,
			chknonspecial = false;

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
				nonspecial = this.countRegexp(val, testnonSpecial),
				/*space = this.countRegexp(val, testSpace),*/
                strength = 0;

            // calculations to add to strength based on requirements

			if (num) { strength += 2; }
			if (lower) { strength += 3; }
			if (upper) { strength += 3; }
			if (lower && upper) { strength += 2; }
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

		this.verifyusernameLength = function (username, minLength) {
			return (username.length >= minLength) ? true : false;
		};


        // Resets the UI to its initial state
        this.resetUI = function(el, settings) {
            // The password strength is disabled
            settings.strengthMeterUserContainer.removeClass('active');

            var meterbar = settings.strengthMeterUserContainer.find('.password-meter .meter-bar'),
			    meterbarText = settings.strengthMeterUserContainer.find('.password-meter .meter-text');

            // Remove all checkmarks

            settings.strengthMeterUserContainer.find('.strength-userchecklist li').removeClass('pass');

            // No styles set
            // Meter is at 0

            meterbar.width('0%').removeClass('strength-weak strength-fair strength-good strength-strong').attr('aria-valuenow', '0');

            // Reset meter bar text

            if (meterbarText.text() !== settings.lang.strength) {
                meterbarText.removeClass('active').stop(true, true).fadeOut(400, function () {
                    $(this).text(settings.lang.strength);
                }).fadeIn(400);
            }

            // remove alerts
            this.removeAlert(el, 'err-maxPassLimit');
            this.removeAlert(el, 'err-hasSpecial');
        };

		this.updateStrengthLevelUI = function (val, settings) {

			var currentValue = val.val(),
                meterbar = settings.strengthMeterUserContainer.find('.password-meter .meter-bar'),
			    meterbarText = settings.strengthMeterUserContainer.find('.password-meter .meter-text'),
                strength = this.getStrengthLevel(currentValue, settings.minLength, settings.maxLength),
                strengthClass = '',
                strengthText = '',
                strengthValue = '';

			/*between min-max characters*/

			if (currentValue.length >= settings.minLength && currentValue.length <= settings.maxLength) {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(1)').addClass('pass');
			    chkuserlength = true;
			} else {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(1)').removeClass('pass');
				chkuserlength = false;
			}

			// Alert if max is reached

			if (currentValue.length > settings.maxLength) {
				this.alertUser(val, settings.lang.maxUsernameAlert, 'err-maxPassLimit');
			} else {
				this.removeAlert(val, 'err-maxPassLimit');
			}


			/*at least one letter*/

			if (currentValue.match(testLower) || currentValue.match(testUpper)) {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(3)').addClass('pass');
			    chkuserletter = true;
			} else {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(3)').removeClass('pass');
				chkuserletter = false;
			}

			/*at least one number*/
			if (currentValue.match(testNum)) {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(2)').addClass('pass');
			    chkusernumber = true;
			} else {
				settings.strengthMeterUserContainer.find('.strength-userchecklist li:nth-child(2)').removeClass('pass');
				chkusernumber = false;
			}

			/*at least one special character*/

			if(currentValue.match(testnonSpecial)){
				this.alertUser(val, settings.lang.specialAlert, 'err-hasSpecial');
				$('.userclass').css('border-color','#d31313');
				chknonspecial = false;
			} else {
				this.removeAlert(val, 'err-hasSpecial');
				$('.userclass').css('border-color','#c2c1bc');
				chknonspecial = true;
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
                if (el.parent().hasClass('form-group') || el.parent().hasClass('input-group')) {
                    el.parent().addClass('has-error');

                    if (el.parent().hasClass('input-group')) {
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
                if (el.parent().hasClass('form-group') || el.parent().hasClass('input-group')) {
                    el.parent().removeClass('has-error');

                    if (el.parent().hasClass('input-group')) {
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
			if (this.submitConditionsMeet(settings) && (toggleresetsubmit == true)) {
				settings.submitBtn.removeAttr('disabled', 'disabled');
			} else {
				settings.submitBtn.attr('disabled', 'disabled');
			}
		};

        // function that checks if all requirements are fulfilled

		this.submitConditionsMeet = function (settings) {
			if (chkuserlength && chkuserletter && chkusernumber && chknonspecial) {
				return toggleusersubmit = true;
			} else {
				//make the global vsariable usernameenable false
				return toggleusersubmit = false;
			}
		};
	};

	$.fn.nfcuUsernameStrength = function (options) {
		var settings = $.extend({
			'strengthMeterUserContainer' : null,
			'username' : null,
			'submitBtn' : null,
			'minLength' : 6,
			'maxLength' : 32,
			'lang' : {
				maxUsernameAlert: 'Username may not contain more than 32 characters.',
				specialAlert:'Only these Special characters are allowed # $ % ` ^ , ( ) + . : | ? @ &#39; / ] [ _ { } ! ; - ~ ',
				strength: 'Strength Meter User',
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
				nfcuUsernameStrength.updateStrengthLevelUI($(self), settings);
			}).focus(function () {
				settings.strengthMeterUserContainer.addClass('active');
			});

			// Update the ui for each keyup on the username field - in case the user fills this field last

			settings.username.on('keyup input propertychange load', function () {
				nfcuUsernameStrength.updateStrengthLevelUI($(self), settings);
			});

			$(this).closest('form').submit(function (e) {

			});
		});

        if (settings.submitBtn) {
            this.toggleSubmit = function () {
                nfcuUsernameStrength.toggleSubmitBtn(settings);
            };
        }

        this.submitConditionsMeet = function () {
			return nfcuUsernameStrength.submitConditionsMeet(settings);
		};

        this.reset = function () {
            nfcuUsernameStrength.resetUI(this, settings);
        };

		return this;
	};
}(jQuery));
