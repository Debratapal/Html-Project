/**************************************************/
/* GSK Veeva Master Template - Core Functionality */
/**************************************************/
/* File version              1.8.1                */
/* Last modified             27/11/2019           */
/* Last modified by          Design Center        */
/**************************************************/

var com = com || {};
com.gsk = com.gsk || {};
com.gsk.mt = {

    // Custom object container
    custom: {},

    /* DOM Caching */
    dom: {
        body             : $("body"),
        container        : $("#container"),
        mainContent      : $(".mainContent"),
        navBottom        : $(".navBottom"),
        background       : $(".bg"),
        email            : null,
        fragmentSelector : null
    },

    /* API fields mapping */
    apiFields: {
        Answer                  : "Answer_vod__c",
        AuxillaryId             : "AuxillaryId_vod__c",
        Call                    : "Call_vod__c",
        CLMID                   : "CLM_ID_vod__c",
        KeyMessage              : "Key_Message_vod__c",
        MobileID                : "Mobile_ID_vod__c",
        ParentId                : "ParentId_vod__c",
        PopupOpened             : "Popup_Opened_vod__c",
        PossibleAnswers         : "Possible_Answers_vod__c",
        PreferredName           : "Preferred_Name_vod__c",
        PresentationID          : "Presentation_ID_vod__c",
        Product                 : "Product_vod__c",
        SurveyQuestion          : "Question_vod__c",
        RangeValue              : "Range_Value_vod__c",
        Revision                : "Revision_vod__c",
        RolloverEntered         : "Rollover_Entered_vod__c",
        SelectedItems           : "Selected_Items_vod__c",
        SurveyType              : "Survey_Type_vod__c",
        TextEntered             : "Text_Entered_vod__c",
        ToggleButtonOn          : "Toggle_Button_On_vod__c",
        TrackElementDescription : "Track_Element_Description_vod__c",
        TrackElementId          : "Track_Element_Id_vod__c",
        TrackElementType        : "Track_Element_Type_vod__c",
        UsageDuration           : "Usage_Duration_vod__c",
        UsageStartTime          : "Usage_Start_Time_vod__c"
    },

    /* Interaction */
    isVeeva       : false,
    isEngage      : false,
    extension     : ".html",
    blockSwipes   : false,
    blockLinks    : false,
    blockClose    : false,
    lastSwipeTime : 0,
    pressEvent    : "mousedown",
    releaseEvent  : "mouseup",
    exitEvent     : "beforeunload",
    fastClick     : null,
    tap           : 0,
    isNoSwipe     : false,

    /* References */
    linkReferences  : null,
    slideReferences : null,
    slideFootnotes  : null,
    slideRefTarget  : null,
    currentRefs     : null,
    dialogHeight    : null,

    /* Animation */
    animations: 1,

    /* Zoom */
    canZoom      : false,
    hasZoom      : false,
    zoomInterval : null,

    /* Navigation */
    swipable        : false,
    scrolling       : false,
    currentFlow     : 0,
    flows           : {},
    currentSlide    : "",
    currentPres     : "",
    previousSlide   : "",
    nextSlide       : "",
    activeQuickLink : null,
	swiper			: [],
	swiperArray		: [],
	activePopup		: null,
	tabStartTime	: null,
	inlinetabStartTime: null,
	video_startTime:null,

    /* Email */
    emailFragments: [],

    /* Tracking */
    trackedLink    : null,
    exitingSlide   : false,
    players        : [],
    currentVideo   : null,
    lastStartTime  : null,
    accountId      : null,
    presentationId : null,
    cstreamStack   : [],
    feedback       : null,
    sendFeedback   : false,

    /* Safeguards */
    maxIterations       : 100, // Maximum number of form elements to process
    orientationInterval : 100, // delay between allowing orientation checks
    orientationLastPoll : 0,

    /* Dialogs */
    dialogStack: [], // Holds an array of all open dialogs in order opened

    /**
     * Initialisation of MT
     */
    initialise: function() {
		
		com.gsk.mt.isVeeva = com.gsk.mt.isVeevaEnvironment();
        com.gsk.mt.setEnvironment();
		com.gsk.mt.quickRes();
		com.gsk.mt.videopop();
		com.gsk.mt.tabs();
		com.gsk.mt.videopopupClose();		

        if (navigator.userAgent.match(/iPad/i) !== null ||
            navigator.userAgent.match(/iPhone/i) !== null)
        {
            com.gsk.mt.exitEvent = "pagehide";
        }

        com.gsk.mt.currentSlide = com.gsk.mt.getCurrentSlide();
        com.gsk.mt.currentPres = com.gsk.mt.getCurrentPres();
        com.gsk.mt.currentFlow = com.gsk.mt.getCurrentFlow();
        com.gsk.mt.previousSlide = com.gsk.mt.getPreviousSlide();
        com.gsk.mt.nextSlide = com.gsk.mt.getNextSlide();
        com.gsk.mt.isNoSwipe = com.gsk.mt.dom.container.hasClass("noSwipe");

        com.gsk.mt.initZoom();

        // If not using veeva swiping store the current slide and presentation
        // so that slides outside the flow can return to the correct slide.
        if (com.gsk.mtconfig.veevaSwipe === "0") {
			if(com.gsk.mt.currentFlow !="Main" && jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.flows[com.gsk.mt.currentFlow]) > -1) { 
                window.sessionStorage.setItem('mtgskPreviousSlide', com.gsk.mt.currentSlide);
                window.sessionStorage.setItem('mtgskPreviousPres', com.gsk.mtconfig.presentation);
            }else if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) == -1) {
                window.sessionStorage.setItem('mtgskPreviousSlide', com.gsk.mt.currentSlide);
                window.sessionStorage.setItem('mtgskPreviousPres', com.gsk.mtconfig.presentation);
            }
        }
		
		
        // If com.gsk.mtconfig.importPi is true and this slide is the PI
        if (com.gsk.mtconfig.importPi && com.gsk.mt.currentSlide === com.gsk.mtconfig.pi) {
            // Import the PI content
            com.gsk.mt.initPi();
        }

        // If com.gsk.mtconfig.importObjection is true and this slide is the PI
        if (com.gsk.mtconfig.importObjection && com.gsk.mt.currentSlide === com.gsk.mtconfig.objection) {
            // Import the Objection content
            com.gsk.mt.initObjection();
        }

        // If the slide is a guide slide, initialise it.
        if (com.gsk.mt.isGuideSlide()) {
            // Import the Guide content
            com.gsk.mt.initGuide();
        }

        // Init techOrder for video.js if logged videos are present
        if ($(".logVideo").length) {
            videojs.options.techOrder = ['html5'];
        }

        // Initialise US elements if specified and present
        if (com.gsk.mtconfig.mtgskUS && $("#isiRail").length > 0) {
            com.gsk.mt.initUS();
        }

        com.gsk.mt.initPortfolio();
        com.gsk.mt.initNavigation();
        com.gsk.mt.initReferences();
        com.gsk.mt.initTracking();
        com.gsk.mt.initSubSlides();
        // Only initialise email if com.gsk.mtconfig.useEmail is true
        if (com.gsk.mtconfig.useEmail) {
            com.gsk.mt.initEmail();
        }
		
		if (com.gsk.mtconfig.useEmail && com.gsk.mtconfig.useShoppingCartEmail) {
            com.gsk.mt.initShopEmail();
        }

        $("body").css("touch-action", "none");

        com.gsk.mt.initDialogs();
		//com.gsk.mt.enableSwipeDialog();

        // noSwipe elements will prevent swiping to the next and previous slide
        // Now allows noSwipe elements to be inserted dynamically.
        com.gsk.mt.dom.body.on(com.gsk.mt.pressEvent, ".noSwipe, .noSwipe *", function(e) {
            com.gsk.mt.blockSwipes = true;
            setTimeout(function() {
                com.gsk.mt.blockSwipes = false;
            }, 500);
            e.stopPropagation();
        });

        // Initialise scrollable elements - timeout is required to allow rendering to complete.
        setTimeout(function() {
            com.gsk.mt.initScrollable();
            $("#customMenu").removeClass("load");
        }, 500);

        if (com.gsk.mt.onInitPres !== undefined) {
            com.gsk.mt.onInitPres();
        }

        if (com.gsk.mt.onInit !== undefined) {
            com.gsk.mt.onInit();
        }
		
		
    },
	
	/**
     * Initialise Quickres slide
    */	
	quickRes: function() {
		var container = $("#quickresContainer"); 
		var quickResLen = com.gsk.mtconfig.quickResAll.length;
		var resName = com.gsk.mtconfig.quickResAll.name;
		var resUrl = com.gsk.mtconfig.quickResAll.url;
		var resThumb = com.gsk.mtconfig.quickResAll.thumbUrl;
		var dataField, dataDescription;		
		if (container.length > 0 && quickResLen > 0) {
            for (var i = 0, j = 0; i < quickResLen; i++) {
                if (j === 0) {
                    container.append('<div class="gskRow">');
                }
				resName = com.gsk.mtconfig.quickResAll[i].name;
				resUrl = com.gsk.mtconfig.quickResAll[i].url;
				resThumb = com.gsk.mtconfig.quickResAll[i].thumbUrl;
				dataField = com.gsk.mtconfig.quickResAll[i].dataFields;
				dataDescription = com.gsk.mtconfig.quickResAll[i].dataDescription;	
				
                container.append('<div class="gskCol gskCol' + com.gsk.mtconfig.quickresPerRow +'"><a href="'+resUrl+'"><img class="logClick" src="'+resThumb+'" width="100%" data-fields="'+dataField+'"data-description="'+dataDescription+'"/></a><h5>'+resName+'</h5></div>');

                
                if (j === com.gsk.mtconfig.quickresPerRow - 1 || i === quickResLen - 1) {
                    j = 0;
                    container.append('</div>');
                } else {
                    j++;
                }
            }
		}				
        $('.quickResTitle.pageTitle').html(com.gsk.mtconfig.localisation.quickRes);
		
	},
	
	/**
     * Initialise Video Dialog
    */
	
	videopop: function(){
		var	video_clickStreamArray=[];
		com.gsk.mt.onVideoDialogOpen = function() {
		var activeDialog = com.gsk.mt.getActiveDialog();			
			if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.hasClass("videoDialog")) {
				com.gsk.mt.video_startTime=null;
				var $this = $(activeDialog).find("video");
				$this.on("play", function () {
				com.gsk.mt.currentVideo = $this;			                   
				com.gsk.mt.video_startTime = new Date();					
				video_clickStreamArray = [
					{
						Track_Element_Id_vod__c: $this.attr("data-trackid"),
						Track_Element_Type_vod__c: $this.attr("data-tracktype"),							
						Selected_Items_vod__c: $this.attr("data-SelectedItems"),
						Track_Element_Description_vod__c: $this.attr("data-description")
					}
				];
				video_clickStreamArray = JSON.stringify(video_clickStreamArray);
			});
			$this.off("pause").on("pause", function () {
					if (com.gsk.mt.currentVideo === $this) {
                            com.gsk.mt.currentVideo = null;
                        }		 
					if (com.gsk.mt.video_startTime !== null) {				
						// Retrieve the data and store in a variable.
						video_clickStreamArray = JSON.parse(video_clickStreamArray);
						video_clickStreamArray[0].Usage_Duration_vod__c = Math.round((new Date() - com.gsk.mt.video_startTime) / 1000);						
						//}
				
						// Write					
							com.gsk.mt.clickStreamSubmit(video_clickStreamArray);	
							com.gsk.mt.video_startTime=null;
							video_clickStreamArray="";				
					}
			});
			$this.on("ended", function () {					
				this.load();		
			});
		}
		};
	},
	
	videopopupClose : function() {
		var activeDialog = com.gsk.mt.getActiveDialog();
		if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.hasClass("videoDialog")) {
			activeDialog.find('video').each(function() {                    
    			this.pause();
    			this.currentTime = 0;
				com.gsk.mt.currentVideo = null;						              
  			}); 		
		}
	},
	
	/**
     * Initialise tabs Dialog
    */
	
	tabs: function(){
	 	var $tabs = $("#container .logTab");
	 	var activeTab = null;
		com.gsk.mt.onTabContetOpen = function() {
			if ($tabs.length) {
				com.gsk.mt.inlinetabStartTime = new Date();								
				if($tabs.hasClass("active")){
					activeTab = $("#container .logTab.active");
				}else{
					$.each($tabs, function (index, el) {
					  if(index == 0){
						 activeTab = $(this);
						 $(this).addClass('active');
					  }
			   		});	
				}				
			}
		};
		com.gsk.mt.onTabContetOpen();
		com.gsk.mt.onTabDialogOpen = function() {
			com.gsk.mt.tabStartTime = new Date();					
			var activeDialog = com.gsk.mt.getActiveDialog();
			if(activeDialog !== null && activeTab !== null && com.gsk.mt.dialogStack.length == 1 ){
				com.gsk.mt.trackField(activeTab, Math.round((new Date() - com.gsk.mt.inlinetabStartTime) / 1000));
			}else if(!$('#customMenuWrapper').is(':visible') && activeTab !== null && !(com.gsk.mt.dialogStack.length > 1)){
				com.gsk.mt.trackField(activeTab, Math.round((new Date() - com.gsk.mt.inlinetabStartTime) / 1000));
			}
			if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.parent().find(".logTab").length){
				$.each(activeDialog.parent().find(".logTab"), function (index, el) {
				  var $this = $(this);             
				  if(index == 0){
					$this.addClass('active');						  
				  }else{
					$this.removeClass('active');  
				  }
			   });				   
			}
		};			
		$("body").on(com.gsk.mt.releaseEvent, ".logTab", function(e) {
			var activeDialog = com.gsk.mt.getActiveDialog();
			if (activeDialog != null && !activeDialog.hasClass("quickLinkDialog")) {
				var $this = activeDialog.parent().find(".logTab.active");						
				com.gsk.mt.trackField($this, Math.round((new Date() - com.gsk.mt.tabStartTime) / 1000));
				$this.removeClass('active');												
				$(this).addClass('active');
				com.gsk.mt.tabStartTime = new Date();
			}else if(activeDialog == null){
				var $this = $(this); 
				$.each($tabs, function (index, el) {
				  var $el = $(el);									              
				  if($el.hasClass("active")){
					com.gsk.mt.trackField($el, Math.round((new Date() - com.gsk.mt.inlinetabStartTime) / 1000));						  
				  }
				  $el.removeClass('active');
			   });
			   com.gsk.mt.inlinetabStartTime = new Date();
			   $this.addClass('active');
			   activeTab = $this;
			}
		});
		com.gsk.mt.tabspopupClose = function() {
			var activeDialog = com.gsk.mt.getActiveDialog();				
			if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.parent().find(".logTab").length) {					
				if(activeDialog.parent().find(".logTab.active").length){
					var $this = activeDialog.parent().find(".logTab.active");					 
					com.gsk.mt.trackField($this, Math.round((new Date() - com.gsk.mt.tabStartTime) / 1000));
				}					
			};
			com.gsk.mt.tabStartTime = new Date();				
			if(activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && com.gsk.mt.dialogStack.length == 1){
				com.gsk.mt.onTabContetOpen();
			}
		};
	},	
	
	

    /**
     * Initialise Portfolio slide
     */
    initPortfolio: function() {
        var container = $("#portfolioPresentationContainer"),
            presentations = com.gsk.mtconfig.portfolioPresentations,
            flowList = '<div id="closeFlowSelector"></div>',
            flowSelectorInner,
            flows;

        if (container.length > 0 && presentations.length > 0) {
            for (var i = 0, j = 0; i < presentations.length; i++) {
                if (j === 0) {
                    container.append('<div class="gskRow">');
                }

                container.append('<div class="gskCol gskCol' + com.gsk.mtconfig.presentationsPerRow +
                    '"><img class="gotoSlide" src="media/thumbnails/' +
                    presentations[i].presentation + '.png" width="100%" data-slide="' +
                    presentations[i].slide + '" data-presentation="' +
                    presentations[i].presentation + '" /><div>' +
                    presentations[i].presentation_name + '</div></div>');

                flows = presentations[i].flows;

                for (var ii = 0; ii < flows.length; ii++) {
                    flowList += '<div class="flowSelect gotoFlow" data-slide="' +
                        flows[ii].slide + '" data-presentation="' + presentations[i].presentation +
                        '" data-flow="' + flows[ii].flow + '">' + flows[ii].label + '</div>';
                }

                if (j === com.gsk.mtconfig.presentationsPerRow - 1 || i === presentations.length - 1) {
                    j = 0;
                    container.append('</div>');
                } else {
                    j++;
                }
            }

            window.sessionStorage.setItem("mtgskPortfolioLinked", true);
            window.sessionStorage.setItem("mtgskCurrentFlow", "Main");

            container.on(com.gsk.mt.pressEvent, ".portfolioData", function() {
                var data = $(this);

                $(".portfolioSelected").removeClass("portfolioSelected");
                data.addClass("portfolioSelected");
            });

            flowSelectorInner = $("#flowSelectorInner");

            flowSelectorInner.html(flowList);

            $(".portfolioFlowSelector").hide();

            $("#shortFlow").on(com.gsk.mt.releaseEvent, function() {
                $(".portfolioFlowSelector").css("left", (4.882+"%")).toggle();
            });

            $("body").on(com.gsk.mt.releaseEvent, "#closeFlowSelector", function() {
                $(".portfolioFlowSelector").hide();
            });

            flowSelectorInner.on(com.gsk.mt.releaseEvent, ".flowSelect", function() {
                var $this = $(this);

                window.sessionStorage.setItem('mtgskCurrentFlow', $this.attr("data-flow"));
                window.sessionStorage.removeItem('mtgskFlows');
                //$this.removeAttr("data-flow");
                com.gsk.mt.processGotoSlide($this);
            });
        } else if (com.gsk.mtconfig.portfolio.length > 0) {
            com.gsk.mt.dom.navBottom.append('<div id="portfolio" class="gotoSlide display" data-slide="' +
                com.gsk.mtconfig.portfolio + '" data-presentation="' + com.gsk.mtconfig.portfolioPresentation + '"></div>');
            $("#portfolio").css("display", "inline-block");
        }

        com.gsk.mt.dom.body.on(com.gsk.mt.pressEvent, ".noSwipe, .ui-draggable, .ui-sortable-handle, .ui-slider-handle", function() {
            com.gsk.mt.blockLinks = true;
        });

        com.gsk.mt.dom.body.on(com.gsk.mt.releaseEvent, ".noSwipe, .ui-draggable, .ui-sortable-handle, .ui-slider-handle", function() {
            setTimeout(function() {
                com.gsk.mt.blockLinks = false;
            }, 250);
        });

        com.gsk.mt.dom.body.on(com.gsk.mt.pressEvent, ".navBottom div, #mtgskClose", function(e) {
            e.stopPropagation();
        });
    },

    /**
     * Initialise zoom functionality
     */
    initZoom: function() {
        var touchMoveCallback = com.gsk.mt.touchMoveFixed;

        if (com.gsk.mt.isVeeva && com.gsk.mtconfig.mtgskPortrait === "0") {
            if (com.gsk.mtconfig.pinchToZoomSlides.indexOf(com.gsk.mt.currentSlide) > -1) {
                com.gsk.mt.dom.navBottom.append('<div id="pinchToZoomIndicator"></div>');

                com.gsk.mt.canZoom = true;
                touchMoveCallback = com.gsk.mt.touchMoveZoomable;

                // Interval used to detect zoom level when zoomed in so that functionality can be restored.
                com.gsk.mt.zoomInterval = setInterval(function() {
                    var zoom = detectZoom.zoom();
                    if (com.gsk.mt.hasZoom > 0 && zoom <= 1) {
                        com.gsk.mt.hasZoom = 0;
                        setTimeout(function() {
                            $("#zoomOverlay").remove();
                            com.gsk.mt.scrolling = false;
                        }, 250);
                    } else if(zoom > 1 && $("#zoomOverlay").length < 1) {
                        com.gsk.mt.hasZoom = 1;
                        $('<div id="zoomOverlay" class="noSwipe"></div>').appendTo(com.gsk.mt.dom.body);
                    }
                }, 100);
            }
        }

        document.addEventListener('touchmove', touchMoveCallback, false);
        com.gsk.mt.setViewport();
    },

    /**
     * Set the viewport to allow, or disallow, zooming
     */
    setViewport: function() {
        var viewportContent;

        if (com.gsk.mt.canZoom) {
            viewportContent = "width=device-width, initial-scale=1, maximum-scale=" + com.gsk.mtconfig.maxZoom;
        } else {
            viewportContent = "width=device-width, initial-scale=1, maximum-scale=1";
        }

        $('[name="viewport"]').attr("content", viewportContent);
    },

    /**
     * Handler for touchmove events on zoomable slides
     * @param {Event} e
     */
    touchMoveZoomable: function(e) {
        var zoom = detectZoom.zoom();

        if (!com.gsk.mt.canZoom || (e.touches.length < 2 && zoom <= 1)) {
            // Clear functionality blocking when pinch to zoom out to 1.0
            e.preventDefault();
        }
    },

    /**
     * Handler for touchmove events on non-zoomable slides
     * @param {Event} e
     */
    touchMoveFixed: function(e) {
        e.preventDefault();
    },

    /**
     * Initialise navigation elements
     */
    initNavigation: function() {
        // Disable or activate nav elements where applicable.
        com.gsk.mt.initNavElements();

        var inlineContent = $(".inlineContent");
        if (inlineContent.length > 0 && !inlineContent.parents('.dialogBody').length > 0) {
            $.each(inlineContent, function(index) {
                com.gsk.mt.initInlineContent($(this),index);
            });
            inlineContent.addClass("noSwipe");
        }

        // If not using veeva swipes, swiping the container will move to the
        // next or previous slide depending upon direction. If using custom
        // swipes (indicated by the container having the class customSwipe)
        // this binding will be ignored.
        if ((com.gsk.mtconfig.veevaSwipe === "0" || !com.gsk.mt.isVeeva) &&
            com.gsk.mt.dom.container.length &&
            !com.gsk.mt.dom.container.hasClass("customSwipe") && (!com.gsk.mt.dom.container.hasClass("noSwipe") || inlineContent.length > 0))
        {
            com.gsk.mt.initSwipes();
        }
        // Double-click bumpers on either side of the screen
        var $navBumper = $(".navBumper");
        if ($navBumper.length) {
            $.each($navBumper, function() {
                var $this = $(this);
                var id = $this.attr("id");
                if (id === "doubleClickLeft") {
                    com.gsk.mt.bindInteraction("#doubleClickLeft", "doubletap", {}, com.gsk.mt.gotoPreviousSlide);
                } else if (id === "doubleClickRight") {
                    com.gsk.mt.bindInteraction("#doubleClickRight", "doubletap", {}, com.gsk.mt.gotoNextSlide);
                }
            });
        }

        // Trigger processing of gotoSlide elements on tap
        var gotoSlide = $(".gotoSlide");
        if (gotoSlide.length) {
            gotoSlide.addClass("needsclick");
            com.gsk.mt.bindInteraction(".gotoSlide", com.gsk.mt.pressEvent, {}, function(e) {
                e.stopPropagation();
                com.gsk.mt.blockLinks = false;
            });

            com.gsk.mt.bindInteraction(".gotoSlide", com.gsk.mt.releaseEvent, {}, function(e) {
				if (!com.gsk.mt.scrolling) {
                    com.gsk.mt.processGotoSlide($(e.target));
                }
            });
        }

        com.gsk.mt.bindInteraction(".gotoFlow", com.gsk.mt.pressEvent, {}, function(e) {
            e.stopPropagation();
            com.gsk.mt.blockLinks = false;
        });

        // Trigger processing of gotoFlow elements on tap
        com.gsk.mt.bindInteraction(".gotoFlow", com.gsk.mt.releaseEvent, {}, function(e) {
            if (!com.gsk.mt.scrolling) {
                com.gsk.mt.processGotoFlow($(e.target));
            }
        });

        // Close a slide, returning to the previously stored slide
        if ($("#mtgskClose").length) {
            com.gsk.mt.bindInteraction("#mtgskClose", com.gsk.mt.releaseEvent, {}, com.gsk.mt.closeSlide);
        }

        // DEPRECATED: Initialise portrait mode
        if (com.gsk.mtconfig.mtgskPortrait === '1') {
            com.gsk.mt.debug('DEPRECATED: mtgskPortrait portrait mode.', '#ffaa10');
            com.gsk.mt.bindInteraction("#doubleClickCentre", "doubletap", {}, com.gsk.mt.resizePortrait);
            com.gsk.mt.dom.body.addClass("portrait");
        }
		if (com.gsk.mtconfig.entireOrientation || com.gsk.mtconfig.orientationLinks[com.gsk.mt.currentSlide] || com.gsk.mtconfig.portraitSlides.indexOf(com.gsk.mt.currentSlide) > -1) {
            com.gsk.mt.initOrientationLink();
        }
    },

    /**
     * Initialise swipe navigation
     */
    initSwipes: function() {
        com.gsk.mt.swipable = true;

        var elements = com.gsk.mt.dom.container.get(0);
        com.gsk.mt.bindSwipe(elements, {}, com.gsk.mt.swipeEvent);

        if (com.gsk.mtconfig.enableSwipesOnDialog || !com.gsk.mtconfig.enableSwipesOnDialog) {
            $("body").hammer({touchAction: 'auto', domEvents: true}).bind("swipe", ".ui-front, #customMenuWrapper, #customMenu", com.gsk.mt.swipeEvent);
        }
    },
	
	/**
     * Initialise swipe navigation for dialog
     */
	
	enableSwipeDialog: function() {
		com.gsk.mt.dom.body.on(com.gsk.mt.pressEvent, ".ui-dialog-titlebar-close", function(e) {
            com.gsk.mt.dom.body.removeClass("noSwipe");
        });		
	},

    /**
     * Event handler on swipes
     * @param {Event} e
     */
    swipeEvent: function(e) {
        var direction = com.gsk.mt.getSwipeDirection(e);

        if (!e.originalEvent) {
            return;
        }

        if (e.timeStamp - com.gsk.mt.lastSwipeTime < 100) {
            com.gsk.mt.lastSwipeTime = e.timeStamp;
            return;
        }
        com.gsk.mt.lastSwipeTime = e.timeStamp;

        if (direction === undefined && e.gesture !== undefined) {
            direction = e.gesture.direction;
        }

        if (!com.gsk.mt.canSwipe(e)) {
            return;
        }

        if (direction === Hammer.DIRECTION_RIGHT) {
            com.gsk.mt.gotoPreviousSlide(true);
        } else if (direction === Hammer.DIRECTION_LEFT) {
            com.gsk.mt.gotoNextSlide(true);
        }
    },

    /**
     * initialise a custom swipe
     * @param {Object} navDestinations
     */
    customSwipe: function(navDestinations) {
        if (com.gsk.mt.dom.container.length &&
            com.gsk.mt.dom.container.hasClass("customSwipe") &&
            !$.isEmptyObject(navDestinations))
        {
            var elements = com.gsk.mt.dom.container.get(0);
            com.gsk.mt.bindSwipe(elements, { direction: Hammer.DIRECTION_ALL }, function(e) {
                if (!e.originalEvent) {
                    return;
                }

                if (e.timeStamp - com.gsk.mt.lastSwipeTime < 100) {
                    com.gsk.mt.lastSwipeTime = e.timeStamp;
                    return false;
                }
                com.gsk.mt.lastSwipeTime = e.timeStamp;

                if (!com.gsk.mt.canSwipe(e)) {
                    return;
                }

                if (navDestinations.flow !== undefined) {
                    if (com.gsk.mtconfig.flows[navDestinations.flow] !== undefined) {
                        window.sessionStorage.setItem('mtgskCurrentFlow', navDestinations.flow);
                    } else {
                        com.gsk.mt.debug("Flow index (" + navDestinations.flow + ") out of range", "#7f0000");
                    }
                }
                com.gsk.mt.callCustomSwipe(e, navDestinations);
            });

            if (com.gsk.mtconfig.enableSwipesOnDialog || !com.gsk.mtconfig.enableSwipesOnDialog) {
                $("body").hammer({touchAction: 'auto', domEvents: true}).bind("swipe", ".ui-front, #customMenuWrapper, #customMenu", function(e) {
                    if (!e.originalEvent) {
                        return;
                    }

                    if (e.timeStamp - com.gsk.mt.lastSwipeTime < 100) {
                        com.gsk.mt.lastSwipeTime = e.timeStamp;
                        return false;
                    }
                    com.gsk.mt.lastSwipeTime = e.timeStamp;

                    if (!com.gsk.mt.canSwipe(e)) {
                        return;
                    }

                    if (navDestinations.flow !== undefined) {
                        if (com.gsk.mtconfig.flows[navDestinations.flow] !== undefined) {
                            window.sessionStorage.setItem('mtgskCurrentFlow', navDestinations.flow);
                        } else {
                            com.gsk.mt.debug("Flow index (" + navDestinations.flow + ") out of range", "#7f0000");
                        }
                    }
                    com.gsk.mt.callCustomSwipe(e, navDestinations);
                });
            }
        }
    },

    /**
     * Call processCustomSwipe for passed direction
     * @param {Event} e
     * @param {Object} navDestinations
     */
    callCustomSwipe: function(e, navDestinations) {
        var direction = com.gsk.mt.getSwipeDirection(e);

        if (direction === Hammer.DIRECTION_RIGHT) {
            com.gsk.mt.processCustomSwipe(navDestinations, "right");
        } else if (direction === Hammer.DIRECTION_LEFT) {
            com.gsk.mt.processCustomSwipe(navDestinations, "left");
        } else if (direction === Hammer.DIRECTION_UP) {
            com.gsk.mt.processCustomSwipe(navDestinations, "up");
        } else if (direction === Hammer.DIRECTION_DOWN) {
            com.gsk.mt.processCustomSwipe(navDestinations, "down");
        }
    },

    /**
     * Return whether swipe navigation is enabled
     * @param {Event} e
     * @returns {boolean}
     */
    canSwipe: function(e) {
        var $target = $(e.target),
            direction = com.gsk.mt.getSwipeDirection(e);

        if (!direction || direction < 0) {
            return false;
        }

        return !(com.gsk.mt.hasNoSwipe($target) || !direction ||
            com.gsk.mt.blockSwipes || $target.hasClass("noSwipe"));
    },

    /**
     * Get the direction of the swipe
     * @param {Event} e
     * @returns {Number}
     */
    getSwipeDirection: function(e) {
        var direction = e.direction;

        if (e.gesture) {
            direction = e.gesture.direction;
        } else if (!e.originalEvent) {
            return direction;
        } else {
            direction = e.originalEvent.gesture.direction;
        }

        return direction;
    },

    /**
     * Return true if an ancestor of the element has the noSwipe class
     * @param {jQuery} $element
     * @returns {boolean}
     */
    hasNoSwipe: function($element) {
        return $element.parents(".noSwipe").length > 0;
    },

    /**
     * Initialise orientation change linking
     * This will retrieve the destination slide from the config (or override) before creating the handler
     */
    initOrientationLink: function() {
        $(window).on("orientationchange", com.gsk.mt.orientationChangeHandler);
    },

    /**
     * Handler for orientationchange events
     */
    orientationChangeHandler: function() {
        var deviceOrientation = window.orientation;

        if (com.gsk.mt.testOrientation(deviceOrientation, [ 0, 180 ])) {
            com.gsk.mt.orientationLinkTarget();
        } else if (com.gsk.mt.testOrientation(deviceOrientation, [ 90, -90 ])) {
            com.gsk.mt.orientationLinkBack();
        }
    },
    /**
     * Called when rotating to landscape from portrait
     * Requires that com.gsk.mt.orientationLink has been set to link
     */
    orientationLinkBack: function() {
        if(com.gsk.mtconfig.entireOrientation){
            if (com.gsk.mtconfig.entireOrientationSlide.slide == undefined) {
                return;
            }
        }else{
            if (com.gsk.mtconfig.portraitSlides.indexOf(com.gsk.mt.currentSlide) < 0) {
                return;
            }            
        }

        var orientationLink = window.sessionStorage.getItem('mtgskOrientationLink');
        window.sessionStorage.removeItem('mtgskOrientationLink');

        // Make sure that this is not null before returning
        if (orientationLink) {
            orientationLink = JSON.parse(orientationLink);
            com.gsk.mt.gotoSlide(orientationLink.slide, orientationLink.presentation, true);
        }
    },

    /**
     * Called when rotating to portrait from landscape
     * Requires that mtgskOrientationLink session has been set variable to return
     */
    orientationLinkTarget: function() {
        var orientationLink,
            lastOrientationLink = {
                slide: com.gsk.mt.currentSlide,
                presentation: com.gsk.mt.currentPres
            };

        if(com.gsk.mtconfig.entireOrientation){
            if (com.gsk.mtconfig.entireOrientationSlide.slide == undefined || jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) > -1 || com.gsk.mtconfig.entireOrientationSlide.slide == com.gsk.mt.currentSlide) {
                return;
            }
            orientationLink = com.gsk.mtconfig.entireOrientationSlide;           
        }else{
            if (com.gsk.mtconfig.portraitSlides.indexOf(com.gsk.mt.currentSlide) > -1) {
                return;
            }
            
            orientationLink = com.gsk.mtconfig.orientationLinks[com.gsk.mt.currentSlide];
        }

        // If the developer has implemented the override use this to get the destination
        if (com.gsk.mt.custom.orientationLinkOverride) {
            orientationLink = com.gsk.mt.custom.orientationLinkOverride();

            if (!orientationLink.presentation) {
                orientationLink.presentation = "";
            }
        }

        window.sessionStorage.setItem('mtgskOrientationLink', JSON.stringify(lastOrientationLink));
        com.gsk.mt.gotoSlide(orientationLink.slide, orientationLink.presentation, true);
    },

    /**
     * Determine whether the device orientation matches the allowed values
     * @param {Number} orientation - screen orientation
     * @param {Number[]} tests - array of screen angles
     * @returns {boolean}
     */
    testOrientation: function(orientation, tests) {
        for (var i = 0; i < tests.length; i++) {
            if (orientation === tests[i]) {
                return true;
            }
        }

        return false;
    },

    /**
     * Manage navbar
     */
    initNavElements: function() {
        var dialogId,
            $home = $('#home'),
            $menu = $('#menu'),
            $references = $('#references'),
            $pi = $('#pi'),
			$quickres = $('#quickres'),
            $email = $('#email'),
            $objection = $('#objection'),
            $guide;

        // If any of the embed values are true, create a dialog.
         if (com.gsk.mtconfig.embedMenu || com.gsk.mtconfig.embedReferences || com.gsk.mtconfig.embedPi ||
            com.gsk.mtconfig.embedObjection || com.gsk.mtconfig.embedQuickRes || com.gsk.mtconfig.embedGuides ||
            (com.gsk.mtconfig.customMenu !== undefined && com.gsk.mtconfig.customMenu.length > 0))
        {
            dialogId = com.gsk.mt.createQuickLinkDialogFrame();
        }

        if (com.gsk.mtconfig.customMenu.length > 0) {
            if (com.gsk.mtconfig.embedMenu) {
                $menu.addClass("display")
                    .removeClass("gotoSlide logEmbedded")
                    .attr("data-show", "#customMenuWrapper");

                $("#customMenuWrapper").nodoubletapzoom();

                com.gsk.mt.createQuickLinkCustomMenu();

                com.gsk.mt.dom.body.on(com.gsk.mt.releaseEvent, "#menu", function(e) {					
					if(com.gsk.mt.dialogStack.length == 0 && com.gsk.mt.currentVideo !== null){
						com.gsk.mt.currentVideo.pause();
					}
                    var menuWrapper = $("#customMenuWrapper");
					com.gsk.mt.onTabDialogOpen();
					var $element = $(e.target)
					if (!$element.hasClass("trackingSubmitted")) {
						com.gsk.mt.trackQuickLink($element);
					}
                    menuWrapper.show();
                   for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
						$(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
					}  
                    //com.gsk.mt.dom.container.removeClass("noSwipe");

                    if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
                        $(".navBottom").appendTo(menuWrapper);
                    }else{
						$(menuWrapper).css('z-index',10000);						
					}

                    $("#flowSelector, #fragmentSelector").addClass("hidden");

                    $(".activeNav").removeClass("activeNav");
                    $("#menu").addClass("activeNav");
                });

                com.gsk.mt.dom.body.on(com.gsk.mt.releaseEvent, "#closeCustomMenu", function() {
                    if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
						if($('#customMenuWrapper').is(':visible')){
							com.gsk.mt.inlinetabStartTime = new Date();
						}
                        $(".navBottom").appendTo(com.gsk.mt.dom.container);
                    }else{
						$('#customMenuWrapper').css('z-index',20);
					}

                    $("#customMenuWrapper").hide();
                    if (com.gsk.mt.isNoSwipe) {
                        com.gsk.mt.dom.container.addClass("noSwipe");
                    }

                    $(".activeNav").removeClass("activeNav");
					if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.callSummary) {				
						$("#callSummary").css("display", "inline-block");                
					}else{
						$("#callSummary").addClass("activeNav display");
					}
					com.gsk.mt.activatebutton();
                    com.gsk.mt.setHomeButtonState();
                });
            } else if (com.gsk.mtconfig.menu === com.gsk.mt.currentSlide) {
                com.gsk.mt.createCustomMenu();
                $menu.addClass('activeNav display');
            } else if (com.gsk.mtconfig.menu.length > 0) {
                $menu.addClass('display');
            }
        } else if (com.gsk.mtconfig.menu !== com.gsk.mt.currentSlide) {
            if (com.gsk.mtconfig.embedMenu) {
                $menu.removeClass("gotoSlide")
                    .addClass("openDialog display")
                    .attr("data-quicklink", "Menu")
                    .attr("data-dialog", "#" + dialogId);

                com.gsk.mt.createQuickLinkMenu();
            } else if (com.gsk.mtconfig.menu !== "") {
                $menu.addClass("display");
            }
        } else {
            $menu.addClass("activeNav display");
            com.gsk.mt.initMenu();
        }

        if (com.gsk.mtconfig.embedReferences) {
            if (com.gsk.mtconfig.referencesAll.length > 0 ||
                com.gsk.mtconfig.footnotesAll.length > 0)
            {
                $references.removeClass("gotoSlide")
                    .addClass("gotoRef openDialog display")
                    .attr("data-quicklink", "References")
                    .attr("data-dialog", "#" + dialogId)
                    .attr("data-reftarget", "PAGE");
                com.gsk.mt.createQuickLinkReferences();
            }
        } else if (!com.gsk.mtconfig.embedReferences && (com.gsk.mtconfig.referencesAll.length > 0 || com.gsk.mtconfig.footnotesAll.length > 0))
        {
            if (com.gsk.mtconfig.references === com.gsk.mt.currentSlide) {
                $references.addClass("activeNav display");
            } else {
                $references.addClass('display');
            }
        }

        if (com.gsk.mtconfig.embedPi) {
            $pi.removeClass("gotoSlide")
                .addClass("openDialog display")
                .attr("data-quicklink", "Pi")
                .attr("data-dialog", "#" + dialogId);

            com.gsk.mt.createQuickLinkPi();
        } else if (!com.gsk.mtconfig.embedPi && com.gsk.mtconfig.pi !== "") {
            if (com.gsk.mtconfig.pi === com.gsk.mt.currentSlide) {
                $pi.addClass("activeNav display");
            } else {
                $pi.addClass("display");
            }
        }
		
		if (com.gsk.mtconfig.embedQuickRes) {
            $quickres.removeClass("gotoSlide")
                .addClass("openDialog display")
                .attr("data-quicklink", "QuickRes")
                .attr("data-dialog", "#" + dialogId);

            com.gsk.mt.createQuickres();
        } else if (!com.gsk.mtconfig.embedQuickRes && com.gsk.mtconfig.quickres !== "") {
            if (com.gsk.mtconfig.quickres === com.gsk.mt.currentSlide) {
                $quickres.addClass("activeNav display");
            } else {
                $quickres.addClass("display");
            }
        }

        if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.objection) {
            if (com.gsk.mtconfig.embedObjection) {
                $objection.removeClass("gotoSlide")
                    .addClass("openDialog display")
                    .attr("data-quicklink", "Objection")
                    .attr("data-dialog", "#" + dialogId);

                com.gsk.mt.createQuickLinkObjection();
            } else if (!com.gsk.mtconfig.embedObjection && com.gsk.mtconfig.objection !== "") {
                $objection.addClass("display");
            }
        } else {
            $objection.addClass("activeNav display");
        }

        if (com.gsk.mtconfig.pagesGuides[com.gsk.mt.currentSlide] !== undefined) {
            var guide = com.gsk.mtconfig.pagesGuides[com.gsk.mt.currentSlide];

            com.gsk.mt.dom.navBottom.append('<div id="guide" class="gotoSlide logEmbedded" data-description="Embedded Guide"></div>');
            $guide = $('#guide');

            if (com.gsk.mtconfig.embedGuides) {
                $guide.removeClass("gotoSlide")
                    .addClass("openDialog display")
                    .attr("data-quicklink", "Guide")
                    .attr("data-dialog", "#" + dialogId);

                com.gsk.mt.createQuickLinkGuide();
            } else {
                $guide.addClass('display');
                $guide.attr("data-slide", guide.slide);
                if (guide.presentation !== undefined) {
                    $guide.attr("data-presentation", guide.presentation);
                }
            }
        }
		if (com.gsk.mtconfig.embedpageLock) {
			var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow];
			slideFlowIndex = flow.indexOf(slideIndex);			
			if (slideFlowIndex >= 0) {
				com.gsk.mt.dom.navBottom.append('<div id="pageLock" class="logEmbedded display" data-description="Embedded Page Lock"></div>');
				$pageLock = $('#pageLock');
				$pageLock.addClass('display');
				
				if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.pageLock) > -1) {
					if (com.gsk.mt.dom.container.hasClass("customSwipe")) {
						$('#pageLock').addClass('inactive');
						com.gsk.mt.dom.container.removeClass("noSwipe"); 
					}else{
						$('#pageLock').addClass('active');
						$('#container').addClass('noSwipe');						
					}
					
				}else{
					if (com.gsk.mt.dom.container.hasClass("customSwipe")) {
						$('#pageLock').addClass('inactive');
					}
					if (com.gsk.mt.dom.container.hasClass("noSwipe")) {
						$('#pageLock').addClass('active');
					}					
				}
			}
		}
		if (com.gsk.mtconfig.embedCallSummary && com.gsk.mtconfig.callSummary !== "" && com.gsk.mt.currentSlide !== com.gsk.mtconfig.portfolio) {
			com.gsk.mt.dom.navBottom.append('<div id="callSummary" class="gotoSlide display" data-slide="' +
                com.gsk.mtconfig.callSummary + '" data-presentation="' + com.gsk.mtconfig.callSummaryPresentation + '"></div>');
            if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.callSummary) {				
            	$("#callSummary").css("display", "inline-block");                
            }else{
				$("#callSummary").addClass("activeNav display");
			}
        }
		com.gsk.mt.bindInteraction("#pageLock", com.gsk.mt.releaseEvent, {}, function() {
				if (com.gsk.mt.dom.container.hasClass("noSwipe") || com.gsk.mt.dom.container.hasClass("customSwipe")) {
                   com.gsk.mt.dom.container.removeClass("noSwipe"); 
				   $('#pageLock').removeClass('active');				   
				   $('body').removeClass("noSwipe");				  
        			if (!$(".video-js").length) { 
				   		com.gsk.mt.initSwipes();
					}
                } else {
                    com.gsk.mt.dom.container.addClass("noSwipe");
					$('#pageLock').addClass('active');					
					$('body').addClass("noSwipe");																
                }
		});
		if (com.gsk.mtconfig.pagesRace.indexOf(com.gsk.mt.currentSlide) > -1 && com.gsk.mtconfig.embedRace) {
            if (com.gsk.mtconfig.pagesRace) { 
                com.gsk.mt.createQuickLinkRace();
            } 
        }

        com.gsk.mt.setHomeButtonState();

        if (com.gsk.mtconfig.useEmail) {
            $email.addClass('display');
        }

        var flows = [];
        $.each(com.gsk.mtconfig.flows, function(key) {
            flows.push(key);
        });
        if (flows.length > 1 && com.gsk.mt.hasFlows()) {
            var $shortFlowButton = $('<div id="shortFlow"></div>'),
                flowSelector;

            com.gsk.mt.insertFlowSelector(flows);
            flowSelector = $("#flowSelector");

            com.gsk.mt.bindInteraction("#shortFlow", com.gsk.mt.releaseEvent, {}, function() {
                $("#fragmentSelector").addClass("hidden");
				for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
                     $(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
                 }

                $("#quickLinkDialog").parent().find(".ui-dialog-titlebar-close").trigger("click");
                flowSelector.toggleClass("hidden");
				com.gsk.mt.scrolling = false;
                $("#closeCustomMenu").trigger(com.gsk.mt.releaseEvent);

                $(".activeNav").removeClass("activeNav");
                if (!flowSelector.hasClass("hidden")) {
                    $("#shortFlow").addClass("activeNav");
                } else {
                    com.gsk.mt.setHomeButtonState();
                }
            });
            com.gsk.mt.bindInteraction("#closeFlowSelector", com.gsk.mt.releaseEvent, {}, function() {
                flowSelector.addClass("hidden");
                $(".activeNav").removeClass("activeNav");
				com.gsk.mt.activatebutton();
                com.gsk.mt.setHomeButtonState();
				if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.callSummary) {				
					$("#callSummary").css("display", "inline-block");                
				}else{
					$("#callSummary").addClass("activeNav display");
				}
            });
			
			
            if($email.length === 1){
				$shortFlowButton.addClass('display').insertAfter($email);
			}else if($references.length === 1){
				$shortFlowButton.addClass('display').insertAfter($references);
			}else if($pi.length === 1){
				$shortFlowButton.addClass('display').insertAfter($pi);
			}else if($menu.length === 1){
				$shortFlowButton.addClass('display').insertAfter($menu);
			}
			else if($home.length === 1){
				$shortFlowButton.addClass('display').insertAfter($home);
			}

			flowSelector.css({
                "left": ((parseInt($('#shortFlow').offset().left)-parseInt($('#container').offset().left)) - parseInt(flowSelector.css("width")) / 2) + ($shortFlowButton[0].getBoundingClientRect().width/2)
            });
        }
		if(com.gsk.mtconfig.portraitSlides.indexOf(com.gsk.mt.currentSlide) > -1){			
				com.gsk.mt.dom.navBottom.hide();
		}

        $(".navBottom>*").addClass("needsclick");
    },

    /**
     * Return true if the current slide is a main slide or a sub slide.
     * @returns {boolean}
     */
    hasFlows: function() {
        var isMainSlide = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide) > -1,
            isSubSlide = false,
            subSlideArray;

        for (var slide in com.gsk.mtconfig.subSlides) {
            subSlideArray = com.gsk.mtconfig.subSlides[slide];
            for (var i = 1; i < subSlideArray.length; i++) {
                if (subSlideArray[i].slide === com.gsk.mt.currentSlide) {
                    isSubSlide = true;
                }
            }
        }
        return isMainSlide || isSubSlide;
    },

    /**
     * If the current slide is the homepage, set the home quick link icon to the active state.
     */
    setHomeButtonState: function() {
        if (com.gsk.mtconfig.homepage !== "") {
            var $home = $("#home"),
                flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
                flowHome = com.gsk.mtconfig.pagesAll[com.gsk.mtconfig.flows[com.gsk.mt.currentFlow][0]],
                inFlow = flow.indexOf(0) > -1,
                targetFlow = inFlow ? com.gsk.mt.currentFlow : "Main";

            $home.addClass("gotoFlow display").attr("data-flow", targetFlow);
            if (com.gsk.mtconfig.homeResetsFlows) {
                if (com.gsk.mtconfig.homepage === com.gsk.mt.currentSlide) {
                    $home.addClass('activeNav');
                }
            } else if ((com.gsk.mt.currentFlow !== "Main" && flowHome === com.gsk.mt.currentSlide) ||
                (com.gsk.mt.currentFlow === "Main" && com.gsk.mtconfig.homepage === com.gsk.mt.currentSlide))
            {
                $home.addClass("activeNav");
            }
        }
    },

    /**
     * Create a quick link dialog
     * @returns {string} id of the new dialog
     */
    createQuickLinkDialogFrame: function() {
        var id = "quickLinkDialog",
            width = com.gsk.mtconfig.quickLinkDialogWidth;

        if (com.gsk.mt.dom.body.hasClass("portrait")) {
            width = com.gsk.mtconfig.quickLinkDialogPortraitWidth;
        }

        $('<div id="quickLinkDialog" class="dialog noTitlebar quickLinkDialog hidden" ' + 'title="" data-width="' +
            width + '" data-height="' + (com.gsk.mtconfig.quickLinkDialogHeight) + '" data-description="Embedded ' +
            'Quick Link"><div class="dialogBody embeddedQuickLink"></div></div>').insertAfter("#bg");

        return id;
    },

    /**
     * Initialise Menu slide
     */
    initMenu: function() {
        var dialogContent = "<div id=\"menuScroller\" class=\"scrollable\"><div id=\"menuScrollerInner\" class=\"scrollableInner\"><ul>",
            menuScroller;

        for (var ii = 0; ii < com.gsk.mtconfig.pagesAll.length; ii++) {
			 if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mtconfig.pagesAll[ii]), com.gsk.mtconfig.addAll) == -1) { 
           		dialogContent += '<li class="gotoFlow" data-slide="' +
                com.gsk.mtconfig.pagesAll[ii] + '" data-presentation="' +
                com.gsk.mtconfig.presentation + '" data-flow="Main">' +
                com.gsk.mtconfig.menuDesc[ii] + '</li>';
			 }
        }

        dialogContent += "</ul></div></div>";

        com.gsk.mt.dom.mainContent.append(dialogContent);

        menuScroller = $("#menuScroller");

        if (parseInt(menuScroller.css("height")) < parseInt(menuScroller.find(".scrollableInner").css("height"))) {
            com.gsk.mt.initScroller(menuScroller);
        }
    },


    /**
     * Create the dialog content for the menu dialog
     */
    createQuickLinkMenu: function() {
        var dialog = $("#quickLinkDialog"),
            dialogBody = dialog.find(".dialogBody"),
            heading = com.gsk.mtconfig.localisation.menu,
            dialogContent = "<div class=\"quickLinkDialogContent quickLinkDialogMenu hidden\"><ul>";

        if (heading === undefined) {
            heading = 'Menu';
        }

        dialog.append('<div class="menuTitle pageTitle">' + heading + '</div>');

        for (var ii = 0; ii < com.gsk.mtconfig.pagesAll.length; ii++) {
			if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mtconfig.pagesAll[ii]), com.gsk.mtconfig.addAll) == -1) { 
            dialogContent += '<li class="gotoFlow" data-slide="' +
                com.gsk.mtconfig.pagesAll[ii] + '" data-presentation="' +
                com.gsk.mtconfig.presentation + '" data-flow="Main">' +
                com.gsk.mtconfig.menuDesc[ii] + '</li>';
			}
        }

        dialogContent += "</ul></div>";

        dialogBody.append(dialogContent);
    },

    /**
     * Create the custom menu
     */
    createQuickLinkCustomMenu: function() {
        var dialogContent = com.gsk.mt.getCustomMenuContent(true),
            customMenuWrapper;

        com.gsk.mt.dom.container.append(dialogContent);
        customMenuWrapper = $("#customMenuWrapper");

        $.each($("div.customMenuItems"), function() {
            var $this = $(this);

            if (parseInt($this.css("height")) < parseInt($this.find(".scrollableInner").css("height"))) {
                com.gsk.mt.initScroller($this);
            }
        });

        customMenuWrapper.removeClass("mtLoad");

        if (!com.gsk.mtconfig.enableSwipesOnDialog) {
            $('#customMenuWrapper, #customMenu, #customMenu *').addClass("noSwipe");
        }
        if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
            customMenuWrapper.addClass("enableQuickLinks");
        }
    },

    /**
     * Create the custom menu for the menu slide
     */
    createCustomMenu: function() {
        var heading = com.gsk.mtconfig.localisation['custom-menu'],
            dialogContent = com.gsk.mt.getCustomMenuContent(false);

        if (heading === undefined) {
            heading = 'Menu';
        }

        com.gsk.mt.dom.mainContent.html('<div class="pageTitle">' + heading + '</div>');
        com.gsk.mt.dom.container.append(dialogContent);
    },

    /**
     * Generate the custom menu
     * @param {boolean} close
     * @returns {string}
     */
    getCustomMenuContent: function(close) {
        var heading = com.gsk.mtconfig.localisation['custom-menu'],
            dialogContent,
            className = "",
            menuClass = "";

        if (heading === undefined) {
            heading = 'Menu';
        }

        if (!close) {
            className = "inlineMenu";
            heading = "";
        } else {
            heading = '<h3>' + heading + '</h3>'
        }

        dialogContent = '<div id="customMenuWrapper" class="mtLoad ' + className + '"><div id="customMenu"' + menuClass + '>' + heading;

        if (close) {
            dialogContent += '<div id="closeCustomMenu" data-hide="#customMenu"></div>';
        }

        dialogContent += '<ul class="customMenu">';

        for (var ii = 0; ii < com.gsk.mtconfig.customMenu.length; ii++) {
            var menuItem = com.gsk.mtconfig.customMenu[ii];

            dialogContent += '<li class="customMenuKeyMessage"><div class="keyMessage">' + menuItem.title +
                '</div><div id="customMenuItems' + ii + '" class="customMenuItems scrollable"><ul class="scrollableInner">';

            for (var jj = 0; jj < menuItem.slides.length; jj++) {
                dialogContent += '<li class="gotoFlow" data-slide="' +
                    com.gsk.mtconfig.pagesAll[menuItem.slides[jj]] + '" data-presentation="' +
                    com.gsk.mtconfig.presentation + '" data-flow="Main">' +
                    com.gsk.mtconfig.menuDesc[menuItem.slides[jj]] + '</li>';
            }

            dialogContent += '</ul></div>'
        }

        dialogContent += "</ul></div></div>";

        return dialogContent;
    },

    /**
     * Create the dialog content for the references dialog
     */
    createQuickLinkReferences: function() {
        var dialogBody = $("#quickLinkDialog .dialogBody"),
            headingRefs = com.gsk.mtconfig.localisation['references'] || 'References',
            headingFoot = com.gsk.mtconfig.localisation['footnotes'] || 'Footnotes',
            dialogContent = '<div class="quickLinkDialogContent quickLinkDialogReferences hidden">';

        $("#quickLinkDialog").append('<div class="topNav referenceSelector"><div id="referencesPage"></div>' +
            '<div id="referencesAll"></div></div>');

        if (com.gsk.mtconfig.referencesAll.length > 0) {
            dialogContent += '<div class="embeddedReferences"><h3>' + headingRefs + '</h3>' +
                '<div id="referencesScroller" class="references scrollable"><ol id="referenceList" class="scrollableInner"></ol></div></div>';
        }

        if (com.gsk.mtconfig.footnotesAll.length > 0) {
            dialogContent += '<div class="embeddedFootnotes"><h3>' + headingFoot + '</h3>' +
                '<div id="footnotesScroller" class="footnotes scrollable"><ol id="footnotesList" class="scrollableInner"></ol></div></div>';
        }

        dialogBody.append(dialogContent + '</div>');
    },

    /**
     * Create the dialog content for the PI dialog
     */
    createQuickLinkPi: function() {
        var dialog = $("#quickLinkDialog"),
            dialogBody = $("#quickLinkDialog .dialogBody");

        dialog.append('<div class="piTitle pageTitle">' + com.gsk.mtconfig.localisation.pi + '</div>');

        dialogBody.append('<div class="quickLinkDialogContent quickLinkDialogPi hidden"></div>');
        window.addEventListener('message', com.gsk.mt.embeddedPiHandler);
        com.gsk.mt.dom.body.append('<iframe id="piContentLoader" class="contentLoader" src="../shared/media/content/pi.html"></iframe>');
    },

    /**
     * Handle PI popup import
     * @param {Object} event
     */
    embeddedPiHandler: function(event) {
        var data;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.html_content !== undefined) {
            var iframe = $("#piContentLoader");
            $(".quickLinkDialogPi").addClass("pi").html(data.html_content);
            iframe.remove();
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.embeddedPiHandler);
    },

    /**
     * Initialise PI slide
     */
    initPi: function() {
        com.gsk.mt.dom.mainContent.append('<div id="piScroller" class="scrollable"><div id="piScrollerInner" class="scrollableInner"></div></div>');
        window.addEventListener('message', com.gsk.mt.slidePiHandler);
        com.gsk.mt.dom.body.append('<iframe id="piContentLoader" class="contentLoader" src="../shared/media/content/pi.html"></iframe>');
    },

    /**
     * Handle PI slide import
     * @param {Object} event
     */
    slidePiHandler: function(event) {
		
        var data,
            piScroller;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.html_content !== undefined) {
			
            var iframe = $(".piContentLoader");
            $("#piScrollerInner").addClass("pi").html($.parseHTML(data.html_content));
            iframe.remove();
            piScroller = $("#piScroller");

            if (parseInt(piScroller.css("height")) < parseInt(piScroller.find(".scrollableInner").css("height"))) {
                com.gsk.mt.initScroller(piScroller);
            }
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.slidePiHandler);
    },
	
	/**
     * Create the dialog content for the QuickRes dialog
     */
    createQuickres: function() {
        var dialog = $("#quickLinkDialog"),
            dialogBody = $("#quickLinkDialog .dialogBody");
        dialog.append('<div class="quickresTitle pageTitle">' + com.gsk.mtconfig.localisation.quickRes + '</div>');
        dialogBody.append('<div class="quickLinkDialogContent quickLinkDialogQuickRes"><div class="quickResWrapper"></div></div>');
        //com.gsk.mt.createDialogIscroll(x);
        var container = $(".quickResWrapper"); 
		var quickResLen = com.gsk.mtconfig.quickResAll.length;
		var resName = com.gsk.mtconfig.quickResAll.name;
		var resUrl = com.gsk.mtconfig.quickResAll.url;
		var resThumb = com.gsk.mtconfig.quickResAll.thumbUrl;
		var dataField, dataDescription;		
		if (container.length > 0 && quickResLen > 0) {
            for (var i = 0, j = 0; i < quickResLen; i++) {
                if (j === 0) {
                    container.append('<div class="gskRow">');
                }
				resName = com.gsk.mtconfig.quickResAll[i].name;
				resUrl = com.gsk.mtconfig.quickResAll[i].url;
				resThumb = com.gsk.mtconfig.quickResAll[i].thumbUrl;
				dataField = com.gsk.mtconfig.quickResAll[i].dataFields;
				dataDescription = com.gsk.mtconfig.quickResAll[i].dataDescription;

                container.append('<div class="gskCustCol gskCol' + com.gsk.mtconfig.quickresPerRow +
                    '"><a href="'+resUrl+'"><img class="logClick" src="'+resThumb+'" width="100%" data-fields="'+dataField+'"data-description="'+dataDescription+'"/></a><h5>'+resName+'</h5></div>');

                
                if (j === com.gsk.mtconfig.quickresPerRow - 1 || i === quickResLen - 1) {
                    j = 0;
                    container.append('</div>');
                } else {
                    j++;
                }
            }
		}		
        $('.quickresTitle.pageTitle').html(com.gsk.mtconfig.localisation.quickRes);
		
    },

    /**
     * Create the dialog content for the Objection dialog
     */
    createQuickLinkObjection: function() {
        var dialog = $("#quickLinkDialog"),
            dialogBody = $("#quickLinkDialog .dialogBody");

        dialog.append('<div class="objectionTitle pageTitle">' + com.gsk.mtconfig.localisation.objection + '</div>');

        dialogBody.append('<div class="quickLinkDialogContent quickLinkDialogObjection hidden"></div>');
        window.addEventListener('message', com.gsk.mt.embeddedObjectionHandler);
        com.gsk.mt.dom.body.append('<iframe id="objectionContentLoader" class="contentLoader" src="../shared/media/content/objection.html"></iframe>');
    },

    /**
     * Handle Objection popup import
     * @param {Object} event
     */
    embeddedObjectionHandler: function(event) {
        var data;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.objection_content !== undefined) {
            var iframe = $("#objectionContentLoader");
            $(".quickLinkDialogObjection").addClass("objection").html(data.objection_content);
            iframe.remove();
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.embeddedObjectionHandler);
    },

    /**
     * Initialise Objection slide
     */
    initObjection: function() {
        com.gsk.mt.dom.mainContent.append('<div id="objectionScroller" class="scrollable"><div id="objectionScrollerInner" class="scrollableInner"></div></div>');
        window.addEventListener('message', com.gsk.mt.slideObjectionHandler);
        com.gsk.mt.dom.body.append('<iframe id="objectionContentLoader" class="contentLoader" src="../shared/media/content/objection.html"></iframe>');
    },

    /**
     * Handle Objection slide import
     * @param {Object} event
     */
    slideObjectionHandler: function(event) {
        var data,
            objectionScroller;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.objection_content !== undefined) {
            var iframe = $(".objectionContentLoader");
            $("#objectionScrollerInner").addClass("objection").html(data.objection_content);
            iframe.remove();

            objectionScroller = $("#objectionScroller");
            if (parseInt(objectionScroller.css("height")) < parseInt(objectionScroller.find(".scrollableInner").css("height"))) {
                com.gsk.mt.initScroller(objectionScroller);
            }
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.slideObjectionHandler);
    },

    /**
     * Create the dialog content for the Guide dialog
     */
    createQuickLinkGuide: function() {
        var dialog = $("#quickLinkDialog"),
            dialogBody = $("#quickLinkDialog .dialogBody");

        dialog.append('<div class="guideTitle pageTitle guideTitleMain"></div>');

        dialogBody.append('<div class="quickLinkDialogContent quickLinkDialogGuide hidden"></div>');
        window.addEventListener('message', com.gsk.mt.embeddedGuideHandler);
        com.gsk.mt.dom.body.append('<iframe id="guideContentLoader" class="contentLoader" src="../shared/media/content/' + com.gsk.mt.currentSlide + '_GUIDE.html"></iframe>');
    },

    /**
     * Handle Guide popup import
     * @param {Object} event
     */
    embeddedGuideHandler: function(event) {
        var data;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.guide_content !== undefined) {
            var iframe = $("#guideContentLoader");
            $(".quickLinkDialogGuide").addClass("guide").html(data.guide_content);
            $(".guideTitleMain").html($(".quickLinkDialogGuide .guideTitle").html());
            $(".quickLinkDialogGuide .guideTitle").remove();
            iframe.remove();
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.embeddedGuideHandler);
    },

    /**
     * Return true if the current slide listed as a guide
     * @returns {boolean}
     */
    isGuideSlide: function() {
        if (com.gsk.mtconfig.pagesGuides && !$.isEmptyObject(com.gsk.mtconfig.pagesGuides)) {
            for (var guideSlide in com.gsk.mtconfig.pagesGuides) {
                if (com.gsk.mtconfig.pagesGuides[guideSlide].slide === com.gsk.mt.currentSlide) {
                    return true;
                }
            }
        }

        return false
    },

    /**
     * Initialise Guide slide
     */
    initGuide: function() {
        if (!com.gsk.mt.isGuideSlide()) {
            return;
        }

        com.gsk.mt.dom.mainContent.html('<div id="guideScroller" class="scrollable"><div id="guideScrollerInner" class="scrollableInner"></div></div>');
        window.addEventListener('message', com.gsk.mt.slideGuideHandler);
        com.gsk.mt.dom.body.append('<iframe id="guideContentLoader" class="contentLoader" src="../shared/media/content/' + com.gsk.mt.currentSlide + '.html"></iframe>');
    },

    /**
     * Handle PI slide import
     * @param {Object} event
     */
    slideGuideHandler: function(event) {
        var data,
            guideScroller;

        if (event.data !== undefined) {
            data = JSON.parse(event.data);
        }

        if (data.guide_content !== undefined) {
            var iframe = $(".guideContentLoader");
            $("#guideScrollerInner").addClass("guide").html($.parseHTML(data.guide_content));
            iframe.remove();

            guideScroller = $("#guideScroller");
            if (parseInt(guideScroller.css("height")) < parseInt(guideScroller.find(".scrollableInner").css("height"))) {
                com.gsk.mt.initScroller(guideScroller);
            }

            $('.guideTitle').prependTo(com.gsk.mt.dom.mainContent);
        } else {
            return;
        }

        // Clean up
        window.removeEventListener('message', com.gsk.mt.slideGuideHandler);
    },
	
	
	
	/**
     * Create the dialog content for the Race dialog
     */
    createQuickLinkRace: function() {
		$('.navBottom').after('<div id="product_dialog" class="openDialog hidden" data-dialog="#product_journey_newwindow"></div>'+
        '<div id="product_journey_newwindow" class="dialog hidden product_journey" title="RACE Submit Form" data-width="100" data-height="71" data-description="Parent popup">'+
        '<div class="dialogBody">'+
                '<table class="callTablesTable">'+
				'<tr>'+
					'<th id="topProdsLabel"></th>'+
				'</tr>'+
				'<tr>'+
					'<td align="center" style="vertical-align: top;">'+
						'<div id="accordion" class="dataTable" >'+
						'</div>'+
					'</td>'+
				'</tr>'+
			'</table>'+
            '<button class="race_submitBtn" data-onetime="0">Submit</button>'+
        '</div>'+
    '</div>');
    },

    /**
     * Initialise inline content
     * @param {Object} $element
     */
	 
    initInlineContent: function($element,index) {        
		com.gsk.mt.swiper[index] = $element.swiper({
            loop:false,
            resistance:false,
            initialSlide: 0,
            preventLinks: false, 
			nextButton: $element.find('.swiper-button-next')[0],
            prevButton: $element.find('.swiper-button-prev')[0],		
			pagination: $element.find('.swiper-pagination')[0],
			paginationClickable: true,	
			noSwiping: true,
			noSwipingClass: 'swiper-no-swiping',			
			onTransitionStart: com.gsk.mt.inlineContentTransition,
			onTransitionEnd: com.gsk.mt.inlineContentTransition
        });			
		
		com.gsk.mt.swiperArray.push(com.gsk.mt.swiper[index]);
		com.gsk.mt.swiperArray = jQuery.unique( com.gsk.mt.swiperArray );
        $element.data("inlineContent", com.gsk.mt.swiper[index]);
		setTimeout(function(){
			com.gsk.mt.trackInlineContent($element.find(".swiper-slide").eq(0));
		},500);        
    },

    /**
     * Handler for inline content transitions
     * @param {Object} $swiper
     */
    inlineContentTransition: function($swiper) {
        if ($swiper.swipeDirection === "prev" && $swiper.previousIndex === 0) {
			var navDestinations ={}
			if(typeof $($swiper.container["0"]).attr("rightSlide") !== typeof undefined && $($swiper.container["0"]).attr("rightSlide")!== false){			
				navDestinations.rightSlide = $($swiper.container["0"]).attr("rightSlide");
				navDestinations.rightPres = $($swiper.container["0"]).attr("rightPres");				
				com.gsk.mt.processCustomSwipe(navDestinations, "right");
			}
        } else if ($swiper.swipeDirection === "next" && $swiper.previousIndex === ($swiper.slides.length -1)) {
			var navDestinations ={};
			if(typeof $($swiper.container["0"]).attr("leftSlide") !== typeof undefined && $($swiper.container["0"]).attr("leftSlide")!== false){	
				navDestinations.leftSlide = $($swiper.container["0"]).attr("leftSlide");
				navDestinations.leftPres = $($swiper.container["0"]).attr("leftPres");
				com.gsk.mt.processCustomSwipe(navDestinations, "left");
			}
            
        }
		
        com.gsk.mt.trackInlineContent($($swiper.container["0"]).find(".swiper-slide").eq($swiper.activeIndex));
    },

    /**
     * Track an inline slide if it ha not yet been tracked
     * @param {Object} $element - Inline slide
     */
    trackInlineContent: function($element, answer, callback) {
		if( $element.is("[data-fields]") && $element.attr("data-fields").length > 0 ) {			       
			sessionItem = "inlineContent" + com.gsk.mt.currentSlide + (com.gsk.mt.buildClickStream($element, "").Track_Element_Description_vod__c);
			if (window.sessionStorage.getItem(sessionItem) === null) {
				window.sessionStorage.setItem(sessionItem, true);            
				callback = callback || function() { return 0; };
				var clickStream = com.gsk.mt.buildClickStream($element, "");
				com.gsk.mt.debug(JSON.stringify(clickStream), '#1c7fcb');
				com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStream, callback);
			}
		}

    },

    /**
     * Initialise tracking elements
     */
    initTracking: function() {
        $.each($(".slider:not(.dynamicFeedback)"), function() {
            com.gsk.mt.initTrackedSlider($(this));
        });

        var $logClick = $(".logClick:not(.openDialog)");
        if ($logClick.length) {
            // Disable a logClick element if it has been previously clicked
            $.each($logClick, function() {
                var $this = $(this);
                if (window.sessionStorage.getItem($this.attr('id')) !== null) {
                    $this[0].disabled = true;
                    $this.attr("data-clicked", 1);
                }
            });

            com.gsk.mt.bindInteraction(".logClick:not(.openDialog)", com.gsk.mt.releaseEvent, {}, function(e) {
                var $this = $(e.target);
                // If the element has not been clicked yet
                if ($this.attr("data-clicked") !== "1") {
                    // Log the click
                    com.gsk.mt.trackField($this, "");
                }
            });
        }

        var $logField = $(".logField");
        if ($logField.length) {
            $logField.change(function() {
                var $this = $(this),
                    type = $this.attr("type"),
                    tag = String($this.prop("tagName")).toLowerCase(),
                    answer = null;

                if (type === "checkbox") {
                    answer = $this.prop('checked') ? 'checked' : 'unchecked';
                } else if (type === "radio" || tag === "select") {
                    answer = $this.val();
                }

                com.gsk.mt.trackField($this, answer);
            });
        }

        if ($(".logFormSubmitAccount").length) {
            com.gsk.mt.bindInteraction(".logFormSubmitAccount", com.gsk.mt.releaseEvent, {}, function() {
                com.gsk.mt.formSubmitAccount();
            });
        }

        var $logFormSubmit = $(".logFormSubmit");
        if ($logFormSubmit.length) {
            // Disable element if it has been clicked
            $.each($logFormSubmit, function() {
                var $this = $(this);
                if (window.sessionStorage.getItem($this.attr('id')) !== null) {
                    $this[0].disabled = true;
                    $this.attr("data-clicked", 1);
                }
            });

            com.gsk.mt.bindInteraction(".logFormSubmit", com.gsk.mt.releaseEvent, {}, function(e) {
                var $this = $(e.target);
                if ($this.attr("data-clicked") !== "1") {
                    com.gsk.mt.formSubmit($this);
                }
            });
        }
		
		// If logged form fields are present try to retrieve the values
		if ($("#loggedTable").length) {
			  var elem = '#loggedTable';
              com.gsk.mt.bindInteraction(elem, com.gsk.mt.releaseEvent, {}, function() {
			  var empty = $("td input").filter(function(){ return this.value ==="" });
			  if(!empty.length)
                  com.gsk.mt.tableSubmit($(elem).attr('data-submit'));
			  else 
			    alert('Cells should not be empty');	  
            });
        }

        // If logged form fields are present try to retrieve the values
        if ($(".logFormField").length) {
            com.gsk.mt.retrieveFields();
        }

        // Video.js elements should be initialised regardless of the presence of the logVideo class.
        var $videos = $(".video-js");
        if ($videos.length) {
            var index = 0;
			var seektime= 0;
			if(com.gsk.mt.isNoSwipe){
				com.gsk.mt.initSwipes();
			}
            // Videos managed by video.js
            $.each($videos, function () {
                var $this = $(this);

                com.gsk.mt.players.push(videojs($this.attr("id"), {controls: true}));
                com.gsk.mt.players[index].on("play", function () {					
                    var now = Date.now(),
                        last = parseInt($this.attr('played') || 0);
                    if (now - last < 50) {
                        $this.attr('played', '' + now);
                        return;
                    }
                    $this.attr('played', '' + now);

                    if (com.gsk.mt.currentVideo !== null && this.player_.isFullscreen()==false) {
                        com.gsk.mt.currentVideo.pause();
                    }else if(com.gsk.mt.currentVideo !== null && this.player_.isFullscreen()==true) {
                        if(com.gsk.mt.currentVideo.id_ != this.id_){
                            com.gsk.mt.currentVideo.pause();
                        };
                    }

                    com.gsk.mt.currentVideo = this;
                    com.gsk.mt.lastStartTime = new Date();
                    setTimeout(function () {
                        $this.addClass("started");
                    }, 500);
                });
                
                com.gsk.mt.players[index].on("pause", function () {
                    if (!com.gsk.mt.exitingSlide) {
                        var now = Date.now(),
                            last = parseInt($this.attr('played') || 0),
                            logVideo = this.el_.classList.contains('logVideo');
                        if (now - last < 25) {
                            $this.attr('played', '' + now);
                            return;
                        }
                        $this.attr('played', '' + now);

                        if (com.gsk.mt.currentVideo === this) {
                            com.gsk.mt.currentVideo = null;
                        }											
                        // But shouldn't log if they don't have .logVideo
                        if ($this.hasClass("started") && logVideo) {
							if(com.gsk.mt.getSeconds(this) < Math.round(this.duration())){
                            	com.gsk.mt.trackVideoEvent(this);
							}
                        }
                    }
                });
				
				com.gsk.mt.players[index].on("seeked", function () {
					seektime = 0;
					window.sessionStorage.setItem('prevVideoDUration'+ this.id(),0);										
					seektime = Math.round(this.currentTime());
					return seektime;
                    
                });
				
                com.gsk.mt.players[index].on("ended", function () {					
					var prevTime = parseInt(window.sessionStorage.getItem('prevVideoDUration'+this.id())||0);
					var duration = Math.abs(Math.round(this.duration()) - seektime);
					if(seektime > 0){
						duration = Math.abs(duration);
					}else{
						duration = Math.abs(duration-prevTime);
					}					
					if ($this.hasClass("started") && this.el_.classList.contains('logVideo')) {
						if (com.gsk.mt.isVeeva || seektime == 0) {						
							com.gsk.mt.trackVideoEvent(this, duration);
						}
					}
					seektime = 0;					
					window.sessionStorage.removeItem('prevVideoDUration'+ this.id());
                    this.load();
                    $this.removeClass("started");
                });

                index++;
            });

            // Fix fastclick.
            $(".video-js *").addClass("needsclick");
        }

        $(".sendFeedback").on(com.gsk.mt.releaseEvent, function() {			
            com.gsk.mt.sendFeedback = true;
        });

        var $dynamicFeedback = $(".dynamicFeedback");
        $.each($dynamicFeedback, function() {
            var $element = $(this),
                feedback = window.sessionStorage.getItem("mtgskFeedback" + $element.attr("id"));

            if ($element.hasClass("slider")) {
                $element.slider({
                    min: parseInt($element.attr("data-min")),
                    max: parseInt($element.attr("data-max")),
                    step: parseInt($element.attr("data-step")),
                    value: parseInt($element.attr("data-value")),
                    start: function() {
                        com.gsk.mt.blockLinks = true;
                    },
                    stop: function() {
                        setTimeout(function() {
                            com.gsk.mt.blockLinks = false;
                        }, 250);
                    }
                });
            }

            if (feedback !== null) {
                if (com.gsk.mt.accountId === null) {
                    com.gsk.mt.accountId = window.sessionStorage.getItem("mtgskAccountId");
                }
                if ($element.is("[type=checkbox]") || $element.is("[type=radio]")) {
                    if (feedback === "true") {
                        $element.prop("checked", true);
                    } else {
                        $element.prop("checked", false);
                    }
                } else if ($element.hasClass("slider")) {
                    $element.slider("value", parseInt(feedback));
                } else {
                    $element.val(feedback);
                }
            } else {
                com.gsk.mt.cstreamStack.push($element);
            }
        });

        if (com.gsk.mt.cstreamStack.length > 0 && com.gsk.mt.isVeeva) {
            com.gsk.mt.getAccountIdForFeedback();
        }

        // Trigger data storage on slide transition
        window.addEventListener(com.gsk.mt.exitEvent, function() {
            com.gsk.mt.exitingSlide = true;
			$('.logVideo').each(function(){
                  window.sessionStorage.removeItem('prevVideoDUration'+$(this).attr('id'));
			});
            return com.veeva.clm.createRecordsOnExit();
        });
    },

    /**
     * Initialise sub slides
     */
    initSubSlides: function() {
        if (com.gsk.mt.currentSlide === com.gsk.mtconfig.menu ||
            com.gsk.mt.currentSlide === com.gsk.mtconfig.references ||
            com.gsk.mt.currentSlide === com.gsk.mtconfig.pi ||
            com.gsk.mt.currentSlide === com.gsk.mtconfig.objection)
        {
            return 0;
        }

        com.gsk.mt.subSlides = {
            root: null
        };

        $.each(com.gsk.mtconfig.subSlides, function(key, value) {
            for (var i = 0; i < value.length; i++) {
                if (value[i].slide === com.gsk.mt.currentSlide) {
                    com.gsk.mt.subSlides.root = key;
                    window.sessionStorage.setItem("mtgskSubSlideRoot", com.gsk.mt.subSlides.root);
                    com.gsk.mt.subSlides.slide = value;
                    window.sessionStorage.setItem("mtgskSubSlide", JSON.stringify(com.gsk.mt.subSlides.slide));
                }
            }
        });

        if (com.gsk.mt.subSlides.root === null) {
            return;
        }

        // Insert navigation elements
        com.gsk.mt.dom.container.append('<div class="navSubSlide"><div id="subSlideUp" class="gotoSlide"></div><div id="subSlideDown" class="gotoSlide"></div></div>');

        /**
         * INTERNAL: Is it necessary to remove nav bumpers on main slides?
         *
         * @since 1.6
         */        
        var index = 0;
        for (var ii = 0; ii < com.gsk.mt.subSlides.slide.length; ii++) {
            if (com.gsk.mt.subSlides.slide[ii].slide === com.gsk.mt.currentSlide) {
                index = ii;
                break;
            }
        }
        if (index - 1 >= 0) {
            $("#subSlideUp").addClass("ssNavActive")
                .attr("data-slide", com.gsk.mt.subSlides.slide[index - 1].slide)
                .attr("data-presentation", com.gsk.mt.subSlides.slide[index - 1].presentation);
        }
        if (index + 1 < com.gsk.mt.subSlides.slide.length) {
            $("#subSlideDown").addClass("ssNavActive")
                .attr("data-slide", com.gsk.mt.subSlides.slide[index + 1].slide)
                .attr("data-presentation", com.gsk.mt.subSlides.slide[index + 1].presentation);
        }

        $('.ssNavActive').on(com.gsk.mt.pressEvent, function(e) {
            e.stopPropagation();
        });
		
        window.sessionStorage.setItem('mtgskPreviousSlide', com.gsk.mt.subSlides.slide[index].slide);
        window.sessionStorage.setItem('mtgskPreviousPres', com.gsk.mt.subSlides.slide[index].presentation);

        if (com.gsk.mt.subSlides.slide[index].presentation !== com.gsk.mtconfig.presentation) {
            if (com.gsk.mt.subSlides.slide[index].references !== undefined) {
                com.gsk.mt.slideReferences = com.gsk.mt.subSlides.slide[index].references;
                window.sessionStorage.setItem("mtgskSlideReferences", JSON.stringify(com.gsk.mt.slideReferences));
            } else {
                window.sessionStorage.setItem("mtgskSlideReferences", null);
            }
            if (com.gsk.mt.subSlides.slide[index].footnotes !== undefined) {
                com.gsk.mt.slideFootnotes = com.gsk.mt.subSlides.slide[index].footnotes;
                window.sessionStorage.setItem("mtgskSlideFootnotes", JSON.stringify(com.gsk.mt.slideFootnotes));
            } else {
                window.sessionStorage.setItem("mtgskSlideFootnotes", null);
            }
        }

        /**
         * INTERNAL: Some quick link icons are hidden if not use, search only for visible icons
         *
         * @since 1.6
         */ 		 
        
		var $navdiv = $(".navBottom div.display");
		if ($navdiv.length >= 7) {
			$.each($navdiv, function (index, el) { 
			  if(index == 6 && $(this).length > 0){
				 $(this).addClass("adjustForNav");			 
			  }
			});
		}
    },

    /**
     * Initialise US specific elements
     * Scroller is now managed by com.gsk.mt.initScrollable
     */
    initUS: function() {
        com.gsk.mt.dom.body.addClass("includeISI");
    },

    /**
     * Initialise dialog windows (popups)
     */
    initDialogs: function() {
        var $openDialogs = $(".openDialog");

        if ($openDialogs.length > 0) {
            $.widget("ui.dialog", $.ui.dialog, {
                open: function() {
                    var customMenuWrapper = $('#customMenuWrapper');
                    if (com.gsk.mtconfig.embedMenu && customMenuWrapper.length > 0 && customMenuWrapper.css("display") !== "none") {
                        customMenuWrapper.css("display", "none");
                    }
					
					// enable swipe on dialog Code
                    if (com.gsk.mtconfig.enableSwipesOnDialog) {   
						 
						 var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
							flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
							slideFlowIndex = flow.indexOf(slideIndex);
							if (slideFlowIndex < 0) {
								if(!com.gsk.mt.dom.container.hasClass("customSwipe")){							
									com.gsk.mt.blockLinks = true;
									$('body').addClass("noSwipe");
								}
							} else{
								com.gsk.mt.blockLinks = false;
							}
                    }                                                                 
                     // 

                    if (!com.gsk.mtconfig.enableSwipesOnDialog || com.gsk.mt.dom.container.hasClass("noSwipe")) {
                        com.gsk.mt.blockLinks = true;
						
						// enable swipe on dialog Code
						$('body').addClass("noSwipe");
						
                    }
					
                    $("#flowSelector, #fragmentSelector").addClass("hidden").removeClass("activeNav");
					
                    // Prevent dialog from closing automatically
                    setTimeout(function() {
                        com.gsk.mt.blockClose = false;
                    }, 250);

                    com.gsk.mt.blockSwipes = !com.gsk.mtconfig.enableSwipesOnDialog;

                    return this._super();
                },
                close: function(e) {
                    if (com.gsk.mt.blockClose) {
                        return;
                    }
					if (com.gsk.mt.currentVideo !== null) {
						com.gsk.mt.videopopupClose();
					}
					var activeDialog = com.gsk.mt.getActiveDialog();
					if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && com.gsk.mt.tabspopupClose !== undefined) {
                        com.gsk.mt.tabspopupClose();
                    }else if(activeDialog !== null && activeDialog.hasClass("quickLinkDialog") && com.gsk.mt.tabspopupClose !== undefined){
						com.gsk.mt.inlinetabStartTime = new Date();
					}
					//popup level-1 content (H scrolling control) start					
					if (com.gsk.mtconfig.embedReferences){
						if(com.gsk.mt.swiperArray.length >0) {
							for(var ii = 0; com.gsk.mt.swiperArray.length >ii ; ii++) {
								com.gsk.mt.swiperArray[ii].unlockSwipes();
							}
						}
					}
					//popup level-1 content (H scrolling control) End
					
					if (!com.gsk.mtconfig.enableSwipesOnDialog) {						
						 com.gsk.mt.blockLinks = false;
						 if ($(".ui-widget-overlay").length == 1) {
							  com.gsk.mt.dom.body.removeClass("noSwipe");
						 }
                    }
					if (com.gsk.mtconfig.enableSwipesOnDialog) {  
						 
						 var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
							flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
							slideFlowIndex = flow.indexOf(slideIndex);
							if (slideFlowIndex < 0) {
								if ($(".ui-widget-overlay").length == 1) {
									  com.gsk.mt.dom.body.removeClass("noSwipe");
								 }
							} 
                    } 
                    if ($(".ui-widget-overlay").length > 1) {
                        if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
                            $(".navBottom").appendTo($(".ui-widget-overlay:nth-last-of-type(2)"));
                        }
                    } else {
                        if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
                            $(".navBottom").appendTo("#container");
                        }

                        if (com.gsk.mt.blockSwipes) {
                            com.gsk.mt.blockLinks = false;
                            com.gsk.mt.blockSwipes = false;
                        } else if (com.gsk.mt.isNoSwipe) {
                            com.gsk.mt.dom.container.addClass("noSwipe");
                        }
                    }
					
                    if (com.gsk.mt.activeQuickLink) {
                        com.gsk.mt.activeQuickLink.removeClass("activeNav");
                        com.gsk.mt.activeQuickLink = null;
                        com.gsk.mt.currentRefs = null;

                        com.gsk.mt.setHomeButtonState();
						if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.callSummary) {				
							$("#callSummary").css("display", "inline-block");                
						}else{
							$("#callSummary").addClass("activeNav display");
						}
                    }

                    var $dialog = $(e.target).closest(".ui-dialog").find(".dialog");

                    com.gsk.mt.destroyDialogIscroll($dialog);

                    if (com.gsk.mt.onDialogClose !== undefined) {						
							com.gsk.mt.onDialogClose();
                    }	
					if(com.gsk.mt.dialogStack.length > 1){												 
						com.gsk.mt.rebuildDialogIscroll($(com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length-2]));						
					}
					
					$(".quickLinkDialogContent").addClass("hidden");
					com.gsk.mt.activatebutton();					
					com.gsk.mt.dialogStack.pop();					
					return this._super();
                }
            });

            $.each($openDialogs, function() {
                com.gsk.mt.initDialog($($(this).attr("data-dialog")));
                $(this).addClass("needsclick");
            });

            com.gsk.mt.bindInteraction(".openDialog", com.gsk.mt.releaseEvent, {}, function(e) {
                e.stopPropagation();
                e.preventDefault();

                if (com.gsk.mt.scrolling) {
                    //return;
                }
				
                var $element = $(e.target),
                    quickLink = $element.attr("data-quicklink");

                				
				
                if (quickLink && $element !== com.gsk.mt.activeQuickLink) {					
					var activeQuickLinkStatus = $(".quickLinkDialogContent:not(.hidden)").hasClass('quickLinkDialogReferences'); 					
					if (quickLink !== "References") {
						for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
							 $(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
						}
					}else if(quickLink === "References" && com.gsk.mtconfig.embedPopupReferences === true ){
						var activeDialog = com.gsk.mt.getActiveDialog();
						if (activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.hasClass("videoDialog")) {
							activeDialog.find('video').each(function() {                    
								this.pause();								
								com.gsk.mt.currentVideo = null;                 
							}); 		
						}
						if (com.gsk.mt.dialogStack.length > 0 && com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length - 1].hasClass("quickLinkDialog")) {
							if(activeQuickLinkStatus){
								$(com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length-1]).parent().find('.ui-dialog-titlebar-close').trigger('click');
							}else{
								for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
									$(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
								}
							}
						}						
											
					}else if(quickLink === "References" && com.gsk.mtconfig.embedPopupReferences === false){
						for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
							 $(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
						}						
					}
					$(".activeNav").removeClass("activeNav");
                    com.gsk.mt.activeQuickLink = $element;
                    com.gsk.mt.activeQuickLink.addClass("activeNav");
                }

                if (quickLink === undefined && $element.hasClass("gotoRef")) {
                    quickLink = "References";
                }

                if (quickLink === "References") {
                    $(".referenceSelector").removeClass("hidden");
                } else {
                    $(".referenceSelector").addClass("hidden");
                }

                if (quickLink === "References" && !$(".quickLinkDialogReferences").hasClass("hidden")) {
                    //return;
                }

                if ($element.hasClass("logEmbedded") && !$element.hasClass("trackingSubmitted")) {
					setTimeout(function(){
						com.gsk.mt.trackQuickLink($element);
					},500);                    
                }

                if ($element.hasClass("logClick")) {
                    com.gsk.mt.trackField($element, "");
                }
				if(com.gsk.mt.dialogStack.length > 0){
					com.gsk.mt.tabspopupClose();
				}
                com.gsk.mt.openDialog($($element.attr("data-dialog")));

                if (quickLink !== undefined) {
                    com.gsk.mt.processQuickLinkDialog(quickLink);
                    if (quickLink === "References") {
                        com.gsk.mt.processGotoRef($element);
                    }
                }
            });
        }
    },

    initDialogForPortrait: function(dialogId, width, height) {
        if ($('body').outerWidth() < 1000) {
            $(dialogId).attr("data-width", width)
                .attr("data-height", height);
        }
    },

    /**
     * Initialise scrollable (iScroll) elements
     */
    initScrollable: function() {
        var scrollable = $(".scrollable"),
            $this;

        if (scrollable.length > 0) {
            $.each(scrollable, function() {
                $this = $(this);

                if (parseInt($this.outerHeight()) < parseInt($this.find(".scrollableInner").css("height"))) {
                    com.gsk.mt.initScroller($this);
                }
            });
        }
    },

    /**
     * Initialise an iScroll scroller
     * @param {Object} $scroller
     */
    initScroller: function($scroller) {
        com.gsk.mt.destroyDialogIscroll($scroller);

        var myScroll = new IScroll("#" + $scroller.attr("id"), {
            scrollbars: true,
            preventDefault: false
        });
        myScroll.on("scrollStart", function() {
            com.gsk.mt.scrolling = true;
        });
        myScroll.on("scrollCancel", function() {
            com.gsk.mt.scrolling = false;
        });
        myScroll.on("scrollEnd", function() {
            com.gsk.mt.scrolling = false;
        });
        $scroller.data("gskmtIScroll", myScroll);
    },

    /**
     * Initialise email system - only invoked if com.gsk.mtconfig.useEmail is true
     */
    initEmail: function() {
        com.gsk.mt.dom.email = $("#email");
        com.gsk.mt.dom.email.css('display', 'inline-block');
        com.gsk.mt.dom.email.addClass("inactive");

        com.gsk.mt.getSavedFragments();

        if (com.gsk.mtconfig.pagesEmail[com.gsk.mt.currentSlide] !== undefined) {

            var callback = function(event) {
                com.gsk.mt.toggleFragment($(event.target));
				if (com.gsk.mtconfig.useEmail && com.gsk.mtconfig.useShoppingCartEmail)
			      $(event.target).hasClass('gskFragmentSelected')?$(event.target).find('.status').text(com.gsk.mtconfig.emailStatusText[1]):	$(event.target).find('.status').text(com.gsk.mtconfig.emailStatusText[0])
            };

            com.gsk.mt.initEmailSelector(false, callback);
            com.gsk.mt.fragmentCount();

            return;
        }

        // If the email quick link does not have the sendEmail class we can exit initialisation
        if (!com.gsk.mt.dom.email.hasClass("sendEmail")) {
            return;
        }

        com.gsk.mt.initEmailSelector(true, com.gsk.mt.sendEmail);
        com.gsk.mt.fragmentCountFinal();
    },

    /**
     * Insert selector and bind handlers for selecting fragments or sending emails
     * @param {boolean} sendEmail - if true set up for templates, otherwise fragments
     * @param {callback} optionCallback
     */
    initEmailSelector: function(sendEmail, optionCallback) {
        com.gsk.mt.dom.fragmentSelector = com.gsk.mt.insertEmailSelector(sendEmail);

        // Show fragment selector
        com.gsk.mt.bindInteraction("#email", com.gsk.mt.releaseEvent, {}, com.gsk.mt.toggleEmailSelector);
        // Hide fragment selector
        com.gsk.mt.bindInteraction("#closeSelector", com.gsk.mt.releaseEvent, {}, com.gsk.mt.hideEmailSelector);
        // Send email
        com.gsk.mt.bindInteraction(".fragmentOption", com.gsk.mt.releaseEvent, {}, optionCallback);

        com.gsk.mt.dom.fragmentSelector.css({
            "left": document.getElementById("email").getBoundingClientRect().left - parseInt($('#container').offset().left)  - parseInt(com.gsk.mt.dom.fragmentSelector.css("width")) / 2 + (document.getElementById("email").getBoundingClientRect().width/2)
        });
    },

    /**
     * Toggle the visibility of the email selector
     */
    toggleEmailSelector: function() {
		for(var i = com.gsk.mt.dialogStack.length-1;i>-1;i--){ 
            $(com.gsk.mt.dialogStack[i]).parent().find('.ui-dialog-titlebar-close').trigger('click'); 
         }
        $("#flowSelector").addClass("hidden");
        $("#quickLinkDialog").parent().find(".ui-dialog-titlebar-close").trigger("click");
        com.gsk.mt.dom.fragmentSelector.toggleClass("hidden");

        $("#closeCustomMenu").trigger(com.gsk.mt.releaseEvent);

        $(".activeNav").removeClass("activeNav");
        if (!com.gsk.mt.dom.fragmentSelector.hasClass("hidden")) {
            $("#email").addClass("activeNav");
        } else {
            com.gsk.mt.setHomeButtonState();
        }
    },

    /**
     * Hide the email selector
     */
    hideEmailSelector: function() {
        com.gsk.mt.dom.fragmentSelector.addClass("hidden");

        $(".activeNav").removeClass("activeNav");
		com.gsk.mt.activatebutton();
        com.gsk.mt.setHomeButtonState();
		if (com.gsk.mt.currentSlide !== com.gsk.mtconfig.callSummary) {				
			$("#callSummary").css("display", "inline-block");                
		}else{
			$("#callSummary").addClass("activeNav display");
		}
    },
	
	
	
	/**
     * Initialise email shopping cart system - only invoked if com.gsk.mtconfig.useEmail is false and com.gsk.mtconfig.useShoppingCartEmail is true
     */
