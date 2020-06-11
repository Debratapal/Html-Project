// --- Race local.js --- //
var unique = function(data) {
    var a = data.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
    return obj;
}
var rowIter = 1;
// --- Product order update --- //
var html = html || {};
html.gsk = html.gsk || {};
html.gsk.local = {
    arr2: [],
    arr3: [],
    final_products: [],
    account_id: "",
    presentation_Id: "",
    product_Id: "",
    product_Name: "",
    final_productsWithId: [],
    final_productsWithJur: [],
    final_Product_Metrics_vod__c: [{
        CORE_GSK_Customer_Journey__c: "",
        CORE_GSK_Segment__c: "",
        Products_vod__c: "",
        LastModifiedDate: "",
    }],
    final_result_Products: [],
    productCurrentJourney: "",

    initialise: function() {
        console.log("initialise started");
        com.veeva.clm.getDataForCurrentObject("Account", "Id", function(result) {
            if (result.success) {
                this.account_id = result.Account.Id;
                html.gsk.local.getCurrentProduct();
            }
        });
    },
    getCurrentProduct: function() {
        com.veeva.clm.getDataForCurrentObject("KeyMessage", "Product_vod__c", html.gsk.local.getProducts);
    },

    getProducts: function(result) {
        if (result.success) {
            product_Id = result.KeyMessage.Product_vod__c;
            var fields = "Name, Id";
            var whereClause = "Id='" + product_Id + "'";
            com.veeva.clm.queryRecord("Product_vod__c", fields, whereClause, null, null, html.gsk.local.getProductMatrics)
        };
    },

    getProductMatrics: function(result) {
        callIds = [];
        if (result.success) {
            for (var i = 0; i < result.Product_vod__c.length; i++) {
                html.gsk.local.final_productsWithId.push(result.Product_vod__c[i]);
                callIds.push(result.Product_vod__c[i].Id);
            }
            var fields = "CORE_GSK_Customer_Journey__c, CORE_GSK_Segment__c, Products_vod__c, ID, LastModifiedDate";
            var whereClause = "Account_vod__c='" + this.account_id + "' AND Products_vod__c IN {'" + callIds.join("','") + "'}";
            com.veeva.clm.queryRecord("Product_Metrics_vod__c", fields, whereClause, null, null, html.gsk.local.Callback_ProductMatrics)
        };
    },
    getMonthbackDate: function(raceDaysCount) {
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - parseInt(raceDaysCount));
        oneWeekAgo = html.gsk.local.getMonthDate(oneWeekAgo)
        return oneWeekAgo;
    },
    getMonthDate: function(currentDate) {
        dateString = currentDate.getFullYear().toString();
        month = (currentDate.getMonth() + 1);
        if (month < 10) {
            dateString += "-0" + month;
        } else {
            dateString += "-" + month;
        }
        date = currentDate.getDate();
        if (date < 10) {
            dateString += "-0" + date;
        } else {
            dateString += "-" + date;
        }

        return dateString;
    },
    Callback_ProductMatrics: function(result) {
        if (result.success && !window.sessionStorage.getItem('newrecordId_' + com.gsk.mt.currentSlide)) {
            if (result.record_count == 0) {
                $('#product_dialog').trigger(com.gsk.mt.releaseEvent);
				 window.sessionStorage.setItem('race_value','Reach');
                 raceDetailing("Reach");
            } else if (com.gsk.mtconfig.enableRaceDaysValidation) {
				var temp = result.Product_Metrics_vod__c[0]['CORE_GSK_Customer_Journey__c'];
                window.sessionStorage.setItem('race_value',temp);
                raceDetailing(temp);
                if (com.gsk.mtconfig.raceDaysCount) {
                    if (html.gsk.local.getMonthbackDate(com.gsk.mtconfig.raceDaysCount) > html.gsk.local.getMonthDate(new Date(result.Product_Metrics_vod__c[0].LastModifiedDate)) || result.Product_Metrics_vod__c[0].LastModifiedDate == null) {
                        $('#product_dialog').trigger(com.gsk.mt.releaseEvent);
                    }
                }
            } else {
                $('#product_dialog').trigger(com.gsk.mt.releaseEvent);
				var temp = result.Product_Metrics_vod__c[0]['CORE_GSK_Customer_Journey__c'];
                window.sessionStorage.setItem('race_value',temp);
                raceDetailing(temp);
            }
            for (var k = 0; k < result.Product_Metrics_vod__c.length; k++) {
                result.Product_Metrics_vod__c[k].RecId = result.Product_Metrics_vod__c[k]['ID'];
                delete result.Product_Metrics_vod__c[k].ID;
            }
            for (var i = 0; i < html.gsk.local.final_productsWithId.length; i++) {
                for (var j = 0; j < result.Product_Metrics_vod__c.length; j++) {
                    if (html.gsk.local.final_productsWithId[i].Id == result.Product_Metrics_vod__c[j].Products_vod__c) {
                        html.gsk.local.final_productsWithJur.push(Object.assign(html.gsk.local.final_productsWithId[i], result.Product_Metrics_vod__c[j]));

                    }
                }

                if (result.Product_Metrics_vod__c.length == 0 || result.Product_Metrics_vod__c.length == null || result.Product_Metrics_vod__c.length == "undefined") {
                    for (var m = 0; m < html.gsk.local.final_Product_Metrics_vod__c.length; m++) {
                        html.gsk.local.final_productsWithJur.push(Object.assign(html.gsk.local.final_productsWithId[i], html.gsk.local.final_Product_Metrics_vod__c[m]));
                    }
                }
            }

            //for (var index in html.gsk.local.final_productsWithJur) {
            var cur_product = html.gsk.local.final_productsWithJur[0].Name.replace(/\s+/g, '');
            cur_product = cur_product.replace(/[\])}[{(]/g, '');
            cur_product = cur_product.replace(/\//g, '');
            addRow("accordion", [html.gsk.local.final_productsWithJur[0].Name, '<select id="Feedback_' + cur_product + "_" + html.gsk.local.final_productsWithJur[0].CORE_GSK_Customer_Journey__c + '" class="rowlist" data-description="' + html.gsk.local.final_productsWithJur[0].Name + '" data-rid="' + html.gsk.local.final_productsWithJur[0].RecId + '">\
                                                                          <option value="Reach">Reach</option>\
                                                                          <option value="Acquisition">Acquisition</option>\
                                                                          <option value="Conversion">Conversion</option>\
                                                                          <option value="Engagement">Engagement</option>\
                                                                          </select>'], '');

            if (html.gsk.local.final_productsWithJur[0].CORE_GSK_Customer_Journey__c.length > 0) {
                $("#Feedback_" + cur_product + "_" + html.gsk.local.final_productsWithJur[0].CORE_GSK_Customer_Journey__c).val(html.gsk.local.final_productsWithJur[0].CORE_GSK_Customer_Journey__c).attr("disabled", true);
            } else {
                $("#Feedback_" + cur_product + "_" + html.gsk.local.final_productsWithJur[0].CORE_GSK_Customer_Journey__c).val('Reach').attr("disabled", true);
            }
            // }
            $(function() {
                $("#accordion").accordion({
                    create: function(event, ui) {
                        if (com.gsk.mtconfig.raceQuestions.length == com.gsk.mtconfig.raceValues.length) {
                            for (var ind = 0; ind < com.gsk.mtconfig.raceQuestions.length; ind++) {
                                $(".ui-accordion-content").append('<label id="slide16feedbackLabel" class="Persona_lable" for="slide16feedback">' + com.gsk.mtconfig.raceQuestions[ind] + '</label><br/>\
                                                            <label class="lablepad"><input type="radio" id="Knowsbrand1" data-prod="' + cur_product + '" name="' + cur_product + '_answer' + ind + '" class="margin_25" value="Yes" data-rid="' + html.gsk.local.final_productsWithJur[0].RecId + '"/>' + com.gsk.mtconfig.raceValues[ind][0] + '</label>\
                                                            <label class="lablepad"><input type="radio" id="Knowsbrand2" data-prod="' + cur_product + '" name="' + cur_product + '_answer' + ind + '" class="margin_25" value="No" data-rid="' + html.gsk.local.final_productsWithJur[0].RecId + '"/>' + com.gsk.mtconfig.raceValues[ind][1] + '</label>\
                                                            <div class="clear"></div>');
                            }
                        } else {
                            $(".ui-accordion-content").text('Config declaration error: RACE Questions and RACE Values count should be the same')
                        }
                    },
                    collapsible: false
                });
            });
            productCurrentJourney = $(".rowlist").val();

        } else {
            return false;
        }
    },
    check: function(arr_obj, key) {
        var q1, q2, q3, q4, q5;
        var value1, value2, value3, value4;
        var product;
        var selcted_product;
        for (var i = 0; i < arr_obj.length; i++) {
            product = arr_obj[i].product;
            selcted_product = arr_obj[i].rid;
            if (arr_obj[i].Name == product + '_answer0') {
                q1 = arr_obj[i].Value;
            } else if (arr_obj[i].Name == product + '_answer1') {
                q2 = arr_obj[i].Value;
            } else if (arr_obj[i].Name == product + '_answer2') {
                q3 = arr_obj[i].Value;
            } else if (arr_obj[i].Name == product + '_answer3') {
                q4 = arr_obj[i].Value;
            } else if (arr_obj[i].Name == product + '_answer4') {
                q5 = arr_obj[i].Value;
            }

        }



        if (q1 == 'Yes') {
            value1 = 'Yes';
        } else {
            value1 = 'No';
        }
        if (q2 == 'Yes' || q3 == 'Yes') {
            value2 = 'Yes';
        } else {
            value2 = 'No';
        }
        if (q4 == 'Yes') {
            value3 = 'Yes';
        } else {
            value3 = 'No';
        }
        if (q5 == 'Yes') {
            value4 = 'Yes';
        } else {
            value4 = 'No';
        }
        console.log(value1, value2, value3, value4)
        /* selected answers convertion to 4 answers for checking journey end*/


        if (!$("select[data-rid='" + selcted_product + "']").hasClass("active")) {
            $("select[data-rid='" + selcted_product + "']").addClass('active');
        }

        /* converted 4 answers checking and update the journey value start*/
        if (value1 == 'No') {
            if (productCurrentJourney == 'Acquisition' || productCurrentJourney == 'Conversion' || productCurrentJourney == 'Engagement') {
                if (confirm('The Customer Journey is not an ideal recommendation. Please confirm if you would still like to proceed')) {
                    $("select[data-rid='" + selcted_product + "']").val("Reach");
                } else {
                    $("input[type=radio][data-rid='" + selcted_product + "']").prop('checked', false);
                    $(".race_submitBtn").prop('disabled', true);
                    $("select[data-rid='" + selcted_product + "']").removeClass('active');
                    $("select[data-rid='" + selcted_product + "']").val(productCurrentJourney);
                    delete result_object[key];
                    return false;
                }
            } else {
                $("select[data-rid='" + selcted_product + "']").val("Reach");
            }
        } else if (value1 == 'Yes' && value2 == 'No' && value3 == 'Yes' && value4 == 'Yes') {
            if (productCurrentJourney == 'Engagement') {
                if (confirm('The Customer Journey is not an ideal recommendation. Please confirm if you would still like to proceed')) {
                    $("select[data-rid='" + selcted_product + "']").val("Engagement");
                } else {
                    $("input[type=radio][data-rid='" + selcted_product + "']").prop('checked', false);
                    $(".race_submitBtn").prop('disabled', true);
                    $("select[data-rid='" + selcted_product + "']").removeClass('active');
                    $("select[data-rid='" + selcted_product + "']").val(productCurrentJourney);
                    delete result_object[key];
                    return false;
                }
            } else {
                $("select[data-rid='" + selcted_product + "']").val("Engagement");
            }

        } else if (value1 == 'Yes' && value2 == 'No' && value3 == 'Yes') {
            if (productCurrentJourney == 'Conversion' || productCurrentJourney == 'Engagement') {
                if (confirm('The Customer Journey is not an ideal recommendation. Please confirm if you would still like to proceed')) {
                    $("select[data-rid='" + selcted_product + "']").val("Conversion");
                } else {
                    $("input[type=radio][data-rid='" + selcted_product + "']").prop('checked', false);
                    $(".race_submitBtn").prop('disabled', true);
                    $("select[data-rid='" + selcted_product + "']").removeClass('active');
                    $("select[data-rid='" + selcted_product + "']").val(productCurrentJourney);
                    delete result_object[key];
                    return false;
                }
            } else {
                $("select[data-rid='" + selcted_product + "']").val("Conversion");
            }

        } else if (value1 == 'Yes' && value2 == 'Yes') {
            if (productCurrentJourney == 'Conversion' || productCurrentJourney == 'Engagement') {
                if (confirm('The Customer Journey is not an ideal recommendation. Please confirm if you would still like to proceed')) {
                    $("select[data-rid='" + selcted_product + "']").val("Acquisition");
                } else {
                    $("input[type=radio][data-rid='" + selcted_product + "']").prop('checked', false);
                    $(".race_submitBtn").prop('disabled', true);
                    $("select[data-rid='" + selcted_product + "']").removeClass('active');
                    $("select[data-rid='" + selcted_product + "']").val(productCurrentJourney);
                    delete result_object[key];
                    return false;
                }
            } else {
                $("select[data-rid='" + selcted_product + "']").val("Acquisition");
            }

        } else if (value1 == 'Yes' && value2 == 'No') {
            if (productCurrentJourney == 'Acquisition' || productCurrentJourney == 'Conversion' || productCurrentJourney == 'Engagement') {
                if (confirm('The Customer Journey is not an ideal recommendation. Please confirm if you would still like to proceed')) {
                    $("select[data-rid='" + selcted_product + "']").val("Reach");
                } else {
                    $("input[type=radio][data-rid='" + selcted_product + "']").prop('checked', false);
                    $(".race_submitBtn").prop('disabled', true);
                    $("select[data-rid='" + selcted_product + "']").removeClass('active');
                    $("select[data-rid='" + selcted_product + "']").val(productCurrentJourney);
                    delete result_object[key];
                    return false;
                }
            } else {
                $("select[data-rid='" + selcted_product + "']").val("Reach");
            }

        }
        $(".race_submitBtn").prop('disabled', false);
    }

};


