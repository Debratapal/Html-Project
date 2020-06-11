/**********************************************************/
/* GSK Veeva Master Template - Presentation Functionality */
/**********************************************************/
/* File version              1.8.1                        */
/* Last modified             27/11/2019                   */
/* Last modified by          Design Center                */
/**********************************************************/

// --- CUSTOM TO THIS PRESENTATION --- //



$(document).ready(function () {
  $('.objectionTitle.pageTitle').css('display', 'none');
  $('#email').css('pointer-events', 'none');
  $('#shortFlow').css('pointer-events', 'none');
  $('#referencesPage').css('display','none');
    $('#referencesAll').css('display','none');


  if ($("#setAnimations").length) {
    // --- SET TEXT ON HOME PAGE BUTTON --- //
    if (window.sessionStorage.getItem('mtgskAnimations') === '1') {
      $('#setAnimations').text("Animations are On");
    } else {
      $('#setAnimations').text("Animations are Off");
    }

    com.gsk.mt.bindInteraction("#setAnimations", "tap", {}, function () {
      if (window.sessionStorage.getItem('mtgskAnimations') === '1') {
        window.sessionStorage.setItem('mtgskAnimations', '0');
        $('#setAnimations').text("Animations are Off");
        com.gsk.mt.debug("Animations are Off");
      } else {
        window.sessionStorage.setItem('mtgskAnimations', '1');
        $('#setAnimations').text("Animations are On");
        com.gsk.mt.debug("Animations are On");
      }
    });
  }


  $({
    Counter: 0
  }).animate({
    Counter: $('.counti').text()
  }, {
    duration: 1000,
    easing: 'swing',
    step: function () {
      $('.counti').text(Math.ceil(this.Counter));
    }
  });


  $({
    Counter: 0
  }).animate({
    Counter: $('.counti1').text()
  }, {
    duration: 1000,
    easing: 'swing',
    step: function () {
      $('.counti1').text(Math.ceil(this.Counter));
    }
  });

  $('#summary').on(com.gsk.mt.releaseEvent, function () {
    $('#summary').addClass("activeNav");
  });


  $('#references').on(com.gsk.mt.releaseEvent, function () {
    $('.referencesPage').css('display','none');
    $('.referencesAll').css('display','none');
  });


//   $('#summary').on(com.gsk.mt.releaseEvent, function () {
//     if ($('#summary').hasClass("activeNav")) {
//     } else {
//       $('#summary').removeClass("activeNav");
//     }
// });

// $("#mtgskClose").on(com.gsk.mt.releaseEvent, function() {
//   event.preventDefault();
//   history.back(1);
// });




 //vertical

 $(window).on("orientationchange", function(evt) {


  var orient = window.orientation;
  console.log(orient);

  var portraitSlide = 'Nucala_eDetail_Bridge_campaign_2020_MF1.0_ver';

  if (orient === 0 || orient === 180) {
      console.log('portrait');
      window.sessionStorage.setItem('portrait', 'portrait');
      var prevSlide;

      prevSlide = com.gsk.mt.currentSlide;
      var prevOrientPresent = "";


      var ind = com.gsk.mtconfig.pagesAll.indexOf(prevSlide)
      console.log(ind)
      if (ind > -1) {
          prevOrientPresent = com.gsk.mtconfig.presentation;

      } else
          prevOrientPresent = com.gsk.mtconfig.referencesPresentation;
      console.log(prevSlide);
      if (prevSlide != portraitSlide)
          window.sessionStorage.setItem('prevOrientSlide', prevSlide);
      window.sessionStorage.setItem('prevPresentSlide', prevOrientPresent);
      //   com.veeva.clm.gotoSlide(portraitSlide + ".zip", "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN");
      com.gsk.mt.gotoSlide(portraitSlide, com.gsk.mtconfig.menuPresentation);
  }

  if (orient === 90 || orient === -90) {
      window.sessionStorage.removeItem('portrait');
      console.log('landscape');
      if (window.sessionStorage.getItem('landScape') === null) {
          var landPage = window.sessionStorage.getItem('prevOrientSlide');
          var landPres = window.sessionStorage.getItem('prevPresentSlide');
          com.gsk.mt.gotoSlide(landPage, landPres);
      } else {
          window.sessionStorage.removeItem('landScape');
      }


  }
});



});