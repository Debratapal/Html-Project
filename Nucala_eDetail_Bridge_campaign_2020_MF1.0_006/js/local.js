// --- local.js --- //

$(document).ready(function() { 

    $( document ).ready(function() {
        com.gsk.mt.customSwipe({
            "leftSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_007",
            "leftPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
            "rightSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_000",
            "rightPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
            "downSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_005",
            "downPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN"
        });
    });

    $(".down_arrow_1").show();

    // $("#tab1").click(function(){
    //     $(this).toggleClass("tab_head1_active");
    // });

    $('#tab1').click(function () {
       
        if ($(this).hasClass('tab_head1_active')) {
         $(this).addClass('pointer-events','none');
        } else {
            $(this).removeClass('tab_head1');
            $(this).addClass('tab_head1_active');
            $('.down_arrow_1').show();
            $('.down_arrow_2').hide();
            $('#tab2').removeClass('tab_head2_active');
            $('#tab2').addClass('tab_head2');
            $('.box_1').show();
            $('.box_2').hide();
            $('.table1_content').removeClass('scaled');
            $('.table2_content').removeClass('scaled');
            $('.magni_icon_1').show();
            $('.magni_icon_2').show();
            $('#c8').css('display','block');
            $('#c9').css('display','none');
        }
    });

    $('#tab2').click(function () {
       
        if ($(this).hasClass('tab_head2_active')) {
         $(this).addClass('pointer-events','none');
        } else {
            $(this).removeClass('tab_head2');
            $(this).addClass('tab_head2_active');
            $('.down_arrow_2').show();
            $('.down_arrow_1').hide();
            $('#tab1').removeClass('tab_head1_active');
            $('#tab1').addClass('tab_head1');
            $('.box_2').show();
            $('.box_1').hide();
            $('.table1_content').removeClass('scaled');
            $('.table2_content').removeClass('scaled');
            $('.magni_icon_1').show();
            $('.magni_icon_2').show();
            $('#c9').css('display','block');
            $('#c8').css('display','none');
        }
    });

    $('.magni_icon_1').click(function () {
        $('.table1_content').addClass('scaled');
        $('.magni_icon_1').hide();
    }); 

    $('.table1_content').click(function () {
        $('.table1_content').removeClass('scaled');
        $('.magni_icon_1').show();
    }); 


    
    $('.magni_icon_2').click(function () {
        $('.table2_content').addClass('scaled');
        $('.magni_icon_2').hide();
    }); 

    $('.table2_content').click(function () {
        $('.table2_content').removeClass('scaled');
        $('.magni_icon_2').show();
    }); 

   


    


});