initShopEmail: function() {
		 if(com.gsk.mtconfig.pagesEmail[com.gsk.mt.currentSlide]){
				 // Checking and Storing already fragments are selected in any slide
				 var existedFrags = [];
				 com.gsk.mtconfig.pagesEmail[com.gsk.mt.currentSlide].forEach(function(value){	 
					 existedFrags.push({'existed':com.gsk.mtconfig.fragments[value],'status':com.gsk.mtconfig.emailStatusText[0]});	 
				 });
				 // Checking and Storing already fragments are not selected in the all fragments
				var notExistedFrags = [];
				com.gsk.mtconfig.fragments.forEach(function(item,index){
					if(com.gsk.mtconfig.pagesEmail[com.gsk.mt.currentSlide].indexOf(index)<0){
						  notExistedFrags.push({'notExisted':item,'status':com.gsk.mtconfig.emailStatusText[0]})
					 }
		        });
		//Storing selected fragments in all slides into the array		
		var selectedFrags = [];
		if(window.sessionStorage.getItem('mtgskEmailFragments')){
		   var prev_frags = JSON.parse(window.sessionStorage.getItem('mtgskEmailFragments'));
		   for(var i=0;i<prev_frags.length;i++){
				notExistedFrags.forEach(function(item){
					   if(item['notExisted'].id === prev_frags[i])
						selectedFrags.push(item)
				 });
		   }
		}
	//Clearing(removing) the all fragments content from DOM
	$('#fragmentSelectorInner').remove();
	com.gsk.mt.insertShopEmailMarkup(selectedFrags,existedFrags)
	
	}
	
},
	
	   /**
     * Insert Shop email cart markup and selector and options into the slide
     * @param {boolean} selectedFrags and 
     */
    insertShopEmailMarkup: function(selectedFrags,existedFrags) {
         var sFrags= selectedFrags.reduce(function(sum,val){
	       return sum+'<div class="fragmentOption" data-id="'+val.notExisted.id+'">'+val.notExisted.label+'<span class="status">'+val.status+'</span></div>';
	      },'<hr></hr><div class="bold">'+com.gsk.mtconfig.emailCartFooter+'</div>');
		  
		var eFrags= existedFrags.reduce(function(sum,val){
		   return sum+'<div class="fragmentOption" data-id="'+val.existed.id+'">'+val.existed.label+'<span class="status">'+val.status+'</span></div>';
		 },'<div id="fragmentSelectorInner"><div class="bold">'+com.gsk.mtconfig.emailCartHeader+'</div>');
		
	    $('#fragmentSelector').prepend(eFrags+sFrags+'<div id="closeSelector"></div>');
		$('#fragmentSelector').addClass("fragContainerWidth");
		com.gsk.mt.getSavedFragments();
		// Toggling status (add or remove) text 
		if(window.sessionStorage.getItem('mtgskEmailFragments')){
			var frags = JSON.parse(window.sessionStorage.getItem('mtgskEmailFragments'));
			$('.fragmentOption').each(function(ind,elem){
				for(var i=0;i<frags.length;i++){
					  if($(elem).attr('data-id') == frags[i]){
						$(elem).addClass('gskFragmentSelected');
						if($(elem).hasClass('gskFragmentSelected')){
						  $(elem).find('.status').text(com.gsk.mtconfig.emailStatusText[1]);
						}
					  }
				 } 
			});
		  $('#email').addClass('active');
		  com.gsk.mt.fragmentCount();
		
		}
		$('#flowSelector').addClass('fragContainerWidth')
		$('#fragmentSelectorInner').append('<div class="sendShopEmail active">'+com.gsk.mtconfig.emailTemplateHead+'</div>');	
		com.gsk.mt.initShopEmailEvents();
	
    },
	
	/**
     * Bind handlers for selecting fragments or sending emails
     */
	
	initShopEmailEvents: function() {
		  com.gsk.mt.bindInteraction("#closeSelector", com.gsk.mt.releaseEvent, {}, function() {
			   var $fragmentSelector = $("#fragmentSelector");
			   $fragmentSelector.addClass("hidden");
		  });
		
		 com.gsk.mt.bindInteraction(".sendShopEmail",com.gsk.mt.releaseEvent,{},function(ev){
			    $('#fragmentSelectorInner').empty();
			    com.gsk.mt.insertEmailSelector(true);
				$('#fragmentSelectorInner').append('<div  class="templateClose"></div>');	
				$('.fragmentOption').each(function(){
					$(this).addClass('fragmentOptionTemplate');
					$(this).removeClass('fragmentOption');
					
				});
				
				 
 		 });
		 com.gsk.mt.bindInteraction(".fragmentOptionTemplate", com.gsk.mt.releaseEvent, {}, com.gsk.mt.sendEmail);
				com.gsk.mt.bindInteraction(".templateClose", com.gsk.mt.releaseEvent, {}, function(){
					 com.gsk.mt.initShopEmail();
				});
		
    },
	
		

    /**
     * Return true if the current slide an ADD slide
     * @returns {boolean}
     */
    isAddSlide: function() {
        return com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide) < 0;
    },

    /**
     * Return true is te current slide is a sub slide
     * @returns {boolean}
     */
    isSubSlide: function() {
        var subSlides = window.sessionStorage.getItem("mtgskSubSlide");

        if (subSlides !== null && subSlides !== undefined) {
            subSlides = JSON.parse(subSlides);
            for (var ii = 0; ii < subSlides.length; ii++) {
                if (com.gsk.mt.currentSlide === subSlides[ii].slide) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * Initialise references
     */
    initReferences: function() {
        if (com.gsk.mt.currentSlide === com.gsk.mtconfig.references) {
            com.gsk.mt.getReferenceSessionData();

            if (com.gsk.mt.slideRefTarget !== null) {
                com.gsk.mt.slideRefTarget = JSON.parse(com.gsk.mt.slideRefTarget);
                com.gsk.mt.doReferences("REFTARGET");
            } else {
                com.gsk.mt.doReferences("PAGE");
            }
        } else {
            com.gsk.mt.slideReferences = com.gsk.mt.getReferencesForSlide(com.gsk.mt.currentSlide);
            window.sessionStorage.setItem("mtgskSlideReferences", JSON.stringify(com.gsk.mt.slideReferences));
            com.gsk.mt.slideFootnotes = com.gsk.mt.getFootnotesForSlide(com.gsk.mt.currentSlide);
            window.sessionStorage.setItem("mtgskSlideFootnotes", JSON.stringify(com.gsk.mt.slideFootnotes));

            if (com.gsk.mtconfig.embedReferences) {
                $(".gotoRef").addClass("openDialog")
                    .removeClass("gotoSlide")
                    .attr("data-dialog", "#quickLinkDialog");
            } else {
                window.sessionStorage.removeItem("mtgskSlideRefTarget");
            }
        }

        if (!com.gsk.mtconfig.embedReferences) {
            com.gsk.mt.bindInteraction(".gotoRef", com.gsk.mt.pressEvent, {}, function(e) {
                e.stopPropagation();
                com.gsk.mt.blockClose = true;
                com.gsk.mt.processGotoRef($(e.target));
            });
        }

        com.gsk.mt.bindInteraction("#referencesPage", com.gsk.mt.releaseEvent, {}, function() {
            if (com.gsk.mt.slideRefTarget !== null) {
                com.gsk.mt.doReferences("REFTARGET");
            } else {
                com.gsk.mt.doReferences("PAGE");
            }
        });

        com.gsk.mt.bindInteraction("#referencesAll", com.gsk.mt.releaseEvent, {}, function() {
            com.gsk.mt.doReferences("ALL");
        });
    },

    /**
     * Set reference variables from session storage
     */
    getReferenceSessionData: function() {
        com.gsk.mt.slideReferences = JSON.parse(window.sessionStorage.getItem("mtgskSlideReferences"));
        com.gsk.mt.slideFootnotes = JSON.parse(window.sessionStorage.getItem("mtgskSlideFootnotes"));
        com.gsk.mt.slideRefTarget = window.sessionStorage.getItem("mtgskSlideRefTarget");
    },
	
	activatebutton:function(){
		var flowHome = com.gsk.mtconfig.pagesAll[com.gsk.mtconfig.flows[com.gsk.mt.currentFlow][0]];
		if (com.gsk.mtconfig.homeResetsFlows) {
                if (com.gsk.mtconfig.homepage === com.gsk.mt.currentSlide) {
                    $("#home").addClass('activeNav');
                }
		} else if ((com.gsk.mt.currentFlow !== "Main" && flowHome === com.gsk.mt.currentSlide) ||
			(com.gsk.mt.currentFlow === "Main" && com.gsk.mtconfig.homepage === com.gsk.mt.currentSlide))
		{
			$("#home").addClass("activeNav");
		}
		if (com.gsk.mtconfig.pi === com.gsk.mt.currentSlide) {
			$('#pi').addClass("activeNav display");
		}else if (com.gsk.mtconfig.references === com.gsk.mt.currentSlide) {
			$('#references').addClass("activeNav display");
		}else if (com.gsk.mtconfig.menu === com.gsk.mt.currentSlide) {
			$('#menu').addClass("activeNav display");
		}else if (com.gsk.mtconfig.quickres === com.gsk.mt.currentSlide) {
			$('#quickres').addClass("activeNav display");
		}else if (com.gsk.mtconfig.objection === com.gsk.mt.currentSlide) {		
			$('#objection').addClass("activeNav display");
		}
	},

    /* Debugging */

    /**
     * Trigger a console message if the presentation is running in a desktop browser
     * @param {string} message
     * @param {string} foreground - color
     * @param {string} background - color
     */
    debug: function(message, foreground, background) {
        if (!com.gsk.mt.isVeeva) {
            foreground = foreground || '#000';
            background = background || '#fff';

            console.log('%c' + message, 'color: ' + foreground + '; background: ' + background + ';');
        }
    },

    /**
     * Detect whether the presentation is running in a browser (excluding Engage)
     * @returns {boolean}
     */
    isVeevaEnvironment: function() {
        if (navigator.userAgent.match(/iPad/i) !== null ||
            navigator.userAgent.match(/iPhone/i) !== null) {
            return true;
        }

        var isIE = (/*@cc_on!@*/false || !!document.documentMode),
            isChrome = (!!window.chrome),
            isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 ||
                !isChrome && window.webkitAudioContext !== undefined;
        if (typeof InstallTrigger !== 'undefined' || // Firefox
            isSafari || // Safari
            isIE || // IE
            (!isIE && !!window.StyleMedia) || // Edge
            isChrome) // Chrome
        {
            return com.veeva.clm.isEngage();
        }
        return true;
    },

    /**
     * Set the environment depending upon whether com.gsk.mt.isVeeva is true or false
     */
    setEnvironment: function() {
        if (com.gsk.mt.isVeeva) {
            com.gsk.mt.isEngage     = com.veeva.clm.isEngage();
            com.gsk.mt.extension    = ".zip";
            com.gsk.mt.pressEvent   = "touchstart";
            com.gsk.mt.releaseEvent = "touchend";

            if ($(".zincCode").length > 0) {
                com.gsk.mt.getZincCode();
            }

            com.gsk.mt.fastClick = Origami.fastclick;
            com.gsk.mt.fastClick(document.getElementById("container"));
        }
    },

    /**
     * Populate the Zinc code
     */
    getZincCode: function() {
        var fallback = $(".zincCode").html();
        com.gsk.mt.readField("Presentation", "CORE_GSK_Zinc_ID__c", fallback, ".zincCode");
    },

    /* Interaction */

    /**
     * Bind interaction to an element - helper function for binding interactions
     * to an element: necessary to maintain abstraction!
     * @param {string} element
     * @param {string} eventType
     * @param {Object} options
     * @param {function} callback
     */
    bindInteraction: function(element, eventType, options, callback) {
        var $element = $(element);
        options.domEvents = true;
        options.touchAction = 'auto';
        if ($element === null) { return; }

        if (element === "#container") {
            com.gsk.mt.dom.container.hammer(options).on(eventType, function(e) {
                callback(e);
            });
        } else {
            com.gsk.mt.dom.body.hammer(options).on(eventType, element, function(e) {
                // Prevent ghost clicks.
                var eventTimeStamp = e.timeStamp,
                    elementTimeStamp = $(e.currentTarget).data("hammerTimeStamp");

                $(e.currentTarget).data("hammerTimeStamp", eventTimeStamp);

                if (elementTimeStamp !== undefined && eventTimeStamp - elementTimeStamp < 20) {
                    // Ghost click
                    return;
                }

                callback(e);
            });
        }
    },

    /**
     * Bind swipe to an element - helper function for binding swipes
     * to an element: necessary to maintain abstraction!
     * @param {string} element
     * @param {Object} options
     * @param {function} callback
     */
    bindSwipe: function(element, options, callback) {
        options.touchAction = 'auto';
        options.domEvents = true;

        var hammerSwipe = new Hammer(document.getElementById("container"), options);

        if (options.direction !== undefined) {
            hammerSwipe.get('swipe').set({ direction: options.direction });
        }

        hammerSwipe.on("swipe", callback);
        $(element).data("hammer", hammerSwipe);
    },

    /* Navigation */

    /**
     * Gets the current flow for the presentation
     * @returns {string} Current flow
     */
    getCurrentFlow: function() {
        if (window.sessionStorage.getItem("mtgskPortfolioLinked") !== null) {
            window.sessionStorage.removeItem("mtgskPortfolioLinked");
            window.sessionStorage.removeItem('mtgskFlows');
        }

        var currentFlow = window.sessionStorage.getItem('mtgskCurrentFlow'),
            flow = com.gsk.mtconfig.flows[currentFlow]; 

        if (com.gsk.mtconfig.flows.Main === undefined) {
            for (var ii = 0; ii < com.gsk.mtconfig.pagesAll.length; com.gsk.mtconfig.flows.Main.push(ii), ii++) {}
        }

        if (currentFlow === null || com.gsk.mtconfig.flows[currentFlow] === undefined) {
            currentFlow = "Main";
            flow = com.gsk.mtconfig.flows.Main;
        }

        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide);

        if (slideIndex > -1 && flow.indexOf(slideIndex) < 0) {
			if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) == -1) {			 
            	currentFlow = "Main";
			}
			
        }

        window.sessionStorage.setItem('mtgskCurrentFlow', currentFlow);

        return currentFlow;
    },

    /**
     * Insert the flow selector markup including flows
     */
    insertFlowSelector: function(keys) {
        var selectorHTML = '<div id="flowSelector" class="hidden"><div id="flowSelectorInner">' +
            '<div id="closeFlowSelector"></div>';

        for (var ii = 0; ii < keys.length; ii++) {
            var flowLabel = keys[ii].replace("_", " ");
			
			//Enabling localization for main keyword in MT flows
			var x = com.gsk.mtconfig.localisation.main.trim();
			if(flowLabel === 'Main' && x.length>0) {
				flowLabel = (com.gsk.mtconfig.localisation.main).replace("_", " ");				
			}

            if (com.gsk.mt.currentFlow === keys[ii]) {
                selectorHTML += '<div class="flowSelect gskFlowSelected">' + flowLabel + '</div>';
            } else {
                selectorHTML += '<div class="flowSelect gotoFlow" data-flow="' + keys[ii] + '">' + flowLabel + '</div>';
            }
        }
        selectorHTML += '</div><div class="selectorTriangle"></div></div>';
        com.gsk.mt.dom.container.append(selectorHTML);
    },

    /**
     * Gets the current slide in the presentation
     * @returns {string} Current slide
     */
    getCurrentSlide: function() {
        var parser = document.createElement('a');
        parser.href = window.location.href.replace("/index.html", "");
        return String(parser.pathname).substring(parser.pathname.lastIndexOf('/') + 1);
    },

    /**
     * Gets the current presentation
     * @returns {string} Current presentation
     */
    getCurrentPres: function() {
        if (com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide) > -1) {
            return com.gsk.mtconfig.presentation;
        }

        var addPresentationValues = [
            com.gsk.mtconfig.menuPresentation,
            com.gsk.mtconfig.referencesPresentation,
            com.gsk.mtconfig.piPresentation,
			com.gsk.mtconfig.quickresPresentation,
            com.gsk.mtconfig.objectionPresentation
        ];

        for (var i = 0; i < addPresentationValues.length; i++) {
            if (addPresentationValues[i] !== com.gsk.mtconfig.presentation) {
                return addPresentationValues[i];
            }
        }

        return com.gsk.mtconfig.presentation;
    },

    /**
     * Gets the previous slide in the presentation if not at the first slide
     * @returns {string} Previous slide
     */
    getPreviousSlide: function() {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
            previousSlide;

        var slideFlowIndex = flow.indexOf(slideIndex);
        if (slideIndex > -1 && slideFlowIndex < 0) {
			if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) == -1) {
				flow = com.gsk.mtconfig.flows["Main"];
				window.sessionStorage.setItem("mtgskCurrentFlow", "Main");
			}
            slideFlowIndex = flow.indexOf(slideIndex);
            if (slideFlowIndex <= 0) {
				if(!com.gsk.mt.dom.container.hasClass("customSwipe")){
					com.gsk.mt.dom.container.addClass("noSwipe");
					com.gsk.mt.initSwipes();
				}				
                previousSlide = com.gsk.mtconfig.pagesAll[flow[0]];
            } else {
                previousSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex - 1]];
            }
        } else if (slideFlowIndex === 0) {			
            previousSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex]];
        } else {			
            previousSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex - 1]];
        }
		if(slideFlowIndex < 0 && jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) > -1) {
			if ($("#mtgskClose").length) {
            	$('#mtgskClose').show();
        	}			
		}

        return previousSlide;
    },

    /**
     * Gets the next slide in the presentation if not at the last slide
     * @returns {string} Next slide
     */
    getNextSlide: function() {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
            nextSlide;

        var slideFlowIndex = flow.indexOf(slideIndex);
        if (slideIndex > -1 && slideFlowIndex < 0) {
			if(jQuery.inArray( com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide), com.gsk.mtconfig.addAll) == -1) {
				flow = com.gsk.mtconfig.flows["Main"];
				window.sessionStorage.setItem("mtgskCurrentFlow", "Main");
			}
            slideFlowIndex = flow.indexOf(slideIndex);
            if (slideFlowIndex + 1 >= flow.length) {
                nextSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex]];
            } else {
                nextSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex + 1]];
            }
        }
        if (slideFlowIndex + 1 >= flow.length) {
            nextSlide = com.gsk.mt.currentSlide;
        } else {
            nextSlide = com.gsk.mtconfig.pagesAll[flow[slideFlowIndex + 1]];
        }

        return nextSlide;
    },

    /**
     * Go to the next slide in the presentation
     * @param {boolean} [override]
     */
    gotoNextSlide: function(override) {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
            nextSlide;
        var slideFlowIndex = flow.indexOf(slideIndex);
        if (!override && com.gsk.mt.blockLinks || slideFlowIndex + 1 >= flow.length) { return; }

        if (com.gsk.mt.isVeeva) {
            com.gsk.mt.gotoSlide(com.gsk.mt.nextSlide);
        } else {
            com.gsk.mt.debug("Going to slide " + com.gsk.mt.nextSlide, "#1c7fcb");
            document.location.href = com.gsk.mt.buildUrl(com.gsk.mt.nextSlide);
        }
    },

    /**
     * Go to the previous slide in the presentation
     * @param {boolean} [override]
     */
    gotoPreviousSlide: function(override) {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            flow = com.gsk.mtconfig.flows[com.gsk.mt.currentFlow],
            nextSlide;
        var slideFlowIndex = flow.indexOf(slideIndex);
        if (!override && com.gsk.mt.blockLinks || slideFlowIndex === 0) { return; }

        if (com.gsk.mt.isVeeva) {
            com.gsk.mt.gotoSlide(com.gsk.mt.previousSlide);
        } else {
            com.gsk.mt.debug("Going to slide " + com.gsk.mt.previousSlide, '#1c7fcb');
            document.location.href = com.gsk.mt.buildUrl(com.gsk.mt.previousSlide);
        }
    },

    /**
     * Go to the specified slide/presentation
     * @param {string} slide
     * @param {string} [presentation]
     * @param {boolean} [override]
     */
    gotoSlide: function(slide, presentation, override) {
        if (!override && (!slide || com.gsk.mt.blockLinks)) { return; }

        if (com.gsk.mt.isVeeva) {
            com.veeva.clm.gotoSlide(slide + com.gsk.mt.extension, presentation);
        } else {
            if (presentation !== "" && presentation !== undefined) {
                com.gsk.mt.debug("Going to slide " + presentation + "/" + slide, '#1c7fcb');
            } else {
                com.gsk.mt.debug("Going to slide " + slide, '#1c7fcb');
            }
            document.location.href = com.gsk.mt.buildUrl(slide, presentation);
        }
    },

    /**
     * Offline workaround to allow linking to assets without an index.html file
     * @param {string} type Type of asset - 'pdf' or 'video'
     * @param {string} slide
     * @param {string} [presentation]
     */
    gotoAsset: function(type, slide, presentation) {
        if (com.gsk.mt.isVeeva || !type || !slide) { return; }

        // Force lowercase type on local asset links
        var format = (type.toLowerCase() === "pdf") ? "pdf" : "mp4";

        if (presentation !== null && presentation !== "" && presentation !== undefined) {
            com.gsk.mt.debug("Going to slide " + presentation + "/" + slide, '#1c7fcb');
            document.location.href = "../../" + presentation + "/" + slide + "/" + type + "." + format;
        } else {
            com.gsk.mt.debug("Going to slide " + slide, '#1c7fcb');
            document.location.href = "../" + slide + "/" + type + "." + format;
        }
    },

    /**
     * Construct a url for gotoSlide
     * @param {string} slide
     * @param {string} [presentation]
     */
    buildUrl: function(slide, presentation) {
        var url = presentation ? "../../" + presentation + "/" : "../";
        return url + slide + "/index" + com.gsk.mt.extension;
    },

    /**
     * Return to the stored slide
     */
    closeSlide: function() {
		com.gsk.mt.blockLinks = false;
        var previousSlide = window.sessionStorage.getItem('mtgskPreviousSlide'),
            previousPres = window.sessionStorage.getItem('mtgskPreviousPres');
        com.gsk.mt.gotoSlide(previousSlide, previousPres);
    },

    /**
     * Process the gotoSlide call and pass relevant params to gotoSlide or in
     * the case of assets, gotoAsset
     * @param {Object} $element
     */
    processGotoSlide: function($element) {
        var slide = $element.attr("data-slide"),
            presentation = $element.attr("data-presentation");

        if ($element.attr("id") === "guide") {
            window.sessionStorage.setItem("mtgskLastSlide", com.gsk.mt.currentSlide);
        }

        if ($element.hasClass("logged")) {
            // Track a gotoSlide link
            com.gsk.mt.trackedLink = $element;
        }

        if (slide === "prev") {
            // Go to the previous slide
            com.gsk.mt.gotoPreviousSlide();
        } else if (slide === "next") {
            // Go to the next slide
            com.gsk.mt.gotoNextSlide();
        } else if ($element.attr("data-type") !== undefined && !com.gsk.mt.isVeeva) {
            // In order to enable offline transition to assets a function has
            // been created to handle this. This will only be invoked offline
            com.gsk.mt.gotoAsset($element.attr("data-type"), slide, presentation);
        } else if (slide !== undefined) {
            // A standard gotoSlide event
            com.gsk.mt.gotoSlide(slide, presentation);
        } else if (com.gsk.mtconfig[$element.attr("id")] !== undefined) {
            // Process nav button gotoSlide
            var refTargets = $("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			//popup level ref. start
			if (com.gsk.mtconfig.embedPopupReferences === true && refTargets.length > 0){
				window.sessionStorage.setItem("mtgskSlideReferences", null);
			}
			if (com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length > 0) {
				com.gsk.mt.activePopup = com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length - 1];			
				refTargets = $(com.gsk.mt.activePopup).find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");				
			}else if ( com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length == 0 ) {
				refTargets = $('#container').find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			}
			//popup level ref. End
            if ($element.attr("id") === "references" && refTargets.length > 0) {
                com.gsk.mt.slideRefTarget = com.gsk.mt.concatRefTargets(refTargets);
                window.sessionStorage.setItem("mtgskSlideRefTarget", JSON.stringify(com.gsk.mt.slideRefTarget));
                window.sessionStorage.setItem("mtgskReferenceSourceQuickLink", true);
            }

            slide = com.gsk.mtconfig[$element.attr("id")];
            presentation = com.gsk.mtconfig[$element.attr("id") + "Presentation"];

            com.gsk.mt.gotoSlide(slide, presentation);
        } else if ($element.attr("id") === "home") {
            // Process home button gotoSlide - uses values different from those found in the config file.
            com.gsk.mt.currentFlow = window.sessionStorage.getItem('mtgskCurrentFlow');

            if (com.gsk.mtconfig.homeResetsFlows) {
                window.sessionStorage.setItem('mtgskCurrentFlow', "Main");
                com.gsk.mt.currentFlow = "Main";
            }

            com.gsk.mt.gotoFlowHome();
        }
    },

    /**
     * Go to the homepage or the first slide in the flow if the homepage is not in the flow
     */
    gotoFlowHome: function() {
        var slide = com.gsk.mtconfig.pagesAll[com.gsk.mtconfig.flows[com.gsk.mt.currentFlow][0]];

        if (com.gsk.mt.currentFlow === "Main") {
            slide = com.gsk.mtconfig.homepage;
        }

        com.gsk.mt.gotoSlide(slide, com.gsk.mtconfig.presentation);
    },

    /**
     * Call gotoSlide using custom swipe
     * @param {Object[]} destinations
     * @param {string} direction
     */
    processCustomSwipe: function(destinations, direction) {
        if (destinations[direction + "Flow"] !== undefined) {
            if (com.gsk.mtconfig.flows[destinations[direction + "Flow"]] !== undefined) {
                window.sessionStorage.setItem('mtgskCurrentFlow', destinations[direction + "Flow"]);
            } else {
                com.gsk.mt.debug("Flow index (" + destinations[direction + "Flow"] + ") out of range", '#7f0000');
            }
        }
        com.gsk.mt.gotoSlide(destinations[direction + "Slide"], destinations[direction + "Pres"], true);
    },

    /**
     * Process the gotoRefs call and pass relevant params to gotoSlide if references
     * are not embedded or the references popup if they are
     * @param {Object} $element
     */
    processGotoRef: function($element) {
       var refs = $element.attr("data-reftarget"),
            refTargets = $("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			//popup level ref. start
			if ( com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length > 1 ) {
				com.gsk.mt.activePopup = com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length - 2];													
				refTargets = $(com.gsk.mt.activePopup).find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			}else if ( com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length == 1 ) {
				refTargets = $('#container').find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			}
			//popup level ref. End
        window.sessionStorage.setItem("mtgskReferenceSourceQuickLink", $element.attr("id") === "references");

        com.gsk.mt.currentRefs = null;

        if (refs === null || refs === undefined) {
            com.gsk.mt.slideRefTarget = null;
            refs = "PAGE";
            window.sessionStorage.removeItem("mtgskSlideRefTarget");
        } else if (refs !== "PAGE" && refs !== "ALL") {
            com.gsk.mt.slideRefTarget = {
                references: refs.split(","),
                indices   : com.gsk.mt.processCustomReferenceIndices($element.html().split(","))
            };
            refs = "REFTARGET";
            window.sessionStorage.setItem("mtgskSlideRefTarget", JSON.stringify(com.gsk.mt.slideRefTarget));
        } else if (refs === "PAGE" && refTargets.length > 0) {
            com.gsk.mt.slideRefTarget = com.gsk.mt.concatRefTargets(refTargets);
            window.sessionStorage.setItem("mtgskSlideRefTarget", JSON.stringify(com.gsk.mt.slideRefTarget));
        } else {
            com.gsk.mt.slideRefTarget = null;
            window.sessionStorage.setItem("mtgskSlideRefTarget", refs);
        }

        if (com.gsk.mtconfig.embedReferences) {
			//popup level-1 content (scrolling control) start			
			if(com.gsk.mt.swiperArray.length >0) {
				for(var ii = 0; com.gsk.mt.swiperArray.length >ii ; ii++) {
					com.gsk.mt.swiperArray[ii].lockSwipes();
				}
			}
			com.gsk.mt.doReferences(refs);
			//popup level-1 content (scrolling control) end
        } else {
			com.gsk.mt.blockLinks = false;	
            com.gsk.mt.gotoSlide(com.gsk.mtconfig.references, com.gsk.mtconfig.referencesPresentation);
        }
    },

    /**
     * DEPRECATED: Toggle portrait mode
     */
    resizePortrait: function() {
        com.gsk.mt.debug('DEPRECATED: com.gsk.mt.resizePortrait', '#ffaa10');

        var $doubleClickCentre = $("#doubleClickCentre");
        if ($doubleClickCentre.attr("data-toggle") !== "1") {
            $doubleClickCentre.attr("data-toggle", 1);
            setTimeout(function() {
                $doubleClickCentre.attr("data-toggle", 0);
            }, 1000);
            if (com.gsk.mt.dom.body.hasClass("portraitActive")) {
                com.gsk.mt.dom.body.removeClass("portraitActive");
            } else {
                com.gsk.mt.dom.body.addClass("portraitActive");
            }
        }
    },

    /**
     * Process the gotoFlow call and pass relevant params to processGotoSlide
     * @param {Object} $element
     */
    processGotoFlow: function($element) {
        var flows = com.gsk.mtconfig.flows,
            flow = $element.attr("data-flow");

        if (flows === undefined) {
            return;
        }

        if (flow !== undefined) {
            if (com.gsk.mtconfig.flows[flow] !== undefined) {
                com.gsk.mt.currentFlow = flow;

                window.sessionStorage.setItem('mtgskCurrentFlow', flow); 
				if(flow != Object.keys(com.gsk.mtconfig.flows)[0]){
					if(window.sessionStorage.getItem(window.sessionStorage.getItem('mtgskCurrentFlow')) != 'true'){
						window.sessionStorage.setItem(window.sessionStorage.getItem('mtgskCurrentFlow'), true);
						clickStreamArray = [
							{                    
								Track_Element_Type_vod__c: "Short Call",
								Selected_Items_vod__c: window.sessionStorage.getItem('mtgskCurrentFlow')
							}
						];
						com.gsk.mt.clickStreamSubmit(clickStreamArray);
					}
				}

                var slideIndex = com.gsk.mtconfig.flows[flow][0],
                    slide = com.gsk.mtconfig.pagesAll[slideIndex];

                if ($element.attr("data-slide") === undefined) {
                    $element.attr("data-slide", slide);
                }
                if ($element.attr("data-presentation") === undefined) {
                    $element.attr("data-presentation", com.gsk.mtconfig.presentation);
                }

                $element.addClass("gotoSlide");
                $("#flowSelector").addClass("hidden");
				setTimeout(function() {
                    com.gsk.mt.processGotoSlide($element);
                }, 250);
                
            } else {
                com.gsk.mt.debug("Flow index (" + flow + ") out of range", '#7f0000');
            }
        }
    },

    /**
     * Set up a quicklink dialog.
     * @param {string} quickLink - Menu|references|Pi
     */
    processQuickLinkDialog: function(quickLink) {
        $('[aria-describedby="quickLinkDialog"]').css({
            "top": (($('body').outerHeight() - com.gsk.mtconfig.quickLinkDialogHeight) * 0.5) + "px",
            "height": com.gsk.mtconfig.quickLinkDialogHeight + "px"
        });

        if (quickLink === "References") {
            $(".referenceSelector").removeClass("hidden").show();
        } else {
            $(".referenceSelector").hide();
        }

        $(".quickLinkDialogContent").addClass("hidden");
        var $dialog = $("#quickLinkDialog"),
            container = $(".quickLinkDialog" + quickLink),
            dialogBody = $dialog.find(".dialogBody");

        container.removeClass("hidden");

        if (quickLink === "Pi" && container.hasClass("framed")) {
            dialogBody.css("height", $dialog.css("height"));
        } else {
            dialogBody.css("height", "100%");
            dialogBody.css("min-height", $dialog.css("height"));
        }

        if (quickLink === "Menu") {
            com.gsk.mt.setQuickLinkContent(quickLink);
        } else {
            $(".menuTitle").hide();
        }

        if (quickLink === "Pi") {
            com.gsk.mt.setQuickLinkContent(quickLink);
            dialogBody.css("min-height", "");
			
        } else {
            $(".piTitle").hide();
        }

        if (quickLink === "Objection") {
            com.gsk.mt.setQuickLinkContent(quickLink);
            dialogBody.css("min-height", "");
        } else {
            $(".objectionTitle").hide();
        }

        if (quickLink === "References") {
            com.gsk.mt.destroyDialogIscroll($("#quickLinkDialog"));
            dialogBody.css("min-height", "");
        }

        if (quickLink === "Guide") {
            com.gsk.mt.setQuickLinkContent(quickLink);
        } else {
            $(".guideTitle").hide();
        }
		
		if (quickLink === "QuickRes") {
            com.gsk.mt.setQuickLinkContent(quickLink);
        } else {
            $(".quickresTitle").hide();
        }
    },

    /**
     * Activate a quick link in the quick link dialog.
     * @param {string} quickLink
     */
    setQuickLinkContent: function(quickLink) {
        com.gsk.mt.resetQuickLinkDialogHeight();

        com.gsk.mt.showQuickLinkTitle(quickLink);
        var bodyHeight = com.gsk.mt.setQuickLinkContentHeight(quickLink);

        if (quickLink !== "References") {
            var dialog = $("#quickLinkDialog"),
                data;
			
            dialog.find(".dialogBody").css("height", bodyHeight);

            com.gsk.mt.destroyDialogIscroll(dialog);
            com.gsk.mt.createDialogIscroll(dialog);

            data = dialog.data("gskmtIScroll");
            if (data) {
                $("#quickLinkDialog .iScrollVerticalScrollbar").css({
                    "margin-top": 50
                })[0].offsetTop = parseInt($("#quickLinkDialog" + quickLink).css("margin-top"));

                data.refresh();
            }
        }
    },

    /**
     * Hide all but the current quick link's title.
     * @param {string} quickLink
     */
    showQuickLinkTitle: function(quickLink) {
        var title = $("#quickLinkDialog ." + quickLink.toLowerCase() + "Title");

        $("#quickLinkDialog .pageTitle").css("display", "none");
        if (title.length) {
            title.css("display", "block");
        }
    },

    /**
     * Set the height of the quick link dialog to the default value (from com.gsk.mtConfig)
     */
    resetQuickLinkDialogHeight: function() {
        var dialog = $('[aria-describedby="quickLinkDialog"]');

        if (!com.gsk.mt.dialogHeight) {
            com.gsk.mt.dialogHeight = com.gsk.mtconfig.quickLinkDialogHeight * parseInt($('#container').height())/100;
        }

        com.gsk.mt.setQuickLinkDialogHeight(com.gsk.mt.dialogHeight);
    },

    /**
     * Get the current height of the quick link dialog .dialogBody
     * @returns {Number}
     */
    getQuickLinkDialogHeight: function() {
        return $('[aria-describedby="quickLinkDialog"] .dialogBody').innerHeight();
    },

    /**
     * Set the height of the quick link dialog and all containers within.
     * @param {Number} height
     */
    setQuickLinkDialogHeight: function(height) {
        if (!com.gsk.mtconfig.quickLinkAutoSize) {
            return;
        }

        var dialog = $('[aria-describedby="quickLinkDialog"]'),
            dialogInner = dialog.find(".dialog"),
            dialogInnerHeight,
            dialogBody = dialog.find(".dialogBody"),
            dialogBodyHeight,
            containerHeight = parseInt($('body').outerHeight());

        dialog.css({
            "top": (containerHeight * 0.5) - (height * 0.5),
            "height": height + 10
        });
		
        dialogInnerHeight = height - com.gsk.mt.getVerticalPadding(dialog);
        //dialogInner.css("height", dialogInnerHeight);
        dialogBodyHeight = dialogInnerHeight - com.gsk.mt.getVerticalPadding(dialogInner) - parseInt(dialogBody.css("top"));
        dialogBody.css("min-height", dialogBodyHeight);
    },

    /**
     * Calculate and return the total height of the quick link dialog based on the content height
     * @param {Number} elementHeight
     * @returns {Number}
     */
    getNewQuickLinkDialogHeight: function(elementHeight) {
        var dialog = $('[aria-describedby="quickLinkDialog"]'),
            dialogBody = dialog.find(".dialogBody"),
            difference = parseInt(dialog.css("height")) - dialogBody.innerHeight();

        return elementHeight + difference;
    },

    /**
     * Set and return the height of the current quick link dialog
     * @param {string} quickLink
     * @returns {Number}
     */
    setQuickLinkContentHeight: function(quickLink) {
		
        var titleHeight = com.gsk.mt.getQuickLinkTitleHeight(quickLink),
            contentHeight = com.gsk.mt.getQuickLinkContentHeight(quickLink),
            newDialogHeight = com.gsk.mt.getQuickLinkDialogHeight();

        if (contentHeight + titleHeight < com.gsk.mt.getQuickLinkDialogHeight()) {
			
            newDialogHeight = com.gsk.mt.getNewQuickLinkDialogHeight(contentHeight + titleHeight);
        }

        com.gsk.mt.setQuickLinkDialogHeight(newDialogHeight);

        return contentHeight + titleHeight;
    },

    /**
     * Get the height of the quick link dialog title element
     * @param {string} quickLink
     * @returns {Number}
     */
    getQuickLinkTitleHeight: function(quickLink) {
        if (quickLink === "References") {
            return $(".referenceSelector").outerHeight();
        }
        return $("." + quickLink.toLowerCase() + "Title").outerHeight();
    },

    /**
     * Get the height of the quick link dialog content element
     * @param {string} quickLink
     * @returns {Number}
     */
    getQuickLinkContentHeight: function(quickLink) {
        return $(".quickLinkDialog" + quickLink).outerHeight();
    },

    /**
     * Get the combined height of the elements vertical margins and padding
     * @param {jQuery} element
     * @returns {Number}
     */
    getVerticalMarginPadding: function(element) {
        return com.gsk.mt.getVerticalMargin(element) + com.gsk.mt.getVerticalPadding(element);
    },

    /**
     * Get the combined height of the elements vertical margins
     * @param {jQuery} element
     * @returns {Number}
     */
    getVerticalMargin: function(element) {
        return parseInt(element.css("margin-top")) + parseInt(element.css("margin-bottom"));
    },

    /**
     * Get the combined height of the elements vertical padding
     * @param {jQuery} element
     * @returns {Number}
     */
    getVerticalPadding: function(element) {
        return parseInt(element.css("padding-top")) + parseInt(element.css("padding-bottom"));
    },

    /* References */

    /**
     * Gets the references for the current slide in the presentation
     * @param {string} slide
     * @returns {Object} References
     */
    getReferencesForSlide: function(slide) {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(slide);
        return com.gsk.mtconfig.pageReferencesAll[slideIndex];
    },

    /**
     * Gets the footnotes for the current slide in the presentation
     * @param {string} slide
     * @returns {Object} References
     */
    getFootnotesForSlide: function(slide) {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(slide);
        return com.gsk.mtconfig.pageFootnotesAll[slideIndex];
    },

    /**
     * Process a custom reference target
     * @param {Array} referenceIndices
     * @returns {Array}
     */
    processCustomReferenceIndices: function(referenceIndices) {
        var indices = [];
        for (var ii = 0; ii < referenceIndices.length; ii++) {
            if (referenceIndices[ii].indexOf("-") > -1) {
                // Split reference range: "2-4" becomes "2,3,4"
                var range = referenceIndices[ii].split("-");
                if (range.length !== 2) {
                    com.gsk.mt.debug("Error processing custom reference target [" +
                        referenceIndices.join(",") + "]: Reference range [" +
                        referenceIndices[ii] + "] is invalid!", '#7f0000');
                } else {
                    for (var iii = parseInt(range[0]); iii <= parseInt(range[1]); iii++) {
                        indices.push(iii);
                    }
                }
            } else {
                indices.push(referenceIndices[ii]);
            }
        }

        return indices;
    },

    /**
     * Build the references page
     * @param {string} type 'page' or 'all'
     */
    doReferences: function(type) {
        var references = com.gsk.mt.slideReferences,
            footnotes = com.gsk.mt.slideFootnotes,
            refTargets = $("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])"),
            listItems,
            getRefs = true;			
			//popup level ref. start			
			if ( com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length > 1 ) {
				com.gsk.mt.activePopup = com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length - 2];													
				refTargets = $(com.gsk.mt.activePopup).find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			}else if ( com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length == 1 ) {
				refTargets = $('#container').find("[data-reftarget]:not([data-reftarget=PAGE],[data-reftarget=ALL])");
			}
			//popup level ref. End
        if (com.gsk.mt.currentRefs !== null &&
            ((com.gsk.mt.currentRefs === "ALL" && type === "ALL") ||
                (com.gsk.mt.currentRefs !== "ALL" && type !== "ALL"))) {
            getRefs = false;
        }

        if (getRefs) {						
            if (type === "REFTARGET") {
                listItems = com.gsk.mt.buildCustomReferences(com.gsk.mt.slideRefTarget);
            } else if (type === "PAGE" && refTargets.length > 0) {
                com.gsk.mt.slideRefTarget = com.gsk.mt.concatRefTargets(refTargets);
                listItems = com.gsk.mt.buildCustomReferences(com.gsk.mt.slideRefTarget);
            } else if (type === "PAGE" && com.gsk.mt.slideRefTarget !== null) {
                listItems = com.gsk.mt.buildCustomReferences(com.gsk.mt.slideRefTarget);
            } else if (type === "PAGE" && com.gsk.mtconfig.embedPopupReferences === true && com.gsk.mt.dialogStack.length > 1 ) {			
                listItems = com.gsk.mt.buildReferences(null, null, type);
            } else { // type === "ALL" || type === "PAGE" 
                if (type === "ALL") {
                    references = com.gsk.mtconfig.referencesAll;
                    footnotes = com.gsk.mtconfig.footnotesAll;
                }
                listItems = com.gsk.mt.buildReferences(references, footnotes, type);
            }

            com.gsk.mt.processReferencesList(listItems);

            com.gsk.mt.currentRefs = type;
        }

        com.gsk.mt.setReferencesActualHeight();
    },

    /**
     * Insert references and footnotes into their container elements
     * @param {string[]} listItems
     */
    processReferencesList: function(listItems) {
        $(".referenceSelector").css("display", "block");

        $(".embeddedReferences, .embeddedFootnotes, .referencesTitle, .footnotesTitle").css("display", "none");
        $("#referenceList, #footnotesList").html('');

        if (listItems.references.length > 0) {
            $(".embeddedReferences, .referencesTitle").css("display", "block");
            $("#referenceList").html(listItems.references.join(''));
        }

        if (listItems.footnotes.length > 0) {
            $(".embeddedFootnotes, .footnotesTitle").css("display", "block");
            $("#footnotesList").html(listItems.footnotes.join(''));
        }

    },

    /**
     * Set the height of the references scrollers
     */
    setReferencesActualHeight: function() {
        if (com.gsk.mtconfig.embedReferences && com.gsk.mtconfig.quickLinkAutoSize) {
            com.gsk.mt.resetQuickLinkDialogHeight();
            com.gsk.mt.setDialogScrollerHeight(com.gsk.mt.getReferencesMaxHeight());
            com.gsk.mt.setQuickLinkContent("References");
        } else {
            com.gsk.mt.setSlideScrollerHeight(com.gsk.mt.getReferencesMaxHeight());
        }
    },

    /**
     * Returns the maximum space available to populate with references and footnotes
     * @returns {number}
     */
    getReferencesMaxHeight: function() {
        var maxHeight = com.gsk.mt.dom.mainContent.innerHeight(),
            references = false,
            footnotes = false;

        if (com.gsk.mtconfig.embedReferences) {
            maxHeight = com.gsk.mt.getNewQuickLinkDialogHeight($(".embeddedQuickLink").innerHeight());
            maxHeight -= parseInt($(".quickLinkDialogReferences").css("margin-top"));
        }

        if (com.gsk.mt.getReferencesVisible('Reference')) {
            references = true;
            maxHeight -= com.gsk.mt.getReferencesHeaderHeight("Reference") * 2;
        }

        if (com.gsk.mt.getReferencesVisible('Footnotes')) {
            footnotes = true;
            maxHeight -= com.gsk.mt.getReferencesHeaderHeight("Footnotes");
        }

        if (references && footnotes) {
            maxHeight = Math.round(maxHeight / 2);
        }

        return maxHeight;
    },

    /**
     * Get the height of the references or footnotes header
     * @param {string} type - "Reference" | "Footnote"
     * @returns {Number}
     */
    getReferencesHeaderHeight: function(type) {
        var height = 0;

        if (!com.gsk.mt.getReferencesVisible(type)) {
            return height;
        }

        if (com.gsk.mtconfig.embedReferences) {
            if (type === "Reference") {
                type += "s";
            } else {
                height = 3;
            }
            return height + $(".embedded" + type + " h3").outerHeight();
        }
        return $("." + type.toLowerCase() + "Title").outerHeight();
    },

    /**
     * Return true if the references or footnotes are visible
     * @param type - "Reference" | "Footnote"
     * @returns {boolean}
     */
    getReferencesVisible: function(type) {
        if (com.gsk.mtconfig.embedReferences) {
            return $("#" + type.toLowerCase() + "List li").length > 0;
        }
        return ($("." + type.toLowerCase() + "Title").is("visible"));
    },

    /**
     * Set the scroller height for references and footnotes scrollers in the quick link dialog
     */
    setDialogScrollerHeight: function(maxHeight) {
        var referencesHeight = $('#referenceList').outerHeight(),
            footnotesHeight = $('#footnotesList').outerHeight(),
            referencesScroller = $("#referencesScroller"),
            referenceCount = $(".referenceActive").length,
            footnotesScroller = $("#footnotesScroller"),
            footnoteCount = $(".footnoteActive").length,
            footnotesVisible = com.gsk.mt.getReferencesVisible('Footnotes'),
            elementHeight = maxHeight,
            modifier = 0;

        if (footnotesVisible) {
            modifier = Math.round(parseInt($('.quickLinkDialogReferences').css('margin-bottom')) / 2);
        }

        if (com.gsk.mt.getReferencesVisible('Reference')) {
            if (referencesHeight < maxHeight) {
                elementHeight = referencesHeight;
            }
            $('#referencesScroller').css('height', (elementHeight - modifier) + 'px');
        }

        if (com.gsk.mt.getReferencesVisible('Footnotes')) {
            elementHeight = maxHeight;
            if (footnotesHeight < maxHeight) {
                elementHeight = footnotesHeight;
            }
            $('#footnotesScroller').css('height', (elementHeight - modifier) + 'px');
        }

        com.gsk.mt.setReferencesScrollers(referencesScroller, referenceCount, footnotesScroller, footnoteCount);
    },

    /**
     * Set the scroller height for references and footnotes scrollers in the references slide
     */
    setSlideScrollerHeight: function() {
        var referencesScroller = $("#referencesScroller"),
            referenceCount = $(".referenceActive").length,
            footnotesScroller = $("#footnotesScroller"),
            footnoteCount = $(".footnoteActive").length;

        com.gsk.mt.setReferencesScrollers(referencesScroller, referenceCount, footnotesScroller, footnoteCount);
    },

    /**
     * Initialise references and footnotes scrollers
     * @param {jQuery} referencesScroller
     * @param {Number} referenceCount
     * @param {jQuery} footnotesScroller
     * @param {Number} footnoteCount
     */
    setReferencesScrollers: function(referencesScroller, referenceCount, footnotesScroller, footnoteCount) {
        if (referenceCount) {
            com.gsk.mt.initScroller(referencesScroller);
        }

        if (footnoteCount) {
            com.gsk.mt.initScroller(footnotesScroller);
        }
    },

    /**
     * Concatenate all custom references on the slide.
     * @param {Object} refTargets
     * @returns {{references: Array, indices: Array}}
     */
    concatRefTargets: function(refTargets) {
        var refBuffer = [],
            buffer = [],
            slideRefTarget = {
                references: [],
                indices: []
            };

        $.each(refTargets, function() {
            var references = $(this).attr("data-reftarget").split(","),
                indices = $(this).html().split(",");

            indices = com.gsk.mt.processCustomReferenceIndices(indices);

            for (var ii = 0; ii < references.length; ii++) {
                if (refBuffer.indexOf(references[ii]) === -1) {
                    buffer.push({
                        reference: references[ii],
                        index: indices[ii]
                    });
                    refBuffer.push(references[ii]);
                }
            }
        });

        buffer.sort(function(a, b) {
            if (("" + a.reference).indexOf("foot_") > -1) {
                return 1;
            }
            if (("" + b.reference).indexOf("foot_") > -1) {
                return -1;
            }

            var aIndex = parseInt(a.index),
                bIndex = parseInt(b.index);
            return ((aIndex < bIndex) ? -1 : ((aIndex === bIndex) ? 0 : 1));
        });

        for (var ii = 0; ii < buffer.length; ii++) {
            slideRefTarget.references.push(buffer[ii].reference);
            slideRefTarget.indices.push(buffer[ii].index);
        }

        return slideRefTarget;
    },

    /**
     * Build custom references
     * @param {Object} refTarget
     */
    buildCustomReferences: function(refTarget) {
        var $referenceList = $("#referenceList"),
            $footnotesList = $("#footnotesList"),
            refObject = { references: [], footnotes: [] };

        $referenceList.empty().removeClass("unindexed");
        $footnotesList.empty();

        if (refTarget.references.length !== refTarget.indices.length) {
            com.gsk.mt.debug("Error building custom reference target: references = [" +
                refTarget.references.join(",") + "], indices = [" + refTarget.indices.join(",") +
                "] - reference and indices are not equal sizes! Check values of reference ranges (eg. 2-4)", '#7f0000');
            return;
        }

        for (var ii = 0; ii < refTarget.references.length; ii++) {
            if (refTarget.references[ii].indexOf("foot_") > -1) {
                var footnote = parseInt(refTarget.references[ii].substring(5));
                refObject.footnotes.push('<li class="footnoteActive">' + com.gsk.mtconfig.footnotesAll[footnote - 1] + '</li>');
            } else {
                var reference = parseInt(refTarget.references[ii]);
                refObject.references.push('<li class="referenceActive hasRefIndex"><span class="refIndex">' +
                    refTarget.indices[ii] + '.</span>' + com.gsk.mtconfig.referencesAll[reference - 1] + '</li>');
            }
        }

        return refObject;
    },

    /**
     * Build the references page
     * @param {Array} references
     * @param {Array} footnotes
     * @param {string} type
     */
    buildReferences: function(references, footnotes, type) {
        type = type || "PAGE";

        var $referenceList = $("#referenceList"),
            $footnotesList = $("#footnotesList"),
            $footnotesContainer = $(".footnotes"),
            refObject = { references: [], footnotes: [] };

        $referenceList.empty();
        $footnotesList.empty();

        if (type === "ALL") {
            $referenceList.addClass("unindexed");
        } else {
            $referenceList.removeClass("unindexed");
        }

        if (references === null || references === undefined) {
            for(ii = 0; ii < com.gsk.mtconfig.referencesAll.length; ii++) {
                refObject.references.push('<li class="referenceInactive">' +
                    com.gsk.mtconfig.referencesAll[ii] + '</li>');
            }
        } else {
            for(var ii = 0; ii < com.gsk.mtconfig.referencesAll.length; ii++) {
                if ($.inArray(ii + 1, references) !== -1 || type === 'ALL')
                {
                    refObject.references.push('<li class="referenceActive">' +
                        com.gsk.mtconfig.referencesAll[ii] + '</li>');
                } else if ($.inArray(ii + 1, references) === -1) {
                    refObject.references.push('<li class="referenceInactive">' +
                        com.gsk.mtconfig.referencesAll[ii] + '</li>');
                } else {
                    refObject.references.push('<li class="referenceActive">' +
                        com.gsk.mtconfig.referencesAll[ii] + '</li>');
                }
            }
        }

        $footnotesContainer.removeClass("footnotesEmpty");

        if ((footnotes === null || footnotes === undefined || footnotes.length < 1) && type !== "ALL") {
            $footnotesContainer.addClass("footnotesEmpty");
        } else {
            for(var ii = 0; ii < com.gsk.mtconfig.footnotesAll.length; ii++) {
                if ($.inArray(ii + 1, footnotes) !== -1 || type === "ALL") {
                    refObject.footnotes.push('<li class="footnoteActive">' +
                        com.gsk.mtconfig.footnotesAll[ii] + '</li>');
                }
            }
        }

        return refObject;
    },

    /* RWops */

    /**
     * Get the account ID
     */
    getAccountIdForFeedback: function() {
        var accountId = window.sessionStorage.getItem("mtgskAccountId");

        if (accountId !== null) {
            com.gsk.mt.accountId = accountId;
            com.gsk.mt.getPresentationIdForFeedback();
            return;
        }

        com.veeva.clm.getDataForCurrentObject("Account", "Id", function(result) {
            if (result.success) {
                com.gsk.mt.accountId = result.Account.Id;
                window.sessionStorage.setItem("mtgskAccountId", com.gsk.mt.accountId);
                com.gsk.mt.getPresentationIdForFeedback();
            }
        });
    },

    /**
     * Get the presentation ID
     */
    getPresentationIdForFeedback: function() {
        var presentationId = window.sessionStorage.getItem("mtgskPresentationId");

        if (presentationId !== null) {
            com.gsk.mt.presentationId = presentationId;
            com.gsk.mt.getCalls();
            return;
        }

        com.veeva.clm.getDataForCurrentObject("Presentation", "Presentation_Id_vod__c", function(result) {
            if (result.success) {
                com.gsk.mt.presentationId = result.Presentation.Presentation_Id_vod__c;
                window.sessionStorage.setItem("mtgskPresentationId", com.gsk.mt.presentationId);
                com.gsk.mt.getCalls();
            }
        });
    },

    /**
     * Get the 10 most recent calls for the current account
     */
    getCalls: function() {
        com.veeva.clm.queryRecord(
            "Call2_vod__c",
            "Name,Account_vod__c,Id,Call_Datetime_vod__c",
            "WHERE Account_vod__c='" + com.gsk.mt.accountId + "'",
            ["Call_Datetime_vod__c, DESC"],
            10,
            com.gsk.mt.saveCalls
        );
    },

    /**
     * Save the most recent calls for the current account into com.gsk.mt.calls
     * @param {Object} result
     */
    saveCalls: function(result) {
        if (result.success) {
            com.gsk.mt.calls = result.Call2_vod__c;
            com.gsk.mt.queryClickstreams();
        }
    },

    /**
     * Find clickstreams for a specific call and presentation.
     */
    queryClickstreams: function() {
        if (com.gsk.mt.calls.length > 0) {
            var call = com.gsk.mt.calls.shift();

            com.veeva.clm.queryRecord(
                "Call_Clickstream_vod__c",
                "Name,Call_vod__c,Presentation_ID_vod__c,Question_vod__c,Answer_vod__c,Track_Element_Id_vod__c,Track_Element_Description_vod__c,Track_Element_Type_vod__c",
                "WHERE Presentation_ID_vod__c='" + com.gsk.mt.presentationId + "' AND Call_vod__c='" + call.Id + "'",
                [ "Name, DESC" ],
                100,
                com.gsk.mt.getClickstreamsForCalls
            );
        }
    },

    /**
     * Check whether the call has clickstreams
     * @param {Object} result
     */
    getClickstreamsForCalls: function(result) {
        if (result.success && result.Call_Clickstream_vod__c.length > 0) {
            com.gsk.mt.beginFeedbackQueue(result);
        } else {
            com.gsk.mt.queryClickstreams();
        }
    },

    /**
     * Iterate through clickstreams
     * @param {Object} result
     */
    beginFeedbackQueue: function(result) {
        for (var ii = 0; ii < com.gsk.mt.cstreamStack.length; ii++) {
            com.gsk.mt.setFeedbackElement(com.gsk.mt.cstreamStack[ii], result);
        }
    },

    /**
     * Check whether clickstream value applies to an element on the current slide
     * @param {Object} $element
     * @param {Object} result
     */
    setFeedbackElement: function($element, result) {
        var elementId = $element.attr("id");

        for (var ii = 0; ii < result.Call_Clickstream_vod__c.length; ii++) {
            if (result.Call_Clickstream_vod__c[ii].Track_Element_Id_vod__c === elementId) {
                com.gsk.mt.setFeedbackElementValue($element, result.Call_Clickstream_vod__c[ii].Answer_vod__c);
                return;
            }
        }
    },

    /**
     * Set the specified element's value to the clickstream value
     * @param {Object} $element
     * @param {string} value
     */
    setFeedbackElementValue: function($element, value) {
        if ($element.is("[type=checkbox]") || $element.is("[type=radio]")) {
            if (value === "true") {
                $element.prop("checked", true);
            } else {
                $element.prop("checked", false);
            }
        } else if ($element.hasClass("slider")) {
            $element.slider("value", parseInt(value));
        } else {
            $element.val(value);
        }
        window.sessionStorage.setItem("mtgskFeedback" + $element.attr("id"), value);
    },

    /**
     * Gets data from the specified field and inserts the result into the
     * specified container
     * @param {string} object
     * @param {string} field
     * @param {string} fallback Fallback text to insert on desktop or failure
     * @param {string} container
     * @param {callback} [callback] Optional callback passed to getDataForCurrentObject
     *                              This will overwrite the current functionality
     */
    readField: function(object, field, fallback, container, callback) {
        var $container = $(container);
        callback = callback || function(result) {
            if (result[object] !== undefined &&
                result[object][field] !== undefined)
            {
                $container.html(result[object][field]);
            } else {
                $container.html(fallback);
            }
        };

        if (com.gsk.mt.isVeeva) {
            com.veeva.clm.getDataForCurrentObject(object, field, callback);
        } else {
            $container.html(fallback);
        }
    },

    /**
     * Writes data to Account.ID
     * @param {string} object
     * @param {Object} clickStream
     * @param {callback} [callback] Optional callback passed to getDataForCurrentObject
     */
    writeToAccountId: function(object, clickStream, callback) {
        callback = callback || function() { return 0; };
        com.gsk.mt.debug(object + ".ID - " + JSON.stringify(clickStream), '#1c7fcb');
        if (com.gsk.mt.isVeeva) {
            com.veeva.clm.getDataForCurrentObject(object, "ID", function(result) {
                com.veeva.clm.updateRecord(object, result[object]["ID"], clickStream, callback);
            });
        }
    },

    /**
     * If in the Veeva environment, write to the backend
     * @param {string} object
     * @param {Object} clickStream
     * @param {callback} [callback]
     */
    createRecord: function(object, clickStream, callback) {
        if (com.gsk.mt.isVeeva) {
            com.veeva.clm.createRecord(object, clickStream, callback);
        }
    },

    /**
     * Track a quick link dialog
     * @param {Object} $element
     */
    trackQuickLink: function($element) {
        var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            clickStreamArray = [
                {
                    Track_Element_Id_vod__c: com.gsk.mtconfig.pagesTitles[slideIndex],
                    Track_Element_Type_vod__c: "Popup",
                    Track_Element_Description_vod__c: $element.attr("data-description")
                }
            ];       
        com.gsk.mt.clickStreamSubmit(clickStreamArray);

        $element.addClass("trackingSubmitted");
        if ($element.hasClass("gotoRef")) {
            $(".gotoRef").addClass("trackingSubmitted");
        }
    },

    /**
     * Write clickstream values
     * @param {Object} $element
     * @param {string} answer
     * @param {callback} [callback] Optional callback passed to createRecord
     */
    trackField: function($element, answer, callback) {
        if ($element.attr("data-onetime") === "1") {
            $element[0].disabled = true;
            $element.attr("data-clicked", 1);
            window.sessionStorage.setItem($element.attr('id'), true);
        }
        callback = callback || function() { return 0; };
        var clickStream = com.gsk.mt.buildClickStream($element, answer);

        com.gsk.mt.debug(JSON.stringify(clickStream), '#1c7fcb');
        com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStream, callback);
    },

    /**
     * Submit an individual form field
     */
    formSubmitAccount: function() {
        $.each($(".logAccountField"), function() {
            var $this = $(this),
                type = $this.attr('type'),
                object = $this.attr("data-object"),
                answer,
                clickStream;

            if ($this.hasClass('slider')) {
                answer = $this.slider("value");
            } else {
                answer = $this.val();
                if (type === 'text') {
                    $this.val("");
                }
            }

            clickStream = com.gsk.mt.buildClickStream($this, answer);
            if (clickStream !== null) {
                com.gsk.mt.writeToAccountId(object, clickStream);
            }
        });
    },

    /**
     * Restore form field to stored value
     * @param {Object} $element
     */
    restoreField: function($element){
        var type = $element.attr('type'),
            value = window.sessionStorage.getItem($element.attr('id'));

        if (type === 'checkbox' && value === 'checked') {
            $element.prop('checked', true);
        } else if (type === 'radio' && value === 'true') {
            $element.prop('checked', true);
        } else if (type === 'text') {
            $element.val(value);
        } else if ($element.hasClass('slider')) {
            $element.slider("value", value);
        } else if ($element.prop("tagName").toLowerCase() === "select") {
            $element[0].selectedIndex = value;
        }
    },

    /**
     * Restore form to stored state
     */
    retrieveFields: function() {
        $.each($('.logFormField'), function() {
            com.gsk.mt.restoreField($(this));
        });
    },

    /**
     * Store a form field's value
     * @param {string} type
     * @param {Object} $element
     */
    storeField: function(type, $element) {
        if (type === 'checkbox' && $element.prop('checked')) {
            window.sessionStorage.setItem($element.attr('id'), 'checked');
        } else if (type === 'radio') {
            window.sessionStorage.setItem($element.attr('id'),
                $element.is(":checked"));
        } else if (type === 'text') {
            window.sessionStorage.setItem($element.attr('id'),
                $element.val());
        } else if ($element.hasClass('slider')) {
            window.sessionStorage.setItem($element.attr('id'),
                $element.slider("value"));
        } else if (String($element.prop("tagName")).toLowerCase() === "select") {
            window.sessionStorage.setItem($element.attr('id'),
                $element[0].selectedIndex);
        }
    },

    /**
     * Builds a clickstream object for getElementData
     * @param {Object} $element
     * @param {string} answer
     * @returns {Object} Clickstream object
     */
    buildClickStream: function($element, answer) {
        var clickStream = {},
            fields = ($element.attr("data-fields")).split("|"),
            values = ($element.attr("data-description")).split("|"),
            startTime = com.gsk.mt.lastStartTime;

        com.gsk.mt.lastStartTime = null;

        if (fields.length === 0) {
            com.gsk.mt.debug("Error: No fields specified.", "#7f0000");
            return null;
        } else if (fields.length !== values.length) {
            com.gsk.mt.debug("Error: Number of fields not equal to descriptions.", "#7f0000");
            return null;
        }

        for (var ii = 0; ii < fields.length; ii++) {
            // Convert friendly field name to api field if necessary
            var field = fields[ii];
            if (field.indexOf("_vod__c") === -1) {
                field = com.gsk.mt.apiFields[field];
            }

            if (field !== undefined) {
                if (values[ii] === "[data]") {
                    clickStream[field] = answer;
                } else if (values[ii] === "[start]") {
                    if (startTime !== null) {
                        clickStream[field] = startTime;
                    } else {
                        clickStream[field] = new Date();
                    }
                } else {
                    clickStream[field] = values[ii];
                }
            } else {
                com.gsk.mt.debug("Error: field [" + fields[ii] + "] not found!", "#7f0000");
            }
        }
        return clickStream;
    },

    /**
     * Get value of an element and store in a clickStream object
     * @param {string} type
     * @param {Object} $element
     * @returns {Object} Clickstream object
     */
    getElementData: function(type, $element) {
        if (type === 'checkbox' && $element.prop('checked')) {
            return com.gsk.mt.buildClickStream($element, "");
        } else if (type === 'text' || String($element.prop("tagName")).toLowerCase() === "select" || (type === 'radio' && $element.prop("checked"))) {
            return com.gsk.mt.buildClickStream($element, $element.val());
        } else if ($element.hasClass('slider')) {
            return com.gsk.mt.buildClickStream($element, "" + $element.slider("value"));
        }
    },

    /**
     * Store the values of a form
     * @param {Object} $element Form button
     */
    formSubmit: function($element) {
        var clickStreamContainer = [],
            loopCounter = 0,
            onCompleteCallback = $element.attr("data-callback-name") || "none";

        $element[0].disabled = true;
        $element.attr("data-clicked", 1);

        $.each($('.logFormField'), function() {
            var $this = $(this),
                type = $this.attr('type');
            com.gsk.mt.storeField(type, $this);
            var clickStream = com.gsk.mt.getElementData(type, $this);
            if (clickStream !== null && !$.isEmptyObject(clickStream)) {
                clickStreamContainer.push(clickStream);
            }
        });
        if (clickStreamContainer.length) {
            var index = 0;
            if (com.gsk.mt.isVeeva) {
                var callback = function() {
                    if (clickStreamContainer.length > index && loopCounter < com.gsk.mt.maxIterations) {
                        index++;
                        com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStreamContainer[index], callback);
                    } else {
                        if ($element.attr("data-onetime") !== "1") {
                            $element[0].disabled = false;
                            $element.attr("data-clicked", 0);
                        } else {
                            window.sessionStorage.setItem($element.attr('id'), true);
                        }

                        // Check for and invoke custom callback once clickstreams have been written
                        if (com.gsk.mt[onCompleteCallback] !== undefined &&
                            Object.prototype.toString.call(com.gsk.mt[onCompleteCallback]) === '[object Function]')
                        {
                            com.gsk.mt[onCompleteCallback]();
                        }
                    }
                };
                com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStreamContainer[0], callback);
            } else {
                while (clickStreamContainer.length > index && loopCounter < com.gsk.mt.maxIterations) {
                    com.gsk.mt.debug(JSON.stringify(clickStreamContainer[index]), "#1c7fcb");
                    index++;
                    loopCounter++;
                }
                if ($element.attr("data-onetime") !== "1") {
                    $element[0].disabled = false;
                    $element.attr("data-clicked", 0);
                } else {
                    window.sessionStorage.setItem($element.attr('id'), true);
                }

                // Check for and invoke custom callback once clickstreams have been written
                if (com.gsk.mt[onCompleteCallback] !== undefined &&
                    Object.prototype.toString.call(com.gsk.mt[onCompleteCallback]) === '[object Function]')
                {
                    com.gsk.mt[onCompleteCallback]();
                }
            }
        }
    },

    /**
     * Store the values of a form
     * @param {Array} clickStreamContainer Array of clickstream data
     * @param {callback} [onCompleteCallback] Optional callback to be invoked on completion
     */
    clickStreamSubmit: function(clickStreamContainer, onCompleteCallback) {
        var loopCounter = 0;
        com.gsk.mt.clickStreamSubmitCallback = onCompleteCallback;

        if (clickStreamContainer.length) {
            var index = 0;
            if (com.gsk.mt.isVeeva) {
                var callback = function() {
                    if (clickStreamContainer.length > index && loopCounter < com.gsk.mt.maxIterations) {
                        index++;
                        com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStreamContainer[index], callback);
                    } else {
                        // Check for and invoke custom callback once clickstreams have been written
                        if (com.gsk.mt.clickStreamSubmitCallback !== undefined &&
                            Object.prototype.toString.call(com.gsk.mt.clickStreamSubmitCallback) === '[object Function]')
                        {
                            com.gsk.mt.clickStreamSubmitCallback();
                        }
                    }
                };
                com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStreamContainer[0], callback);
            } else {
                while (clickStreamContainer.length > index && loopCounter < com.gsk.mt.maxIterations) {
                    com.gsk.mt.debug(JSON.stringify(clickStreamContainer[index]), "#1c7fcb");
                    index++;
                    loopCounter++;
                }

                // Check for and invoke custom callback once clickstreams have been written
                if (com.gsk.mt.clickStreamSubmitCallback !== undefined &&
                    Object.prototype.toString.call(com.gsk.mt.clickStreamSubmitCallback) === '[object Function]')
                {
                    com.gsk.mt.clickStreamSubmitCallback();
                }
            }
        }
    },
	
	//Retreiving TableData as a string and sending to custom object for storing
	tableSubmit: function(elem){
			var bodyRowCollection = [];
			var headRowCollection = [];
			var tableRowLnth = $('#tblData tbody tr').length;
			var tableClmnLnth = $('#tblData tbody tr:eq(0) td').length;
			$("#tblData tbody tr").addClass("rowBg");
			for (var i = 0; i <= tableRowLnth; i++) {
				bodyRowCollection.push({
					valu: $('#tblData tbody tr:nth-child(' + i + ')')
				});
				headRowCollection.push({
					valu: $('#tblData thead tr')
				});
				bodyRowCollection[i].td = [];
				headRowCollection[0].th = [];
				for (var j = 0; j <= tableClmnLnth; j++) {
					//tbody start here
					bodyRowCollection[i].td.push(bodyRowCollection[i].valu.children('td:nth-child(' + j + ')'));
					bodyRowCollection[i].valu.children('td:nth-child(' + j + ')').html(bodyRowCollection[i].valu.children('td:nth-child(' + j + ')').children("input[type=text]").val());
					
					//thead start here
					headRowCollection[0].th.push(headRowCollection[0].valu.children('th:nth-child(' + j + ')'));
					headRowCollection[0].valu.children('th:nth-child(' + j + ')').html(headRowCollection[0].valu.children('th:nth-child(' + j + ')').children("input[type=text]").val());
				}
			}
					
			$("#addRow,#loggedTable").addClass("disableBtn");
 			com.gsk.mt.saveContentRecord($(elem).html())
	},
	
   // Saving data into custom Object 
	saveContentRecord:function(data){
			var account_id = "";
			var object = "Account";
			if (com.gsk.mt.isVeeva) {
				com.veeva.clm.getDataForCurrentObject(object, "ID", function(result) {
					if(result[object]["ID"]){
					   account_id = result[object]["ID"];
						 var fields = ["CORE_GSK_Content_Data_ID__c", "CORE_GSK_Content_Data_ID__c", "ID"];
					     var whereClause = "Account__c='" + account_id + "' AND CORE_GSK_Content_Data_ID__c ='" + com.gsk.mt.currentSlide + "'";
					     com.veeva.clm.queryRecord("CORE_GSK_Content_Data__c", fields, whereClause, null, null, contentData_create);
					 }
					 else
					   alert("SELECT ACCOUNT");
					 
				});
			}
		
			function contentData_create(result) {
				var object = "CORE_GSK_Content_Data__c";
				if (result.record_count == 0 ) {
					var clickStream = {
						"CORE_GSK_Content_Data_ID__c": com.gsk.mt.currentSlide,
						"CORE_GSK_Content_Data_Value__c": data,
						"Account__c": account_id
					};
					com.gsk.mt.createRecord("CORE_GSK_Content_Data__c", clickStream, function(results) {
						alert('Record Created');
						$('#email').trigger(com.gsk.mt.releaseEvent);
					});
				} else {
					console.log(result[object][0]['ID'])
					var clickStream = {
						"CORE_GSK_Content_Data_Value__c": data
					};
					com.veeva.clm.updateRecord("CORE_GSK_Content_Data__c", result[object][0]["ID"], clickStream, function(result) {
					   console.log(result);
					   alert('Record Updated');
					   $('#email').trigger(com.gsk.mt.releaseEvent);
					});
				}
			}
		
		
	},

    /* Email */

    /**
     * Select or deselect a fragment
     * @param {Object} $element
     */
    toggleFragment: function($element) {
        var fragment = parseInt($element.attr("data-id")),
            fragmentSelectedLength = $(".gskFragmentSelected").length;

        if ($element.hasClass("gskFragmentSelected")) {
            com.gsk.mt.removeFragment(fragment);
            $element.removeClass("gskFragmentSelected");
            fragmentSelectedLength--;
            if (fragmentSelectedLength < 1) {
                com.gsk.mt.dom.email.removeClass("active");
            }
        } else {
            com.gsk.mt.addFragment(fragment);
            $element.addClass("gskFragmentSelected");
            com.gsk.mt.dom.email.addClass("active");
            fragmentSelectedLength++;
        }

        // Selector count - the number on the email button showing the
        // number of fragments, applicable to that slide, that have been
        // selected
        var $selectorCount = $('.selectorCount');

        if (fragmentSelectedLength > 0) {
            $selectorCount.removeClass("hidden").html(fragmentSelectedLength);
        } else {
            $selectorCount.addClass("hidden");
        }
    },

    /**
     * Launch Approved Email
     * @param {Event} event
     */
    sendEmail: function(event) {
        var $element = $(event.target),
            templateId;

        if (com.gsk.mt.dom.email.attr("data-sent") !== "1") {
            templateId = parseInt($element.attr('data-id'));
			//tracking email template start
			var index = com.gsk.mtconfig.templates.map(function(o) { return o.id; }).indexOf(templateId);
			var slideIndex = com.gsk.mtconfig.pagesAll.indexOf(com.gsk.mt.currentSlide),
            clickStreamArray = [
                {
                    Track_Element_Id_vod__c: com.gsk.mtconfig.pagesTitles[slideIndex],
                    Track_Element_Type_vod__c: "Email Template",
                    Track_Element_Description_vod__c: com.gsk.mtconfig.templates[index].label
                }
            ];       
        	com.gsk.mt.clickStreamSubmit(clickStreamArray);
			setTimeout(function() {
                com.gsk.mt.launchEmail(templateId);
            }, 300);
            

            // Stop unintended multiple clicks/taps from triggering send
            com.gsk.mt.dom.email.attr("data-sent", 1);
            // Timeout clears the send blocker
            setTimeout(function() {
                com.gsk.mt.dom.email.attr("data-sent", 0);
            }, 5000);
        }
    },

    /**
     * Retrieve email fragment IDs from session storage and store them in
     * com.gsk.mt.emailFragments
     */
    getSavedFragments: function() {
        var fragments = window.sessionStorage.getItem('mtgskEmailFragments');
        com.gsk.mt.emailFragments = [];

        if (fragments) {
            com.gsk.mt.emailFragments = JSON.parse(fragments);
            com.gsk.mt.emailFragments.sort();
        }
    },

    /**
     * Add a fragment to the email fragments list if it does not exist
     * @param {number} fragmentId
     */
    addFragment: function(fragmentId) {
        if (com.gsk.mt.emailFragments.indexOf(fragmentId) === -1) {
            com.gsk.mt.emailFragments.push(fragmentId);
            com.gsk.mt.emailFragments.sort();
            var fragments = JSON.stringify(com.gsk.mt.emailFragments);
            window.sessionStorage.setItem('mtgskEmailFragments', fragments);
        }
        com.gsk.mt.debug("Email fragments: " + com.gsk.mt.emailFragments + " stored", "#1c7fcb");
    },

    /**
     * Remove a fragment from the email fragments list if it exists
     * @param {number} fragmentId
     */
    removeFragment: function(fragmentId) {
        var fragmentIndex = com.gsk.mt.emailFragments.indexOf(fragmentId);
        if (fragmentIndex !== -1) {
            com.gsk.mt.emailFragments.splice(fragmentIndex, 1);
            com.gsk.mt.emailFragments.sort();
            var fragments = JSON.stringify(com.gsk.mt.emailFragments);
            window.sessionStorage.setItem('mtgskEmailFragments', fragments);
        }
        com.gsk.mt.debug("Email fragments: " + com.gsk.mt.emailFragments + " removed", "#1c7fcb");
    },

    /**
     * Pass along the stored fragments and launch approved email
     * @param {Number} templateId
     */
    launchEmail: function(templateId) {
        var loopIndex = -1,
            templateDocumentId = -1,
            fragmentTemplateIds = [],
            debugMessage;

        if (!com.gsk.mt.isVeeva) {
            debugMessage = "Send email template " + templateId;

            if (com.gsk.mt.emailFragments.length) {
                debugMessage += " with selected fragments " + com.gsk.mt.emailFragments + ".";
            } else {
                debugMessage += " with no selected fragments.";
            }

            com.gsk.mt.debug(debugMessage, "#1c7fcb");
            return;
        }

        var callback = function(result) {
            loopIndex++;
            if (result.success) {
                if (loopIndex === 0) {
                    // First loop
                    templateDocumentId = result.Approved_Document_vod__c.ID;
                    if (com.gsk.mt.emailFragments.length === 0) {
                        // No email fragments
                        com.veeva.clm.launchApprovedEmail(templateDocumentId, fragmentTemplateIds, function() { return 0; });
                    } else {
                        com.veeva.clm.getApprovedDocument(com.gsk.mtconfig.vaultID, com.gsk.mt.emailFragments[loopIndex], callback);
                    }
                } else if (loopIndex === com.gsk.mt.emailFragments.length) {
                    // Final loop
                    fragmentTemplateIds.push(result.Approved_Document_vod__c.ID);
                    com.veeva.clm.launchApprovedEmail(templateDocumentId, fragmentTemplateIds, function() { return 0; });
                } else {
                    fragmentTemplateIds.push(result.Approved_Document_vod__c.ID);
                    com.veeva.clm.getApprovedDocument(com.gsk.mtconfig.vaultID, com.gsk.mt.emailFragments[loopIndex], callback);
                }
            }
        };
        com.veeva.clm.getApprovedDocument(com.gsk.mtconfig.vaultID, templateId, callback);
    },

    /**
     * Insert email selector and options into the slide
     * @param {boolean} sendEmail
     * @returns {jQuery} the active container
     */
    insertEmailSelector: function(sendEmail) {
        var fragmentSelector = com.gsk.mt.getEmailSelectorContainer(),
            content = com.gsk.mt.getEmailSelectorContent(sendEmail),
            itemsHTML = '',
            insertedItems = [],
            length = content.length,
            item, itemClass;

        for (var i = 0; i < length; i++) {
            item = content[i];

            // Prevent duplicate entries
            if (insertedItems.indexOf(item.id) > -1) {
                continue;
            }

            insertedItems.push(item.id);
            itemClass = com.gsk.mt.getEmailSelectorItemClass(item, sendEmail);
            itemsHTML += '<div class="' + itemClass + '" data-id="' + item.id + '">' + item.label + '</div>';
        }

        fragmentSelector.find("#fragmentSelectorInner").prepend(itemsHTML);

        return fragmentSelector;
    },

    /**
     * Handle any preparation and return a reference to the selector container element
     * Will insert the fragment selector container if not using a custom fragment selector
     * @returns {jQuery}
     */
    getEmailSelectorContainer: function() {
        if (com.gsk.mtconfig.customFragmentSelector) {
            return $(com.gsk.mtconfig.customFragmentSelectorContainer);
        }

        var selectorHTML = '<div id="fragmentSelector" class="hidden"><div id="fragmentSelectorInner">' +
            '<div id="closeSelector"></div></div><div class="selectorTriangle"></div></div>';

        com.gsk.mt.dom.container.append(selectorHTML);
        return $("#fragmentSelector");
    },

    /**
     * Return the array of fragment objects for the current slide or email template objects if sendEmail is true
     * @param {boolean} sendEmail
     * @returns {{label,id}[]}
     */
    getEmailSelectorContent: function(sendEmail) {
        if (sendEmail) {
            return com.gsk.mtconfig.templates || [];
        }

        var slideFragments = com.gsk.mtconfig.pagesEmail[com.gsk.mt.currentSlide],
            fragments = [];

        for (var i = 0; i < slideFragments.length; i++) {
            fragments.push(com.gsk.mtconfig.fragments[slideFragments[i]]);
        }

        return fragments;
    },

    /**
     * Return the class(es) for the specified item
     * If sendEmail is true this will only ever return the string "fragmentOption"
     * @param {{label,id}} item
     * @param {boolean} sendEmail
     * @returns {string}
     */
    getEmailSelectorItemClass: function(item, sendEmail) {
        if (sendEmail || com.gsk.mt.emailFragments.indexOf(item.id) < 0) {
            return "fragmentOption";
        }

        return "gskFragmentSelected fragmentOption";
    },

    /**
     * Count the number of selected fragments on this slide and populate the
     * fragment count
     */
    fragmentCount: function() {
        com.gsk.mt.dom.email.html('<div class="selectorCount"></div>');
        com.gsk.mt.dom.email.removeClass("inactive");

        var length = $(".gskFragmentSelected").length,
            $selectorCount = $(".selectorCount");

        $selectorCount.html(length);
        if (length > 0) {
            $selectorCount.removeClass("hidden");
            com.gsk.mt.dom.email.addClass("active");
        } else {
            $selectorCount.addClass("hidden");
            com.gsk.mt.dom.email.removeClass("active");
        }
    },

    /**
     * Count the number of selected fragments on all slides and populate the
     * fragment count
     */
    fragmentCountFinal: function() {
        if (com.gsk.mt.emailFragments.length) {
            com.gsk.mt.dom.email.html('<div class="selectorCount">' + com.gsk.mt.emailFragments.length + '</div>');
        }
        com.gsk.mt.dom.email.addClass("active").removeClass("inactive");
    },

    /* Tracking */

    /**
     * Creates a tracked jQuery UI slider
     * @param {Object} $slider
     */
    initTrackedSlider: function($slider) {
        $slider.slider({
            min: parseInt($slider.attr("data-min")),
            max: parseInt($slider.attr("data-max")),
            step: parseInt($slider.attr("data-step")),
            value: parseInt($slider.attr("data-value")),
            start: function() {
                com.gsk.mt.blockLinks = true;
            },
            change: function(e, ui) {
                if ($slider.hasClass("logField")) {
                    var $this = $(this);

                    com.gsk.mt.trackField($this, ui.value);
                }
            },
            stop: function() {
                setTimeout(function() {
                    com.gsk.mt.blockLinks = false;
                }, 250);
            }
        });
    },

    /**
     * Store a video event (time on pause or video ended)
     * @param {Object} player Video player element
     */
    trackVideoEvent: function(player, vduration) {
		var prevTime = parseInt(window.sessionStorage.getItem('prevVideoDUration'+player.id())||0);
		var time;
		var clickStream;
		if(vduration){		
        	time = vduration;
			clickStream = com.gsk.mt.buildClickStream($("#"+player.id()), vduration);
		}else{
			time = com.gsk.mt.getSeconds(player);
			clickStream = window.sessionStorage.getItem('prevVideoDUration'+player.id())?com.gsk.mt.buildClickStream($("#"+player.id()), time-prevTime):com.gsk.mt.buildClickStream($("#"+player.id()), time);
		}
		
		window.sessionStorage.setItem('prevVideoDUration'+player.id(),Math.round(time));
        if (clickStream === null) { return 0; }

        var jsonString = JSON.stringify(clickStream);
        com.gsk.mt.debug(jsonString, "#1c7fcb");

        var callback = function() { return 0; };
        com.gsk.mt.createRecord("Call_Clickstream_vod__c", clickStream, callback);
    },

    /**
     *
     * @param {Object} video
     * @returns {number}
     */
    getSeconds: function(video){
        var seconds = 0;
        video = $("#"+video.id()).find("video").get(0);
        if (video.played.length > 1) {
            for(var ii = 1; ii < video.played.length; ii++) {
                seconds += video.played.end(ii) - video.played.start(ii);
            }
        } else if (video.played.length > 0) {
            seconds += video.played.end(0) - video.played.start(0);
        }
        return Math.round(seconds);
    },

    /**
     * Initialise a dialog
     * @param {Object} $dialog
     */
    initDialog: function($dialog) {
        var options = {};

        if (com.gsk.mt.dialogOptions !== undefined) {
            options = com.gsk.mt.dialogOptions;
        } else {
            var show = $dialog.attr("data-show"),
                hide = $dialog.attr("data-hide");
            options = {
                autoOpen: false,
                buttons: $dialog.attr("data-buttons") || [],
                draggable: false,
                modal: true,
                resizable: false
            };

            if (show !== undefined) {
                if (show.indexOf("{") > -1) {
                    show = JSON.parse(show);
                }
                options.show = show;
            }
            if (hide !== undefined) {
                if (hide.indexOf("{") > -1) {
                    hide = JSON.parse(hide);
                }
                options.hide = hide;
            }
        }

        if ($dialog.attr("id") === "quickLinkDialog") {
            options.resize = "auto";
            options.maxHeight = com.gsk.mtconfig.dialogMaxHeight;
        }

        $dialog.dialog(options);
        $dialog.data("gskmtIScroll", null);

        $dialog.removeClass("hidden");
        if ($dialog.hasClass("noTitlebar")) {
            $dialog.siblings(".ui-dialog-titlebar").addClass("ui-titlebar-hidden");
        }

        if ($dialog.attr("data-dialog-class") !== undefined) {
            $dialog.parent(".ui-dialog").addClass($dialog.attr("data-dialog-class"));
        }

        if ($dialog.attr("data-width")) {
            if ($dialog.attr("data-width") > com.gsk.mtconfig.dialogMaxWidth) {
                $dialog.attr("data-width", com.gsk.mtconfig.dialogMaxWidth);
            }
            $dialog.dialog("option", "width", parseInt($dialog.attr("data-width")) * parseInt($('#container').width())/100);
            $dialog.dialog("option", "maxWidth", $dialog.attr("data-width"));
        }
        if ($dialog.attr("data-height")) {
            if ($dialog.attr("data-height") > com.gsk.mtconfig.dialogMaxHeight) {
                $dialog.attr("data-height", com.gsk.mtconfig.dialogMaxHeight);
            }
            $dialog.dialog("option", "height", parseInt($dialog.attr("data-height"))* parseInt($('#container').height())/100);
            $dialog.dialog("option", "maxHeight", $dialog.attr("data-height"));
        }

        $dialog.nodoubletapzoom();
		
		
    },

    /**
     * Open a dialog
     * @param {Object} $dialog The dialog being opened
     */
    openDialog: function($dialog) {		
        var activeQuickLink = $(".quickLinkDialogContent:not(.hidden)"); 
        $dialog.dialog("open");
        com.gsk.mt.dialogStack.push($dialog);
        if (com.gsk.mt.onDialogOpen !== undefined) {
            com.gsk.mt.onDialogOpen();
			var activeDialog = com.gsk.mt.getActiveDialog();			
			var inlineContent = $(activeDialog).find('.inlineContent'); 
			if (inlineContent.length > 0 && inlineContent.parents('.dialogBody').length > 0) {
				$.each(inlineContent, function(index) {	
					var $this = $(this);			
					if(com.gsk.mt.swiperArray.length >0) {						
						if (com.gsk.mt.swiperArray.filter(function(e) { return e.container["0"].id === $this.attr("id"); }).length > 0) {
						  return;
						}else{
							com.gsk.mt.initInlineContent($(this),index);
						}
					}else{
						com.gsk.mt.initInlineContent($(this),index);
					}
					
				});
				inlineContent.addClass("noSwipe");
			}
			
        }		
		if (com.gsk.mt.onVideoDialogOpen !== undefined) {
            com.gsk.mt.onVideoDialogOpen();
        }
		var activeDialog = com.gsk.mt.getActiveDialog();
		if (activeDialog !== null && com.gsk.mt.onTabDialogOpen !== undefined) {
            com.gsk.mt.onTabDialogOpen();
        }else if(activeDialog !== null && activeDialog.hasClass("quickLinkDialog") && com.gsk.mt.onTabDialogOpen !== undefined){
			com.gsk.mt.tabspopupClose();
		}

        if (activeQuickLink.hasClass('quickLinkDialogReferences')) {

        } else if (activeQuickLink.hasClass('quickLinkDialogPi')) {

        } else {
            com.gsk.mt.rebuildDialogIscroll($dialog);
        }
		if(com.gsk.mt.dialogStack.length > 1){								 
			com.gsk.mt.destroyDialogIscroll($(com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length-2]));			
		}
        if (com.gsk.mtconfig.enableQuickLinksOnDialog) {
            $(".navBottom").appendTo($(".ui-widget-overlay").last());
			if( isSafari === true ){
			resUnit();
			}
        }
    },

    /**
     * Rebuild iScroll for the current dialog
     * @param {Object} $dialog
     */
    rebuildDialogIscroll: function($dialog) {
        com.gsk.mt.destroyDialogIscroll($dialog);
        com.gsk.mt.createDialogIscroll($dialog);
    },

    /**
     * Destroy the iScroll container for a dialog
     * @param {Object} $dialog
     */
    destroyDialogIscroll: function($dialog) {
        var currentDialogData = $dialog.data("gskmtIScroll");
        if (currentDialogData !== null && currentDialogData !== undefined) {
            currentDialogData.scrollTo(0, 0);
            currentDialogData.destroy();
            $dialog.data("gskmtIScroll", null);
        }
    },

    /**
     * Create the iScroll container for a dialog
     * @param {Object} $dialog
     */
    createDialogIscroll: function($dialog) {
		/*external DialogBody code start */
		var activeDialog = com.gsk.mt.getActiveDialog();
		if (activeDialog != null && !activeDialog.hasClass("quickLinkDialog")) {
			if($($dialog).find('.externalDialogBody').length !== 0){
				$($dialog).find('.externalDialogBody').appendTo($dialog.parent());
			}
		}
		/*external DialogBody code end */
        var currentDialogBody = $dialog.find(".dialogBody");
        if (currentDialogBody.outerHeight() > $dialog.innerHeight()) {
            var currentDialogData = $dialog.data("gskmtIScroll");
            if (currentDialogData === null) {
                $dialog.addClass("dialog-iscroll").css({
                    "width": $dialog.innerWidth(),
                    "height": $dialog.innerHeight()
                });
                com.gsk.mt.initScroller($dialog);
            }
        }
    },

    /**
     * Get the topmost dialog
     * @returns {Object}
     */
    getActiveDialog: function() {
        if (com.gsk.mt.dialogStack.length > 0) {
            return com.gsk.mt.dialogStack[com.gsk.mt.dialogStack.length - 1];
        }
        return null;
    },

    /**
     * Clean up slide
     * Required to prevent issue with scrollable areas and pdf links
     */
    cleanUp: function() {
        $("body").html("");
        $('link[rel=stylesheet]').remove();
    }

};