//html.gsk.local.initialise();
function addRow(tblName, colData, colData2) {
    var table = $('#' + tblName);
    table.append('<h3>' + colData[0] + '<div class="prod">' + colData[1] + '</div></h3>');
    table.append('<div>' + colData2 + '</div>');
}

var rec_counter = 0;
var updateRecords = [];
var result_object = {};
var bool = true;

$('html body').on('change', 'input[type=radio]', function() {
    var key = $(this).attr('data-rid');
    var name = $(this)[0].name;
    var value = $(this).val();
    var obj = {};
    obj['Name'] = name;
    obj['Value'] = value;
    obj['product'] = $(this).attr('data-prod');
    obj['rid'] = key;

    if (result_object[key]) {
        var temp = {};
        for (var i = 0; i < result_object[key].length; i++) {
            if (result_object[key][i].Name === obj.Name) {
                temp.value = obj.Value;
                temp.index = i;
                break;
            }
        }
        if (temp.value) {
            result_object[key][temp.index].Value = temp.value;
            if (result_object[key].length == 5) {
                setTimeout(function() {
                    html.gsk.local.check(result_object[key], key)
                }, 150);
            }
        } else {
            result_object[key].push(obj);
            if (result_object[key].length == 5) {
                setTimeout(function() {
                    html.gsk.local.check(result_object[key], key)
                }, 150);
            }
        }

    } else {
        result_object[key] = [];
        result_object[key].push(obj);
    }
});




