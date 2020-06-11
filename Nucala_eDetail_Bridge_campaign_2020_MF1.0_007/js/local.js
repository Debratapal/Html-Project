// --- local.js --- //
$(document).ready(function() {


        com.gsk.mt.customSwipe({
            "leftSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_009",
            "leftPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
            "rightSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_002",
            "rightPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
            "upSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_008",
            "upPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN"
        });

    //$('#section_1').css('display','none');
    $('#section_2').css('display','none');


    $(".down_arrow").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#section_1').css('display','none');
        $('#section_2').css('display','block');
    });

    $(".up_arrow").on(com.gsk.mt.releaseEvent, function(e) { 
        $('#section_1').css('display','block');
        $('#section_2').css('display','none');
    });

});