/**
 * Adding computed width and height dynamically to #container,.bg, div.ui-widget-overlay
 */

function get_browser() {
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE',version:(tem[1]||'')};
    }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR|Edge\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
    }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
    name: M[0],
    version: M[1]
    };
}

var browser = get_browser();

var isSafari = /constructor/i.test(window.HTMLElement);


if( isSafari === true  && browser.version < 6 ){
	function resUnit(){		
		if(window.innerWidth > window.innerHeight){
			// width more, then take height
			$('#container,.bg, div.ui-widget-overlay').width((window.innerHeight * 1.3333333)+"px");
			$('#container,.bg, div.ui-widget-overlay').height(window.innerHeight+"px");
		}else{
			$('#container,.bg, div.ui-widget-overlay').width(window.innerWidth+"px");
			$('#container,.bg, div.ui-widget-overlay').height((window.innerWidth / 1.3333333)+"px");

		}
		document.querySelector('html').style['font-size']=((Math.max($('div').width(), $('div').height())/100) - 0.24)/10+"px";
	}
	$(document).ready(function() {	resUnit(); });
	window.onresize=function(){	resUnit(); };
}


/**
 * Custom dialogs - created for custom menu popup
 * @param triggerId - without #
 */
com.gsk.mt.custom.dialog = function(triggerId) {
    return this.initialise(triggerId);
};

