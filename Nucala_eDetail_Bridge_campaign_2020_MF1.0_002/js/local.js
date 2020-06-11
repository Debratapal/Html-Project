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
      console.log('range.value', range.value)
      rangeH.innerHTML = patientMap[range.value].split(" ")[0];

      $("#text_change").text(patientMap[range.value].split(" ")[1]);
      // $("#rangeH").val(patientMap[range.value]);
      // if ($("#rangeH").val() == 1)
      //   $("#text_change").text("PATIENT");
      // else
      //   $("#text_change").text("PATIENTS");
    };
  document.addEventListener("DOMContentLoaded", setValue);
  range.addEventListener('input', setValue);




});

const patientMap = {
  0: "0 PATIENTS",
  1: "0 PATIENTS",
  2: "1 PATIENT",
  3: "2 PATIENTS",
  4: "2 PATIENTS",
  5: "3 PATIENTS",
  6: "4 PATIENTS",
  7: "4 PATIENTS",
  8: "5 PATIENTS",
  9: "6 PATIENTS",
  10: "6 PATIENTS",
  11: "7 PATIENTS",
  12: "8 PATIENTS",
  13: "8 PATIENTS",
  14: "9 PATIENTS",
  15: "10 PATIENTS",
  16: "10 PATIENTS",
  17: "11 PATIENTS",
  18: "12 PATIENTS",
  19: "12 PATIENTS",
  20: "13 PATIENTS",
  21: "14 PATIENTS",
  22: "14 PATIENTS",
  23: "15 PATIENTS",
  24: "16 PATIENTS",
  25: "16 PATIENTS",
  26: "17 PATIENTS",
  27: "18 PATIENTS",
  28: "18 PATIENTS",
  29: "19 PATIENTS",
  30: "20 PATIENTS",
  31: "20 PATIENTS",
  32: "21 PATIENTS",
  33: "22 PATIENTS",
  34: "22 PATIENTS",
  35: "23 PATIENTS",
  36: "24 PATIENTS",
  37: "24 PATIENTS",
  38: "25 PATIENTS",
  39: "26 PATIENTS",
  40: "26 PATIENTS",
  41: "27 PATIENTS",
  42: "28 PATIENTS",
  43: "28 PATIENTS",
  44: "29 PATIENTS",
  45: "30 PATIENTS",
  46: "30 PATIENTS",
  47: "31 PATIENTS",
  48: "32 PATIENTS",
  49: "32 PATIENTS",
  50: "33 PATIENTS"
}