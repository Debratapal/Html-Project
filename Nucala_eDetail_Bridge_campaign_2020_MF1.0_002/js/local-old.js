// --- local.js --- //


$(document).ready(function () {
  com.gsk.mt.customSwipe({
    "leftSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_007",
    "leftPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
    "rightSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_000",
    "rightPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN",
    "upSlide": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_003",
    "upPres": "Nucala_eDetail_Bridge_campaign_2020_MF1.0_MAIN"
  });


  const
    range = document.getElementById('range'),
    rangeV = document.getElementById('rangeV'),
    rangeH = document.getElementById('rangeH'),
    setValue = () => {
      const
        newValue = Number((range.value - range.min) * 100 / (range.max - range.min)),
        newPosition = 10 - (newValue * 0.33);
      rangeV.innerHTML = `<span>${range.value}</span>`;
      rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
      rangeH.innerHTML = `<span>${range.value}</span>`;
    };
  document.addEventListener("DOMContentLoaded", setValue);
  range.addEventListener('input', setValue);

  $("#range").on(com.gsk.mt.releaseEvent, function(e) { 
        $("#rangeH").val(range.value);
        if($("#rangeH").val() == 1) {
            $("#text_change").text("PATIENT");
          }
        else
          {
            $("#text_change").text("PATIENTS");
          }
            

            
});
});