com.gsk.mt.custom.dialog.prototype.initialise = function(triggerId) {
    var elementId;

    this.$trigger = $(triggerId);
    elementId = this.$trigger.attr('data-show');
    if (elementId !== undefined) {
        this.generateElement(elementId.replace('#', ''));
        return this.$element;
    } else {
        com.gsk.mt.log("Error: Custom dialog trigger does not have a data-show attribute!", '#7f0000');
        return null;
    }
};

com.gsk.mt.custom.dialog.prototype.generateElement = function(elementId) {
    $('<div id="' + elementId + '" class="customDialog hidden"></div>').appendTo(com.gsk.mt.dom.container);
    this.$element = $('#' + elementId);

    this.$element.append('<div class="closeCustom" data-hide="#' + elementId + '"></div>');
    this.$element.append('<div class="customDialogBody"></div>');
};

com.veeva.clm.createRecordsOnExit = function() {
    com.gsk.mt.callObjectArray = [];
    var clickStreamArray = [];

    // Video tracking
    if (com.gsk.mt.currentVideo !== null) { 
		if(com.gsk.mt.currentVideo.id){
        	var $player = $("#"+com.gsk.mt.currentVideo.id()),
            time = com.gsk.mt.getSeconds(com.gsk.mt.currentVideo),
            clickStreamVideo = com.gsk.mt.buildClickStream($player, time);
						
			if ($player.hasClass("logVideo")) {
            com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");

				if (clickStreamVideo !== null) {
					clickStreamArray.push(clickStreamVideo);
				}
			}
		}else{
			var $this = $(com.gsk.mt.currentVideo),
			$player = $(com.gsk.mt.currentVideo).attr('id'),
            time = Math.round((new Date() - com.gsk.mt.video_startTime) / 1000),			
			clickStreamVideo = {
						Track_Element_Id_vod__c: $this.attr("data-trackid"),
						Track_Element_Type_vod__c: $this.attr("data-tracktype"),							
						Selected_Items_vod__c: $this.attr("data-SelectedItems"),
						Track_Element_Description_vod__c: $this.attr("data-description"),
						Usage_Duration_vod__c:time
					};			
			com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");
            if (clickStreamVideo !== null) {
				clickStreamArray.push(clickStreamVideo);
			}			
		}
    }
	//Tabs tracking
	var activeDialog = com.gsk.mt.getActiveDialog();
	if(activeDialog !== null && !activeDialog.hasClass("quickLinkDialog") && activeDialog.parent().find(".logTab.active").length){
		var activeTab = $(activeDialog.parent().find(".logTab.active"));
		var activeTabTime = Math.round((new Date() - com.gsk.mt.tabStartTime) / 1000);		
		var clickStreamTab = com.gsk.mt.buildClickStream(activeTab, activeTabTime);

        com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");

        if (clickStreamTab !== null) {
            clickStreamArray.push(clickStreamTab);
        }
	}else if(activeDialog == null && $(".logTab.active").length){
		var inlineActiveTab =$("#container .logTab.active");
		var inlineActiveTabTime = Math.round((new Date() - com.gsk.mt.inlinetabStartTime) / 1000);
		var clickStreamInlineTab = com.gsk.mt.buildClickStream(inlineActiveTab, inlineActiveTabTime);

        com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");

        if (clickStreamInlineTab !== null) {
            clickStreamArray.push(clickStreamInlineTab);
        }
	}
	
    // Link tracking
    if (com.gsk.mt.trackedLink !== null) {
        var clickStreamLink = com.gsk.mt.buildClickStream(com.gsk.mt.trackedLink, "");

        com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");

        if (clickStreamLink !== null) {
            clickStreamArray.push(clickStreamLink);
        }
    }

    // Feedback tracking
    if (com.gsk.mt.sendFeedback) {
        var $dynamicFeedback = $(".dynamicFeedback");
        $.each($dynamicFeedback, function() {
            var $element = $(this),
                question = $element.attr("data-question"),
				description = $element.attr("data-description"),
				type = $element.attr("data-type"),
                answer,
                clickStream;

            if ($element.is("[type=checkbox]") || $element.is("[type=radio]")) {
                if ($element.prop("checked")) {
                    answer = "true"
                } else {
                    answer = "false"
                }
            } else if ($element.hasClass("slider")) {
                answer = $element.slider("value").toString();
            } else {
                answer = $element.val();
            }

            window.sessionStorage.setItem("mtgskFeedback" + $element.attr("id"), answer);

            clickStream = {
                Track_Element_Id_vod__c: $element.attr("id"),
                Track_Element_Description_vod__c: description,
                Question_vod__c: question,
				Track_Element_Type_vod__c:type,
                Answer_vod__c: answer
            };

            if (answer.length > 0) {
                com.gsk.mt.callObjectArray.push("Call_Clickstream_vod__c");
                clickStreamArray.push(clickStream);
            }
        });
    }

    // Additional tracking
    if (com.gsk.mt.onSlideExit !== undefined) {
        clickStreamArray = com.gsk.mt.onSlideExit(clickStreamArray);
    }

    // Clean up slide - required due to issue with pdf slides becoming unscrollable.
    com.gsk.mt.cleanUp();

    if (clickStreamArray.length > 0) {
        if (com.gsk.mt.isVeeva) {
            return com.veeva.clm.formatCreateRecords(com.gsk.mt.callObjectArray, clickStreamArray);
        } else {
            com.gsk.mt.debug(JSON.stringify(clickStreamArray), "#1c7fcb");
        }
    }
};

