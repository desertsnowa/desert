/*jslint browser: true*/
/*global $, jQuery*/

$(document).ready(function () {
    'use strict';
    console.log("In ready function");
    $('#findAccessNumberForm\\:btn-cancel').attr('aria-label', 'Go to Sign In'); 
     // Function to validate last name
    function validateLastName(el) {
        if (!el.val().match(/^[a-zA-Z\'\-\ ]+$/)) {
        } else {
            removeAlert(el, 'err-invalidAccntNo');
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
    
	resizeParentFrame();
	
	
	/* custom select dropdown */
    $('select').selectpicker({
        style: 'form-control'
    });
	
	var findAccessNumber = {
		accntType : ($.trim($('#findAccessNumberForm\\:accntType').val()) !== '') ? true : false,
		accntNo : ($.trim($('#findAccessNumberForm\\:accntNo').val()) !== '') ? true : false,
		dobMonth : ($.trim($('#findAccessNumberForm\\:birthMonth').val()) !== '') ? true : false,
		dobYear : ($.trim($('#findAccessNumberForm\\:birthYear').val()) !== '') ? true : false,
		dobDay : ($.trim($('#findAccessNumberForm\\:birthDay').val()) !== '') ? true : false,
		ssn : ($.trim($('#findAccessNumberForm\\:ssn').val()) !== '') ? true : false
	};
    
    $('#findAccessNumberForm').submit(function() {
        var enable =  findAccessNumber.accntType && findAccessNumber.accntNo && findAccessNumber.dobMonth && findAccessNumber.dobYear  && findAccessNumber.dobDay && findAccessNumber.ssn;
        
        // validate last name
		//validateLastName($('#findAccessNumberForm\\:lastName'));
	   
	    // validate ssn
	    validateFormSSN($('#findAccessNumberForm\\:ssn'));
        
      //  resizeParentFrame();
    		   
        // If the number of has-error classes are greater than 0, stop the submission
        if ($('#findAccessNumberForm').find('.has-error').length > 0 || !enable) {
            return false;
        }
    });
	
	// Check every keypress for ENTER key
	$('#findAccessNumberForm input').on('keydown', function (event) {
		var keycode = (event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode)),
            enable = findAccessNumber.accntType && findAccessNumber.accntNo && findAccessNumber.dobMonth && findAccessNumber.dobYear && findAccessNumber.dobDay && findAccessNumber.ssn;
		
		if (keycode === 13 && enable) {
			$('#findAccessNumberForm\\:btn-continue').click();
		} else if (keycode === 13 && !enable) {
			event.preventDefault();
		}
	});
    
    function toggleSubmitFindAccessNumber() {
		var enable = findAccessNumber.accntType && findAccessNumber.accntNo && findAccessNumber.dobMonth && findAccessNumber.dobYear && findAccessNumber.dobDay && findAccessNumber.ssn;
		
		if (enable) {
			$('#findAccessNumberForm\\:btn-continue').removeAttr('disabled', 'disabled');
		} else {
			$('#findAccessNumberForm\\:btn-continue').attr('disabled', 'disabled');
		}
	}
    
     // When forms are reset, call the clear form elements to erase values that were rendered on load
	$('#findAccessNumberForm input[type="reset"]').click(function(e) {
        e.preventDefault();
        
        // Clear the form elements for the form
        clear_form_elements($(this).closest('form'));
        
        // resets the value of the select - since clear form elements are reseting the value this must be called
        $('select').selectpicker('refresh');
        
        // Remove validation errors
        removeAlert($('#findAccessNumberForm\\:accntNo'), 'err-invalidAccntNo');
        removeAlert($('#findAccessNumberForm\\:ssn'), 'err-invalidSSN');
        
        // Resize frame based on updated dom
        resizeParentFrame();
        
        // Toggle the nessasary continue/submit buttons
        toggleSubmitFindAccessNumber();
    });
    
    toggleSubmitFindAccessNumber();
	
	/* Toggle the submit button for thefindm y accesssnumber page  */
    
    $('#findAccessNumberForm\\:accntType').change(function () {
    	
    	$('#findAccessNumberForm\\:accntNo').val("");
    	findAccessNumber.accntNo = false;
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.accntType = true;
		} else {
			findAccessNumber.accntType = false;
		}
		
		toggleSubmitFindAccessNumber();
	});
    
    
	$('#findAccessNumberForm\\:accntNo').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.accntNo = true;
		} else {
			findAccessNumber.accntNo = false;
		}
		
		toggleSubmitFindAccessNumber();
	});
	
	$('#findAccessNumberForm\\:birthMonth').change(function () {
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.dobMonth = true;
		} else {
			findAccessNumber.dobMonth = false;
		}
		
		toggleSubmitFindAccessNumber();
	});
	
	
	$('#findAccessNumberForm\\:birthYear').change(function () {
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.dobYear = true;
		} else {
			findAccessNumber.dobYear = false;
		}
	
		toggleSubmitFindAccessNumber();
	});

	$('#findAccessNumberForm\\:birthDay').change(function () {
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.dobDay = true;
		} else {
			findAccessNumber.dobDay = false;
		}
		
		toggleSubmitFindAccessNumber();
	});


	$('#findAccessNumberForm\\:ssn').on('keyup input propertychange', function () {
		if ($.trim($(this).val()) !== '') {
			findAccessNumber.ssn = true;
		} else {
			findAccessNumber.ssn = false;
		}
		
		toggleSubmitFindAccessNumber();
	});
	
});