function race_submit() {
    window.sessionStorage.setItem('newrecordId_' + com.gsk.mt.currentSlide, true);
    var questions = "";
    var answers = "";
    var length = $(".rowlist").length;
    var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide);
    $.each($(".rowlist"), function(index, element) {
        var $this = $(this);
        var type = $this.attr('data-description');
        var answer = $this.val();
        var clickStream;
        if (index === (length - 1)) {
            questions += type;
            answers += answer;
        } else {
            questions += type + '/';
            answers += answer + '/';
        }
    });
    clickStreamArray = [{
        Track_Element_Id_vod__c: com.gsk.mtconfig.pagesTitles[slideIndex],
        Track_Element_Type_vod__c: "Questionnaire",
        Track_Element_Description_vod__c: "Product Journey",
        Question_vod__c: questions,
        Answer_vod__c: answers
    }];   
	window.sessionStorage.setItem('race_value',answers);
    raceDetailing(answers)
    com.gsk.mt.clickStreamSubmit(clickStreamArray, callbackRecUpdate);
};

function callbackRecUpdate(result) {
    $.each($(".rowlist"), function(index, element) {
        var $this = $(this);
        var type = $this.attr('data-rid');
        var answer = $this.val();
        var clickStream;
        if ($(this).hasClass('active')) {
            updateRecords.push({
                Name: type,
                Journey: answer
            })
        }
    });
    rec_counter = 0;
    sendRequest();
}