/**
 * jquery.hammer.js 2.0.0
 * https://github.com/hammerjs/jquery.hammer.js
 */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'hammerjs'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('hammerjs'));
    } else {
        factory(jQuery, Hammer);
    }
}(function($, Hammer) {
    function hammerify(el, options) {
        var $el = $(el);
        if(!$el.data("hammer")) {
            $el.data("hammer", new Hammer($el[0], options));
        }
    }

    $.fn.hammer = function(options) {
        return this.each(function() {
            hammerify(this, options);
        });
    };

    // extend the emit method to also trigger jQuery events
    Hammer.Manager.prototype.emit = (function(originalEmit) {
        return function(type, data) {
            originalEmit.call(this, type, data);
            $(this.element).trigger({
                type: type,
                gesture: data
            });
        };
    })(Hammer.Manager.prototype.emit);
}));

(function($) {
    var IS_IOS = /iphone|ipad/i.test(navigator.userAgent);
    $.fn.nodoubletapzoom = function() {
        if (IS_IOS)
            $(this).bind('touchstart', function preventZoom(e) {
                var t2 = e.timeStamp
                    , t1 = $(this).data('lastTouch') || t2
                    , dt = t2 - t1
                    , fingers = e.originalEvent.touches.length;
                $(this).data('lastTouch', t2);
                if (!dt || dt > 500 || fingers > 1) return; // not double-tap

                e.preventDefault(); // double tap - prevent the zoom
                // also synthesize click events we just swallowed up
                $(this).trigger('click').trigger('click');
            });
    };
})(jQuery);

