// --- local.js --- //
$( document ).ready(function() {
    com.gsk.mt.customSwipe({
        "leftSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_011",
        "leftPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
        "rightSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_007",
        "rightPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
        "downSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_009",
        "downPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN"
    });


    
    
    $('.magni_icon_2').click(function () {
        $('.graph_bg').addClass('scaled');
        $('.magni_icon_2').hide();
        $('.summery_bullet').css('left','650rem');
        $('.sub_head').css('top','195rem');
        $('.x-text_3').css('top','325rem');
    }); 

    $('.graph_bg').click(function () {
        $('.graph_bg').removeClass('scaled');
        $('.magni_icon_2').show();
        $('.summery_bullet').css('left','740rem');
        $('.sub_head').css('top','225rem');
        $('.x-text_3').css('top','338rem');
    }); 

});