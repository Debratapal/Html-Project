// --- local.js --- //
$(document).ready(function() {

    $('#b0').on(com.gsk.mt.releaseEvent, function () {
        if ($('#b0-c').css('display','none')) {
         $('#b0-c').css('display','block');
         $('#b0').css('display','none');
         $('.b-foot').css('display','block');
        } else {
        }
    });

    $('#b0-c').on(com.gsk.mt.releaseEvent, function () { 
        $('#b0-c').css('display','none');
        $('#b0').css('display','block');
        $('.b-foot').css('display','none');
    });


    $('#b1').on(com.gsk.mt.releaseEvent, function () {
        if ($('#b1-c').css('display','none')) {
         $('#b1-c').css('display','block');
         $('#b1').css('display','none');
         $('.b-foot').css('display','block');
        } else {
        }
    });

    $('#b1-c').on(com.gsk.mt.releaseEvent, function () { 
        $('#b1-c').css('display','none');
        $('#b1').css('display','block');
        $('.b-foot').css('display','none');
    });


    $('#b2').on(com.gsk.mt.releaseEvent, function () {
        if ($('#b2-c').css('display','none')) {
         $('#b2-c').css('display','block');
         $('#b2').css('display','none');
         $('.b-foot').css('display','block');
        } else {
        }
    });

    $('#b2-c').on(com.gsk.mt.releaseEvent, function () { 
        $('#b2-c').css('display','none');
        $('#b2').css('display','block');
        $('.b-foot').css('display','none');
    });


    $('#b3').on(com.gsk.mt.releaseEvent, function () {
        if ($('#b3-c').css('display','none')) {
         $('#b3-c').css('display','block');
         $('#b3').css('display','none');
         $('.b-foot').css('display','block');
        } else {
        }
    });

    $('#b3-c').on(com.gsk.mt.releaseEvent, function () { 
        $('#b3-c').css('display','none');
        $('#b3').css('display','block');
        $('.b-foot').css('display','none');
    });

    $('#portfolio').addClass("activeNav");


});