/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

//AMD and CommonJS initialization copied from https://github.com/zohararad/audio5js
(function (root, ns, factory) {
    "use strict";

    if (typeof (module) !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(ns, root);
    } else if (typeof (define) === 'function' && define.amd) { // AMD
        define("detect-zoom", function () {
            return factory(ns, root);
        });
    } else {
        root[ns] = factory(ns, root);
    }

}(window, 'detectZoom', function () {

    /**
     * Use devicePixelRatio if supported by the browser
     * @return {Number}
     * @private
     */
    var devicePixelRatio = function () {
        return window.devicePixelRatio || 1;
    };

    /**
     * Fallback function to set default values
     * @return {Object}
     * @private
     */
    var fallback = function () {
        return {
            zoom: 1,
            devicePxPerCssPx: 1
        };
    };
    /**
     * IE 8 and 9: no trick needed!
     * TODO: Test on IE10 and Windows 8 RT
     * @return {Object}
     * @private
     **/
    var ie8 = function () {
        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * For IE10 we need to change our technique again...
     * thanks https://github.com/stefanvanburen
     * @return {Object}
     * @private
     */
    var ie10 = function () {
        var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * For chrome
     *
     */
    var chrome = function()
    {
        var zoom = Math.round(((window.outerWidth) / window.innerWidth)*100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * For safari (same as chrome)
     *
     */
    var safari = function()
    {
        var zoom = Math.round(((document.documentElement.clientWidth) / window.innerWidth)*100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };


    /**
     * Mobile WebKit
     * the trick: window.innerWIdth is in CSS pixels, while
     * screen.width and screen.height are in system pixels.
     * And there are no scrollbars to mess up the measurement.
     * @return {Object}
     * @private
     */
    var webkitMobile = function () {
        var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
        var zoom = deviceWidth / window.innerWidth;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Desktop Webkit
     * the trick: an element's clientHeight is in CSS pixels, while you can
     * set its line-height in system pixels using font-size and
     * -webkit-text-size-adjust:none.
     * device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/
     *
     * Previous trick (used before http://trac.webkit.org/changeset/100847):
     * documentElement.scrollWidth is in CSS pixels, while
     * document.width was in system pixels. Note that this is the
     * layout width of the document, which is slightly different from viewport
     * because document width does not include scrollbars and might be wider
     * due to big elements.
     * @return {Object}
     * @private
     */
    var webkit = function () {
        var important = function (str) {
            return str.replace(/;/g, " !important;");
        };

        var div = document.createElement('div');
        div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
        div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

        // The container exists so that the div will be laid out in its own flow
        // while not impacting the layout, viewport size, or display of the
        // webpage as a whole.
        // Add !important and relevant CSS rule resets
        // so that other rules cannot affect the results.
        var container = document.createElement('div');
        container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
        container.appendChild(div);

        document.body.appendChild(container);
        var zoom = 1000 / div.clientHeight;
        zoom = Math.round(zoom * 100) / 100;
        document.body.removeChild(container);

        return{
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
     * (Note that this is a different interpretation than Webkit's device
     * pixel ratio, which is the ratio device dpi / system dpi).
     *
     * Also, for Mozilla, there is no difference between the zoom factor and the device ratio.
     *
     * @return {Object}
     * @private
     */
    var firefox4 = function () {
        var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom
        };
    };

    /**
     * Firefox 18.x
     * Mozilla added support for devicePixelRatio to Firefox 18,
     * but it is affected by the zoom level, so, like in older
     * Firefox we can't tell if we are in zoom mode or in a device
     * with a different pixel ratio
     * @return {Object}
     * @private
     */
    var firefox18 = function () {
        return {
            zoom: firefox4().zoom,
            devicePxPerCssPx: devicePixelRatio()
        };
    };

    /**
     * works starting Opera 11.11
     * the trick: outerWidth is the viewport width including scrollbars in
     * system px, while innerWidth is the viewport width including scrollbars
     * in CSS px
     * @return {Object}
     * @private
     */
    var opera11 = function () {
        var zoom = window.top.outerWidth / window.top.innerWidth;
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Use a binary search through media queries to find zoom level in Firefox
     * @param property
     * @param unit
     * @param a
     * @param b
     * @param maxIter
     * @param epsilon
     * @return {Number}
     */
    var mediaQueryBinarySearch = function (property, unit, a, b, maxIter, epsilon) {
        var matchMedia;
        var head, style, div;
        if (window.matchMedia) {
            matchMedia = window.matchMedia;
        } else {
            head = document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            head.appendChild(style);

            div = document.createElement('div');
            div.className = 'mediaQueryBinarySearch';
            div.style.display = 'none';
            document.body.appendChild(div);

            matchMedia = function (query) {
                style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                var matched = getComputedStyle(div, null).textDecoration === 'underline';
                style.sheet.deleteRule(0);
                return {matches: matched};
            };
        }
        var ratio = binarySearch(a, b, maxIter);
        if (div) {
            head.removeChild(style);
            document.body.removeChild(div);
        }
        return ratio;

        function binarySearch(a, b, maxIter) {
            var mid = (a + b) / 2;
            if (maxIter <= 0 || b - a < epsilon) {
                return mid;
            }
            var query = "(" + property + ":" + mid + unit + ")";
            if (matchMedia(query).matches) {
                return binarySearch(mid, b, maxIter - 1);
            } else {
                return binarySearch(a, mid, maxIter - 1);
            }
        }
    };

    /**
     * Generate detection function
     * @private
     */
    var detectFunction = (function () {
        var func = fallback;
        //IE8+
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            func = ie8;
        }
        // IE10+ / Touch
        else if (window.navigator.msMaxTouchPoints) {
            func = ie10;
        }
        //chrome
        else if(!!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' Opera') >= 0)){
            func = chrome;
        }
        //safari
        else if(Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0){
            func = safari;
        }
        //Mobile Webkit
        else if ('orientation' in window && 'webkitRequestAnimationFrame' in window) {
            func = webkitMobile;
        }
        //WebKit
        else if ('webkitRequestAnimationFrame' in window) {
            func = webkit;
        }
        //Opera
        else if (navigator.userAgent.indexOf('Opera') >= 0) {
            func = opera11;
        }
        //Last one is Firefox
        //FF 18.x
        else if (window.devicePixelRatio) {
            func = firefox18;
        }
        //FF 4.0 - 17.x
        else if (firefox4().zoom > 0.001) {
            func = firefox4;
        }

        return func;
    }());


    return ({

        /**
         * Ratios.zoom shorthand
         * @return {Number} Zoom level
         */
        zoom: function () {
            return detectFunction().zoom;
        },

        /**
         * Ratios.devicePxPerCssPx shorthand
         * @return {Number} devicePxPerCssPx level
         */
        device: function () {
            return detectFunction().devicePxPerCssPx;
        }
    });
}));

$(document).ready(function() { 	com.gsk.mt.initialise(); });
