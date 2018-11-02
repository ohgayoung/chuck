var Hall = eg.Class({
	_oOption : null,
	_$element : null,
	_$flicking : null,
	_$outerScroll : null,
	_$innerScroll : null,
	_$iScroll : null,
	_aScrollContents : null,

	_PANEL_CHANGE_THRESHOULD : 30,

	/**
	 * 생성자 함수
	 */
	construct : function(htOption) {
		this._oOption = htOption || {};

		this._setElement();
		this._setEvent();

		$(window).load((function() {
			// 브라우저의 onload 이벤트 이후, 200ms의 딜레이를 주어 플리킹 모듈을 붙여준다. - 성능 이슈
			setTimeout(this._setFlicking.bind(this), 200);
		}).bind(this));
	},

	/**
	 * Element 정의
	 */
	_setElement : function() {
		this._$element = {};
		this._$element["header_hall"] = $(".header_hall");
		this._$element["flickingArea"] = $("#flick_area");
		//this._$element["yearIcon"] = this._$element["flickingArea"].find("a._yearIcon");
	},

	/**
	 * Event 리스너 등록
	 */
	_setEvent : function() {
		// body에 대한 touchmove는 기본적으로 차단해주자. (오직 가상 스크롤만을 허용)
		$(document.body).on("touchmove", function(oEvent) {
			oEvent.preventDefault();
		});

		// 기기회전 및 브라우저 리사이징에 대한 이벤트 처리
		if (naver.kin.mobile.common.OS.ios || naver.kin.mobile.common.OS.android) {
			$(window).on("orientationchange", this._onResizeWindow.bind(this));
		} else {
			$(window).on("resize", this._onResizeWindow.bind(this));
		}

		// 연도 아이콘을 클릭한 경우,
		//this._$element["yearIcon"].on("click", this._onClickYearIcon.bind(this));
	},


	/**
	 * 연도 아이콘을 클릭한 경우,
	 */
	/*_onClickYearIcon : function(oEvent) {
		// 표지에서 컨텐츠 영역으로 전환한다.
		if (this._$outerScroll) {
			this._$outerScroll.goToPage(0, 1, 500);
		}

		oEvent.stopPropagation();
		oEvent.preventDefault();
	},
*/
	/**
	 * 플리킹 모듈 셋팅
	 */
	_setFlicking : function() {
		// 플리킹 영역을 화면상에 노출
		this._$element["flickingArea"].show();

		// 영역의 높이를 현재 브라우저 높이에 맞추어 조정한다.
		this._adjustHeight();

		// 플리킹 인스턴스 생성
		this._$flicking = new eg.Flicking(this._$element["flickingArea"], {
			horizontal : true,
			circular : false,
			inputType : ["touch", "mouse"]
		}).on({
				"flickEnd" : (function(oParam) {
					// 첫 번째 카드의 opacity를 1로 조정
					this._$flicking.getElement().find("div._cardArea div._card:eq(0)").css("opacity", 1);
					// 나머지 카드의 opacity를 0으로 조정
					this._$flicking.getElement().find("div._cardArea div._card:gt(0)").css("opacity", 0);

					// 이전 패널 내 가상 스크롤 영역은 destroy 처리.
					if (this._$innerScroll) {
						$(this._$innerScroll.wrapper).find("div._scrollWrapper").attr("style", "");
						this._$innerScroll.destroy();
						this._$innerScroll = null;
					}

					// 현재 패널에 맞추어 표지 스크롤 인스턴스를 생성해주자.
					this._setOuterScroll();
				}).bind(this)
			});

		// 표지-컨텐츠 스크롤 처리를 위한 인스턴스 생성
		this._setOuterScroll();

		// 100ms 이후 플리킹 영역 너비 재조정 (PC 브라우저에서 접근 시, 스크롤바만큼 영역이 잡히는 이슈)
		setTimeout((function() {
			this._$flicking.resize();
		}).bind(this), 100);
	},

	/**
	 * 현재 브라우저 높이에 맞추어, 각 영역의 높이를 조정
	 */
	_adjustHeight : function() {
		var nAdjustedHeight = $(window).height() - this._$element["header_hall"].height();
		this._$element["flickingArea"].height(nAdjustedHeight);
		this._$element["flickingArea"].find("._adjustHeight").height(nAdjustedHeight);
		this._$element["flickingArea"].find("._adjustLineHeight").css({"line-height" : nAdjustedHeight + "px"});
	},

	/**
	 * 브라우저 리사이징 이벤트 발생 시,
	 */
	_onResizeWindow : function() {
		// 영역 높이 재조정
		this._adjustHeight();

		// 플리킹 모듈 갱신
		if (this._$flicking) {
			this._$flicking.resize();
		}

		// 표지-컨텐츠 스크롤 갱신
		if (this._$outerScroll) {
			this._$outerScroll.refresh();
		}

		// 컨텐츠 내부 스크롤 갱신
		if (this._$innerScroll) {
			this._setScrollContents();
			this._$innerScroll.refresh();
		}
	},

	/**
	 * 표지-컨텐츠 스크롤 인스턴스 생성
	 */
	_setOuterScroll : function() {
		// 이미 존재하던 인스턴스는 destroy 처리해주자.
		if (this._$outerScroll) {
			$(this._$outerScroll.wrapper).find("div._scrollWrapper").attr("style", "");
			this._$outerScroll.destroy();
		}

		// 현재 플리킹 영역에 대하여 신규 스크롤 인스턴스 생성
		var bIsPcBrowser = (this._oOption.bIsPcBrowser === true);
		var $currentScrollArea = this._$flicking.getElement().find("div._outerScrollArea");
		this._$outerScroll = new IScroll($currentScrollArea.get(0), {
			useTransform : true,
			HWCompositing : eg.isHWAccelerable(),
			useTransition : eg.isTransitional(),
			mouseWheel : bIsPcBrowser,
			disableTouch : bIsPcBrowser,
			disableMouse : !bIsPcBrowser,
			disablePointer : !bIsPcBrowser,
			click : true,
			snap : "div._outerScrollContents",		// 페이지 단위로 끊어서 보여주기 위한 옵션
			bounce : true,
			momentum : true,
			scrollX : false,
			scrollY : true,
			scrollbars : false,
			startX : 0,
			startY : 0
		});

		// 스크롤 종료 시에 대한 이벤트 함수 바인딩
		this._$outerScroll.on("scrollEnd", this._onOuterScrollEnd.bind(this));
	},

	/**
	 * 표지-컨텐츠 스크롤이 종료되는 시점에 호출되는 함수
	 */
	_onOuterScrollEnd : function(oEvent) {
		if (!this._$outerScroll) {
			return;
		}

		var oCurrentPageInfo = this._$outerScroll.currentPage;
		if (!oCurrentPageInfo) {
			return;
		}

		// 현재 페이지 정보를 가져온다.
		var nCurrentPage = oCurrentPageInfo.pageY;

		// 첫 페이지(표지)인 경우,
		if (nCurrentPage === 0) {
			// 컨텐츠 내부 스크롤 영역은 비활성화
			if (this._$innerScroll && this._$innerScroll.enabled === true) {
				this._$innerScroll.disable();
				$(this._$innerScroll.wrapper).find("div._scrollWrapper").attr("style", "");
				this._$innerScroll.y = 0;
			}

			// 표지 스크롤 영역은 활성화
			if (this._$outerScroll) {
				if (this._$outerScroll.enabled !== true) {
					this._$outerScroll.enable();
				}
			} else {
				this._setOuterScroll();
			}

			// 두 번째 페이지(컨텐츠)인 경우,
		} else if (nCurrentPage === 1) {
			// 표지-컨텐츠 스크롤 영역은 비활성화
			if (this._$outerScroll && this._$outerScroll.enabled === true) {
				this._$outerScroll.disable();
			}

			// 컨텐츠 내부 스크롤 영역은 활성화
			if (this._$innerScroll) {
				if (this._$innerScroll.enabled !== true) {
					this._$innerScroll.enable();
				}
			} else {
				this._setInnerScroll();
			}
		}
	},

	/**
	 * 컨텐츠 내부 스크롤을 위한 인스턴스 생성함수<br>
	 */
	_setInnerScroll : function() {
		// 기존에 존재하던 스크롤 인스턴스는 destroy 처리.
		if (this._$innerScroll) {
			$(this._$innerScroll.wrapper).find("div.scrollWrapper").attr("style", "");
			this._$innerScroll.destroy();
		}

		// 컨텐츠 내부 스크롤을 위한 인스턴스 생성
		var bIsPcBrowser = (this._oOption.bIsPcBrowser === true);
		var $currentScrollArea = this._$flicking.getElement().find("div._innerScrollArea");
		this._$innerScroll = new IScroll($currentScrollArea.get(0), {
			useTransform : true,
			HWCompositing : eg.isHWAccelerable(),
			useTransition : eg.isTransitional(),
			mouseWheel : bIsPcBrowser,
			disableTouch : bIsPcBrowser,
			disableMouse : !bIsPcBrowser,
			disablePointer : !bIsPcBrowser,
			click : true,
			bounce : true,
			momentum : true,
			scrollX : false,
			scrollY : true,
			scrollbars : false,
			startX : 0,
			startY : 0,
			probeType: 3
		});

		// 스크롤 진행중/종료 시에 대한 이벤트 바인딩
		this._$innerScroll.on("scroll", this._onInnerScroll.bind(this));
		this._$innerScroll.on("scrollEnd", this._onInnerScroll.bind(this));

		// 스크롤 대상 컨텐츠 정보 셋팅
		this._setScrollContents();
	},

	/**
	 * 스크롤 대상 컨텐츠 정보를 셋팅하는 함수
	 */
	_setScrollContents : function() {
		this._aScrollContents = [];
		var aCard = this._$flicking.getElement().find("div._cardArea div._card");
		var nScrollTop = Math.abs(Math.round(this._$innerScroll.y || 0));
		var aScrollContents = this._$flicking.getElement().find("div._innerScrollArea div._scrollContents");
		var nScrollContentsCount = aScrollContents.size();
		for (var i = 0; i < nScrollContentsCount; i++) {
			var oCurrentContents = aScrollContents.eq(i);
			var nContentsTop = (oCurrentContents.offset().top || 0) + nScrollTop;
			this._aScrollContents[i] = {
				"card" : aCard.eq(i),
				"contents" : oCurrentContents,
				"top" : nContentsTop,
				"bottom" : nContentsTop + oCurrentContents.height()
			}
		}
	},

	/**
	 * 컨텐츠 내부에서 스크롤이 일어날 때마다 호출되는 함수
	 */
	_onInnerScroll : function(oEvent) {
		if (!this._$innerScroll) {
			return;
		}

		var nScrollTop = this._$innerScroll.y;
		if (typeof nScrollTop === "undefined") {
			return;
		}

		// 표지-컨텐츠 교체를 위한 Threshould를 넘어간 경우,
		if (nScrollTop >= this._PANEL_CHANGE_THRESHOULD) {
			// 컨텐츠 내부 스크롤은 비활성화한다.
			if (this._$innerScroll.enabled === true) {
				this._$innerScroll.disable();
				$(this._$innerScroll.wrapper).find("div._scrollWrapper").attr("style", "");
				this._$innerScroll.y = 0;
			}

			// 표지-컨텐츠 스크롤을 다시 활성화하고, 첫 페이지로 돌아간다.
			if (this._$outerScroll) {
				if (this._$outerScroll.enabled !== true) {
					this._$outerScroll.enable();
				}

				this._$outerScroll.goToPage(0, 0, 500);
			}

			return;
		}

		// 현재 페이지 중앙에 해당하는 위치값을 가져온다.
		var nCurrentMiddle = Math.abs(Math.round(nScrollTop)) + Math.round($(window).height() / 2);

		for (var i = 0, len = this._aScrollContents.length; i < len; i++) {
			var oCurrentContents = this._aScrollContents[i];
			if (nCurrentMiddle >= oCurrentContents.top && nCurrentMiddle <= oCurrentContents.bottom) {
				// 현재 페이지 중앙에 걸친 카드라면, 화면상에 노출
				oCurrentContents.card.css("opacity", 1);
			} else if (nCurrentMiddle > oCurrentContents.bottom) {
				var oNextContents = (i < (len - 1) ? this._aScrollContents[i + 1] : null);
				if (oNextContents && nCurrentMiddle <= oNextContents.top) {
					// 현재 페이지 중앙이 카드와 카드 사이에 위치한 경우, 그 비율에 따라 Opacity를 조정 
					var nContentsGap = oNextContents.top - oCurrentContents.bottom;
					oCurrentContents.card.css("opacity", (oNextContents.top - nCurrentMiddle) / nContentsGap);
					oNextContents.card.css("opacity", (nCurrentMiddle - oCurrentContents.bottom) / nContentsGap);
					break;
				} else {
					// 이미 지나간 카드는 화면상에 미노출
					oCurrentContents.card.css("opacity", 0);
				}
			} else {
				// 아직 보지 않은 카드는 화면상에 미노출
				oCurrentContents.card.css("opacity", 0);
			}
		}
	},

	/**
	 * 소멸자 함수
	 */
	_destroy : function() {
		if (this._$innerScroll) {
			this._$innerScroll.destroy();
			this._$innerScroll = null;
		}

		if (this._$outerScroll) {
			this._$outerScroll.destroy();
			this._$outerScroll = null;
		}

		this._oOption = null;
	}
})