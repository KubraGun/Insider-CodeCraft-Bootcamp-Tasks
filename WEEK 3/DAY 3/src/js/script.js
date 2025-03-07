$(document).ready(function() {
        // initialize form elements
        initializeDatepicker();
        initializePhoneMask();

        // set up form display
        $('#applyNowBtn').click(function() {
            $('#applicationFormContainer').fadeIn(500);
        });

        $('#closeFormBtn').click(function() {
            $('#applicationFormContainer').fadeOut(500);
        });

        /* set up form validation */
        setupFormValidation();

        /* Handle form submission */
        $('#jobApplicationForm').on('submit', function(event) {
            event.preventDefault();

            if($(this).valid()) {
                showSuccessMessage();
            }
        });
});

/* initialize datapicker */
function initializeDatepicker() {
    $('.datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        yearRange: "-100:+0",
        dateFormat: "mm/dd/yy",
        maxDate: new Date(),
        showAnim: "fadeIn"
    });
}

/* initialize number mask */
function initializePhoneMask() {
    // different mask format for every contry
    $('#countryCode').on("change", function() {
        updatePhoneMask();
    });

    updatePhoneMask();
}

function updatePhoneMask() {
    // remove current mask
    $('#phoneNumber').unmask();

    var countryCode = $('#countryCode').val();

    switch (countryCode) {
        case "+1": // ABD
            $("#phoneNumber").mask("999-999-9999");
            break;
        case "+44": // Birleşik Krallık
            $("#phoneNumber").mask("9999 999999");
            break;
        case "+90": // Türkiye
            $("#phoneNumber").mask("999 999 9999");
            break;
        case "+49": // Almanya
            $("#phoneNumber").mask("999 99999999");
            break;
        default:
            // Diğer ülkeler için genel maske
            $("#phoneNumber").mask("999 9999 9999");
    }
}

function setupFormValidation() {
    $('#jobApplicationForm').validate({
        rules: {
            fullName: {
                required: true,
                minlength: 3
            },

            email: {
                required: true,
                email: true
            },

            dateOfBirth: {
                required: true
            },

            phoneNumber: {
                required: true,
                minlength: 5,
                maxlength: 20
            },

            position: {
                required: true
            },

            resume: {
                extension: "pdf|docx",
                filesize: 5242880 // 5 mb
             }

        },

        // error messages
        messages: {
            fullName: {
                required: "Please enter your full name",
                minlength: "Your name must be at least 3 characters long"
            },
            email: {
                required: "Please enter your email address",
                email: "Please enter a valid email address"
            },
            dateOfBirth: {
                required: "Please select your date of birth"
            },
            phoneNumber: {
                required: "Please enter your phone number",
                minlength: "Phone number must be at least 5 digits",
                maxlength: "Phone number must not exceed 15 digits"
            },
            position: {
                required: "Please select a position you're applying for"
            },
            resume: {
                extension: "Please upload a PDF or DOCX file only",
                filesize: "File size must not exceed 5MB"
            }
        },

        // error element conf.
        errorElement: "label",

        errorPlacement: function(error, element) {
            error.insertAfter(element);
            error.fadeIn(300);
        },

        highlight: function(element) {
            $(element).addClass("error");
        },
        unhighlight: function(element) {
            $(element).removeClass("error");
        }

    });

    $.validator.addMethod("filesize", function(value, element, param) {
        if (element.files.length === 0) {
            return true; // skip validation if no file is selected
        }
        return this.optional(element) || (element.files[0].size <= param);
    }, "File size exceeds the allowed limit");
}

// success message
function showSuccessMessage() {
    $('#applicationFormContainer').fadeOut(300, function() {
        $("#successMessage").fadeIn(500);
        
        triggerConfetti();
        
        setTimeout(function() {
            $("#successMessage").fadeOut(500);
        }, 3000);
    });

}

function triggerConfetti() {
    var duration = 3 * 1000; //3 s
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#3C6E71', '#284B63', '#353535']
        });

        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#3C6E71', '#284B63', '#353535']
        });

        if (Date.now() < end) requestAnimationFrame(frame)
    })();
}

// visibility change
// store original title
var originalTitle = document.title;
var scrollingTitle;
var newTitle = "⚠️ You left! Your application is not completed... ";

// Detect tab visibility change
document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        startScrollingTitle(newTitle);
    } else {
        stopScrollingTitle();
    }
});

/**
 * Start scrolling the title text
 */
function startScrollingTitle(text) {
    let index = 0;
    stopScrollingTitle(); // Reset previous interval if exists
    scrollingTitle = setInterval(function() {
        document.title = text.substring(index) + text.substring(0, index);
        index = (index + 1) % text.length;
    }, 1000);
}

/**
 * Stop scrolling and reset to original title
 */
function stopScrollingTitle() {
    clearInterval(scrollingTitle);
    document.title = originalTitle;
}