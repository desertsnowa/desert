/*jslint browser: true*/
/*global $, O$, jQuery*/

/* Call frame buster */
manageFrames();

$(document).ready(function () {
    'use strict';
    
    // Function to validate last name
    function validateLastName(el) {
        if (!el.val().match(/^[a-zA-Z\'\-\ ]+$/)) {
            alertUser(el, errorLastName, 'err-invalidLastName');
        } else {
            removeAlert(el, 'err-invalidLastName');
        }
    }
    
    // Function to validate ssn
    function validateFormSSN(el) {
    	if (!validateSSN(el.val())) {
            alertUser(el, errorSSN, 'err-invalidSSN');
        } else {
            removeAlert(el, 'err-invalidSSN');
        }
    }
    
    // Function to validate email
    function validateEmail(el) {
        // RCF2822 - standard email validation regex
        var emailValidation = /[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g;
        if (!el.val().match(emailValidation)) {
            alertUser(el, errorEmail, 'err-invalidEmail');
		} else {
            removeAlert(el, 'err-invalidEmail');
		}
    }
    
    // Clear the initial page if there are no alerts indicating that this is the initial load of the page
    if($('#memberEnrollment .alert').length === 0) {
        clear_form_elements('#memberEnrollment');
    }
    
    // Validation
    $('#memberEnrollment').submit(function () {
        var enable = enrollment.lastName && enrollment.dobMonth && enrollment.dobYear && enrollment.ssn && enrollment.email;
        
		// validate last name
		validateLastName($('#memberEnrollment\\:lastName'));
		   
	    // validate email
	    validateEmail($('#memberEnrollment\\:applicant-email'));
	   
	    // validate ssn
	    validateFormSSN($('#memberEnrollment\\:ssn'));
    		   
        // If the number of has-error classes are greater than 0, stop the submission
        if ($('#memberEnrollment').find('.has-error').length > 0 || !enable) {
            return false;
        }
    });
    

	// Bind function to #signIn click event to disable the button after user clicks
    $('#memberEnrollment\\:btn-continue').click(function (event) {
        // Step 1 check
        var isValid = enrollment.lastName && enrollment.dobMonth && enrollment.dobYear && enrollment.ssn && enrollment.email;
        
        if (!isValid) {
            event.preventDefault();
        }
    });

    var enrollment = {
        lastName : ($.trim($('#memberEnrollment\\:lastName').val()) !== '') ? true : false,
        dobMonth : ($.trim($('#memberEnrollment\\:dobMonth').val()) !== '') ? true : false,
        dobYear : ($.trim($('#memberEnrollment\\:dobYear').val()) !== '') ? true : false,
        ssn : ($.trim($('#memberEnrollment\\:ssn').val()) !== '') ? true : false,
        email : ($.trim($('#memberEnrollment\\:applicant-email').val()) !== '') ? true : false
    };
    
    // When forms are reset, call the clear form elements to erase values that were rendered on load
	$('#memberEnrollment input[type="reset"]').click(function (e) {
        e.preventDefault();
        
        // Clear the form elements for the form
        clear_form_elements($(this).closest('form'));
        
        // Remove validation errors
        removeAlert($('#memberEnrollment\\:lastName'), 'err-invalidLastName');
        removeAlert($('#memberEnrollment\\:ssn'), 'err-invalidSSN');
        removeAlert($('#memberEnrollment\\:applicant-email'), 'err-invalidEmail');
        
        
        // resets the value of the select - since clear form elements are reseting the value this must be called
        $('select').selectpicker('refresh');
        
        // Toggle the nessasary continue/submit buttons
        toggleSubmitEnrollment();
    });
    
    function toggleSubmitEnrollment() {
		var enable = enrollment.lastName && enrollment.dobMonth && enrollment.dobYear && enrollment.ssn && enrollment.email;
		
		if (enable) {
			$('#memberEnrollment\\:btn-continue').removeAttr('disabled', 'disabled');
		} else {
			$('#memberEnrollment\\:btn-continue').attr('disabled', 'disabled');
		}
	}

    toggleSubmitEnrollment();

    // Check every keypress for ENTER key
    $('#memberEnrollment input').on('keydown', function (event) {
        var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode)),
            enable = enrollment.lastName && enrollment.dobMonth && enrollment.dobYear && enrollment.ssn && enrollment.email;

        if (keycode === 13 && enable) {
            $('#memberEnrollment\\:btn-continue').click();
        } else if (keycode === 13 && !enable) {
            return false;
        }
    });
	 
	/* Toggle the submit button for the reset password page 1 */
	$('#memberEnrollment\\:lastName').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			enrollment.lastName = true;
		} else {
			enrollment.lastName = false;
		}
		
		toggleSubmitEnrollment();
	});
	
	$('#memberEnrollment\\:dobMonth').change(function () {
		if ($.trim($(this).val()) !== '') {
			enrollment.dobMonth = true;
		} else {
			enrollment.dobMonth = false;
		}
		
		toggleSubmitEnrollment();
	});
	
	$('#memberEnrollment\\:dobYear').change(function () {
		if ($.trim($(this).val()) !== '') {
			enrollment.dobYear = true;
		} else {
			enrollment.dobYear = false;
		}
		
		toggleSubmitEnrollment();
	});

	$('#memberEnrollment\\:ssn').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			enrollment.ssn = true;
		} else {
			enrollment.ssn = false;
		}
		
		toggleSubmitEnrollment();
	});
	
	$('#memberEnrollment\\:applicant-email').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			enrollment.email = true;
		} else {
			enrollment.email = false;
		}
		
		toggleSubmitEnrollment();
	});
});