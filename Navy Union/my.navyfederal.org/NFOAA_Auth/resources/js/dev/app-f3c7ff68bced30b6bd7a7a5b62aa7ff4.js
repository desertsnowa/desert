/*jslint browser: true*/
/*global $, jQuery*/


var countdownStop = true,
    counter = 60,
    intervalId;

/**
 * Displays the session timeout modal window and starts the countdown
 * for the final 60 seconds of the session.  After 60 seconds, redirectLink() is
 * called to automatically go to the session error page.
 * @return
 */

function sessionTimer() {
    'use strict';
    
    O$('sessionTimeModal').showCentered();
	
	intervalId = setInterval(countdownTimer, 1000);
}

/**
 * Starts the session timeout countdown.  
 * @return
 */

function configureSessionTimeOut() {
    'use strict';
    
	var session_timeout = $('#session_timeout').val();
	O$('sessionTimeModal').hide();
	setTimeout(sessionTimer, session_timeout);
}

function redirectLink() {
    'use strict';
    
	// reset counter
	counter = 60;
	
	if (countdownStop) {
		window.top.location.href = 'loginec42.html?sto=t';
	} else {
		countdownStop = true;
	}
}

/**
 * Positions a modal window in the center of the screen.  Need to calculate
 * the center for IE browsers.  All other browsers can use showCentered().
 * @param windowID
 * @return
 */

function configureModalWindow(windowID) {
    'use strict';
    
    O$(windowID).showCentered();
	
	return false;
}


/**
 * Closes the modal window and navigates to the main NFCU marketing page.
 * @return
 */

function closeWindow() {
    'use strict';
    
	O$('sessionTimeModal').hide();
	window.top.location.href = 'login.html';
}

function countdownTimer() {
    'use strict';
    
	counter--;
	if (counter <= 0) {
		O$('sessionTimeModal').hide();
		redirectLink();
	}
	
	$('#countdown').html(counter);
}

function continueSession() {
    'use strict';
    
	countdownStop = false;
	clearInterval(intervalId);
	counter = 60;
	$('#countdown').html(counter);
	configureSessionTimeOut();
}

/**
 * Reloads the authentication code.  Random number is needed to prevent 
 * browser caching of call to the servlet.
 */

function resetCaptchaImage() {
    'use strict';
    
	var rnd = Math.floor((Math.random() * 1000000) + 1);
	$('#resetPassword\\:image1').attr('src', 'captcha?reset=true&rnd=' + rnd);
}

/**
 * Code for handling if request is for username lookup or password reset.
 * Currently we are not implementing username lookup but will keep this code for 
 * the time when usernames are user selected instead of access number.
 */
function setHiddenValue() {
    'use strict';
    
	var formId = $('form').attr('id');
    
	if (formId === 'retrieveUsername') {
		$('input#retrieveUsername\\:flag').val('U');
	} else {
		$('input#resetPassword\\:flag').val('P');
	}
}

function continueEvent() {
    'use strict';
    
	setHiddenValue();
}


function recaptchaWorks(response){
	 verifyCaptcha();
}


