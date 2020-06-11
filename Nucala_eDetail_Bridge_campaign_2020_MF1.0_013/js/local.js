// --- local.js --- //
$(document).ready(function() {

    //$('#section_1').css('display','none');
    
    $(".button_b1").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b1').css('display','block');
        $('.button_b1').css('display','none');
        $('.foot_t').css('display','block');
    });

    $("#b1").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b1').css('display','none');
        $('.button_b1').css('display','block');
        $('.foot_t').css('display','none');
    });


    $(".button_b2").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b2').css('display','block');
        $('.button_b2').css('display','none');
    });

    $("#b2").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b2').css('display','none');
        $('.button_b2').css('display','block');
    });

    $(".button_b3").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b3').css('display','block');
        $('.button_b3').css('display','none');
        $('.box_1').css('display','block');
    });

    $("#b3").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#b3').css('display','none');
        $('.button_b3').css('display','block');
        $('.box_1').css('display','none');

        
    });

    $('#summary').addClass("activeNav");


});