function sendRequest() {
    if (rec_counter < updateRecords.length) {
        updateJourneyRecords(updateRecords[rec_counter].Name, updateRecords[rec_counter].Journey);
        rec_counter++;
    } else {
        callback();
    }

};

function updateJourneyRecords(key, value) {
    var object = "Product_Metrics_vod__c";
    if (key !== "undefined") {
        var clickStream = {
            CORE_GSK_Customer_Journey__c: value
        };
        com.veeva.clm.updateRecord(object, key, clickStream, function(results) {
            if (results.success) {
                sendRequest();
            }
        });
    } else {
        var clickStream = {
            CORE_GSK_Customer_Journey__c: value,
            Products_vod__c: product_Id,
            Account_vod__c: account_id
        };
        com.veeva.clm.createRecord(object, clickStream, function(results) {
            if (results.success) {
                sendRequest();
            }
        });

    }
};

function callback() {
    $(".ui-dialog button.ui-dialog-titlebar-close").trigger("click");
};
function raceDetailing(temp){
	if($('.block-list li').length > 0){
		$('.block-list li').each(function(){
			if($(this).attr('data-id')==temp ){
				$('.block-list li').removeClass('active')
				$(this).addClass('active');
			}
		});
	};
};
$(document).ready(function() {    
	if(com.gsk.mt.isVeeva){
		html.gsk.local.initialise();
		$(".race_submitBtn").prop('disabled', true);
	}
    $(".race_submitBtn").on('click', function() {
        race_submit();
    });
})