$(document).ready(function () {
    'use strict';
     
    /*console.log($('#resetPasswordNext\\:errWshasPII').val());
    console.log($('#resetPasswordNext\\:errWsInaprprtWrd').val());
    console.log($('#resetPasswordNext\\:errWsPastPwd').val());
    console.log($('#resetPasswordNext\\:errWsPwdhasDictWord').val());
    console.log($('#resetPasswordNext\\:errWsPwdhasUserName').val());*/
    
    
	configureSessionTimeOut();
	
	console.log("setting cancel attribute");
    $('#resetPassword\\:btn-cancel').attr('aria-label', 'Go to Sign In'); 
    $('#resetPasswordNext\\:btn-cancel').attr('aria-label', 'Go to Sign In'); 
    $('#securityQuestion\\:btn-cancel').attr('aria-label', 'Go to Sign In'); 
	
    /* custom select dropdown */
    
    $('select').selectpicker({
        style: 'form-control'
    });
    
    // open parent modal when find access number link is clicked
    $('#resetPassword #openFindAccessNumber').click(function() {
        // hide the forgot password modal
        window.parent.$('#modalForgotPassword').modal('hide');
        
        // show the parent find access number modal
        window.parent.$('#modalFindAccessNumber').modal('show');
    });
    
    // Clear security questions form on error/load
    clear_form_elements('#securityQuestion');
    
    // Clear the initial page if there are no alerts indicating that this is the initial load of the frame
    
    if($('#resetPassword .alert').length === 0) {
        clear_form_elements('#resetPassword');
    }
	
	
	$('#resetPassword, #resetPasswordNext').submit(resizeParentFrame);
    $('#resetPasswordNext\\:newPassword').focus(resizeParentFrame);
    
    // When forms are reset, call the clear form elements to erase values that were rendered on load
    
	$('#resetPassword input[type="reset"], #securityQuestion input[type="reset"], #resetPasswordNext input[type="reset"]').click(function(e) {
        e.preventDefault();
        
        // Clear the form elements for the form
        clear_form_elements($(this).closest('form'));
        
        // resets the value of the select - since clear form elements are reseting the value this must be called
        $('select').selectpicker('refresh');
        
        // Toggle the nessasary continue/submit buttons
        
        if(e.target.form && e.target.form.id === 'resetPasswordNext') {
            resetPasswordStrength.reset();
            resizeParentFrame();
            resetPasswordStrength.toggleSubmit();
        }

        if(e.target.form && e.target.form.id === 'securityQuestion') {
            togglesecurityQuestion();
        }
    });
    
	// Alert user if CAPS LOCK is on - must be on keypress to check if shift is on
	
	$('#resetPasswordNext\\:newPassword, #resetPasswordNext\\:confirmPassword')
        .keyup(resizeParentFrame)
        .keypress(checkCapsLock);
	

	var checkResetPasswordPage1 = {
		accessNumber : ($.trim($('#resetPassword\\:accessnumber').val()) !== '') ? true : false,
		dobMonth : ($.trim($('#resetPassword\\:birthMonth').val()) !== '') ? true : false,
		dobYear : ($.trim($('#resetPassword\\:birthYear').val()) !== '') ? true : false,
		authenticationCode: ($.trim($('#resetPassword\\:captcha-letter').val()) !== '') ? true : false
	};
	
	// Check every keypress for ENTER key
	
	$('#resetPassword input').bind('keydown', function (event) {
		var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode)),
			enable = checkResetPasswordPage1.accessNumber && checkResetPasswordPage1.dobMonth && checkResetPasswordPage1.dobYear && checkResetPasswordPage1.authenticationCode;
		
		if (keycode === 13 && enable) {
			$('#resetPassword\\:btn-continue').click();
		} else if (keycode === 13 && !enable) {
			event.preventDefault();
		}
	});
	
	/* Toggle the submit button for the reset password page 1 */
	
	$('#resetPassword\\:accessnumber').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			checkResetPasswordPage1.accessNumber = true;
		} else {
			checkResetPasswordPage1.accessNumber = false;
		}
		
		toggleSubmitResetPasswordPage1();
	});
	
	$('#resetPassword\\:birthMonth').change(function () {
		if ($.trim($(this).val()) !== '') {
			checkResetPasswordPage1.dobMonth = true;
		} else {
			checkResetPasswordPage1.dobMonth = false;
		}
		
		toggleSubmitResetPasswordPage1();
	});
	
	
	$('#resetPassword\\:birthYear').change(function () {
		if ($.trim($(this).val()) !== '') {
			checkResetPasswordPage1.dobYear = true;
		} else {
			checkResetPasswordPage1.dobYear = false;
		}
		
		toggleSubmitResetPasswordPage1();
	});
	
	function toggleSubmitResetPasswordPage1() {
		var enable = checkResetPasswordPage1.accessNumber && checkResetPasswordPage1.dobMonth && checkResetPasswordPage1.dobYear;
		
		if (enable) {
			$('#resetPassword\\:btn-continue').removeAttr('disabled', 'disabled');
		} else {
			$('#resetPassword\\:btn-continue').attr('disabled', 'disabled');
		}
	}
	
	toggleSubmitResetPasswordPage1();
	
	/* Toggle the submit button for the reset question */
	$('#securityQuestion\\:securityAnswer').on('keyup input propertychange', togglesecurityQuestion);
    
    function togglesecurityQuestion() {
        if ($.trim($('#securityQuestion\\:securityAnswer').val()).length < 2) {
			$('#securityQuestion\\:btn-continue').attr('disabled', 'disabled');
		} else {
			$('#securityQuestion\\:btn-continue').removeAttr('disabled', 'disabled');
		}
    }
	
	// Check every keypress for ENTER key
    
	$('#securityQuestion input').on('keydown', function (event) {
		var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode)),
			enable = ($.trim($('#securityQuestion\\:securityAnswer').val()) !== '') ? true : false;

		if (keycode === 13 && enable) {
			$('#securityQuestion\\:btn-continue').click();
		} else if (keycode === 13 && !enable) {
			event.preventDefault();
		}
	});
	
	// Disable continue btn on security question page
	
	togglesecurityQuestion();
	
	/* If a page that is using the masterLayout loads within an iframe,
	   lets update the height of the iframe so it looks nice
	*/
	
	if (window.location !== window.parent.location) {
		//alert("resizing frame");
		resizeParentFrame();
	}
	
	window.verifyCaptcha = function(){  
		isCaptchaSuccess = true;   
		toggleSubmitResetPasswordPage1();
	};

});




