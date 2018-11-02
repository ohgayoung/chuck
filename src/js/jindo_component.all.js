/**
 * Jindo Component
 * @version 1.1.0
 * NHN_Library:Jindo_Component-1.1.0;JavaScript Components for Jindo;
 * 
 * jindo.Component
 * jindo.UIComponent
 * jindo.HTMLComponent
 * jindo.ScrollBar
 * jindo.Effect
 * jindo.Transition
 * jindo.Timer
 * jindo.RolloverArea
 * jindo.Slider
 * jindo.DragArea
 * jindo.LayerManager
 * jindo.LayerPosition
 * jindo.RolloverClick
 * jindo.AjaxHistory
 * jindo.Rolling
 * jindo.TabControl
 * jindo.WatchInput
 * jindo.SelectBox
 * jindo.FloatingLayer
 * jindo.ScrollBox
 * 
 */

/**
	@fileOverview 진도 컴포넌트를 구현하기 위한 코어 클래스
	@version 1.1.0
**/

/**
	진도 컴포넌트를 구현하기 위한 코어 클래스.
	다른 컴포넌트가 상속받는 용도로 사용된다.
	
	@class jindo.Component
	
	@keyword component, base, core
**/
jindo.Component = jindo.$Class({
	/** @lends jindo.Component.prototype */

	_htEventHandler : null,
	_htOption : null,

	/**
		jindo.Component를 초기화한다.
		@constructor
	**/
	$init : function() {
		var aInstance = this.constructor.getInstance();
		aInstance.push(this);
		this._htEventHandler = {};
		this._htOption = {};
		this._htOption._htSetter = {};
	},
	
	/**
		옵션값을 설정하거나 가져온다.
		htCustomEventHandler 옵션을 선언해서 attach() 메소드를 사용하지 않고 커스텀 이벤트핸들러를 등록할 수 있다.
		
		@method option
		@param {String} sName 옵션의 이름
		@param {String} sValue 옵션의 값
		@return {this} 컴포넌트 객체 자신
		@example
			var MyComponent = jindo.$Class({
				method : function() {
					alert(this.option("foo"));
				}
			}).extend(jindo.Component);
			
			var oInst = new MyComponent();
			oInst.option("foo", 123); // 또는 oInst.option({ foo : 123 });
			oInst.method(); // 결과 123
		@example
			//커스텀이벤트핸들러 등록예제
			oInst.option("htCustomEventHandler", {
				test : function(oCustomEvent) {
					
				}
			});
			
			//이미 "htCustomEventHandler" 옵션이 설정되어있는 경우에는 무시된다.
			oInst.option("htCustomEventHandler", {
				change : function(oCustomEvent) {
					
				}
			});
	**/
	option : function(sName, vValue) {
		switch (typeof sName) {
			case "undefined" :
				var oOption = {};
				for(var i in this._htOption){
					if(!(i == "htCustomEventHandler" || i == "_htSetter")){
						oOption[i] = this._htOption[i];
					}
				}
				return oOption;
			case "string" : 
				if (typeof vValue != "undefined") {
					if (sName == "htCustomEventHandler") {
						if (typeof this._htOption[sName] == "undefined") {
							this.attach(vValue);
						} else {
							return this;
						}
					}
					
					this._htOption[sName] = vValue;
					if (typeof this._htOption._htSetter[sName] == "function") {
						this._htOption._htSetter[sName](vValue);	
					}
				} else {
					return this._htOption[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					if (sKey == "htCustomEventHandler") {
						if (typeof this._htOption[sKey] == "undefined") {
							this.attach(sName[sKey]);
						} else {
							continue;
						}
					}
					if(sKey !== "_htSetter"){
						this._htOption[sKey] = sName[sKey];
					}
					
					if (typeof this._htOption._htSetter[sKey] == "function") {
						this._htOption._htSetter[sKey](sName[sKey]);	
					}
				}
				break;
		}
		return this;
	},
	
	/**
		옵션의 setter 함수를 설정하거나 가져온다.
		옵션의 setter 함수는 지정된 옵션이 변경되면 수행되는 함수이다.
		
		@method optionSetter
		@param {String} sName setter의 이름
		@param {Function} fSetter setter 함수
		@return {this} 컴포넌트 객체 자신
		@example
			oInst.option("sMsg", "test");
			oInst.optionSetter("sMsg", function(){
				alert("sMsg 옵션값이 변경되었습니다.");
			});
			oInst.option("sMsg", "change"); -> alert발생
		@example
			//HashTable 형태로 설정가능
			oInst.optionSetter({
				"sMsg" : function(){
				},
				"nNum" : function(){
				}
			});
	**/
	optionSetter : function(sName, fSetter) {
		switch (typeof sName) {
			case "undefined" :
				return this._htOption._htSetter;
			case "string" : 
				if (typeof fSetter != "undefined") {
					this._htOption._htSetter[sName] = jindo.$Fn(fSetter, this).bind();
				} else {
					return this._htOption._htSetter[sName];
				}
				break;
			case "object" :
				for(var sKey in sName) {
					this._htOption._htSetter[sKey] = jindo.$Fn(sName[sKey], this).bind();
				}
				break;
		}
		return this;
	},
	
	/**
		이벤트를 발생시킨다.
		
		@method fireEvent
		@param {Object} sEvent 커스텀이벤트명
		@param {Object} oEvent 커스텀이벤트 핸들러에 전달되는 객체.
		@return {Boolean} 핸들러의 커스텀이벤트객체에서 stop메소드가 수행되면 false를 리턴
		@example
			//커스텀 이벤트를 발생시키는 예제
			var MyComponent = jindo.$Class({
				method : function() {
					this.fireEvent('happened', {
						sHello : 'world',
						sAbc : '123'
					});
				}
			}).extend(jindo.Component);
			
			var oInst = new MyComponent().attach({
				happened : function(oCustomEvent) {
					alert(eCustomEvent.sHello + '/' + oCustomEvent.nAbc); // 결과 : world/123
				}
			};
			
			<button onclick="oInst.method(event);">Click me</button> 
	**/
	fireEvent : function(sEvent, oEvent) {
		oEvent = oEvent || {};
		var fInlineHandler = this['on' + sEvent],
			aHandlerList = this._htEventHandler[sEvent] || [],
			bHasInlineHandler = typeof fInlineHandler == "function",
			bHasHandlerList = aHandlerList.length > 0;
			
		if (!bHasInlineHandler && !bHasHandlerList) {
			return true;
		}
		aHandlerList = aHandlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행
		
		oEvent.sType = sEvent;
		if (typeof oEvent._aExtend == 'undefined') {
			oEvent._aExtend = [];
			oEvent.stop = function(){
				if (oEvent._aExtend.length > 0) {
					oEvent._aExtend[oEvent._aExtend.length - 1].bCanceled = true;
				}
			};
		}
		oEvent._aExtend.push({
			sType: sEvent,
			bCanceled: false
		});
		
		var aArg = [oEvent], 
			i, nLen;
			
		for (i = 2, nLen = arguments.length; i < nLen; i++){
			aArg.push(arguments[i]);
		}
		
		if (bHasInlineHandler) {
			fInlineHandler.apply(this, aArg);
		}
	
		if (bHasHandlerList) {
			var fHandler;
			for (i = 0, fHandler; (fHandler = aHandlerList[i]); i++) {
				fHandler.apply(this, aArg);
			}
		}
		
		return !oEvent._aExtend.pop().bCanceled;
	},

	/**
		커스텀 이벤트 핸들러를 등록한다.
		
		@method attach
		@param {Object} sEvent TODO : 파라미터 설명달기
		@param {Object} fHandlerToAttach TODO : 파라미터 설명달기
		@return {this} 컴포넌트 객체 자신
		@example
			//이벤트 등록 방법 예제
			//아래처럼 등록하면 appear 라는 사용자 이벤트 핸들러는 총 3개가 등록되어 해당 이벤트를 발생시키면 각각의 핸들러 함수가 모두 실행됨.
			//attach 을 통해 등록할때는 이벤트명에 'on' 이 빠지는 것에 유의.
			function fpHandler1(oEvent) { .... };
			function fpHandler2(oEvent) { .... };
			
			var oInst = new MyComponent();
			oInst.onappear = fpHandler1; // 직접 등록
			oInst.attach('appear', fpHandler1); // attach 함수를 통해 등록
			oInst.attach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	attach : function(sEvent, fHandlerToAttach) {
		if (arguments.length == 1) {
			
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.attach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}
		
		var aHandler = this._htEventHandler[sEvent];
		
		if (typeof aHandler == 'undefined'){
			aHandler = this._htEventHandler[sEvent] = [];
		}
		
		aHandler.push(fHandlerToAttach);
		
		return this;
	},
	
	/**
		커스텀 이벤트 핸들러를 해제한다.
		
		@method detach
		@param {Object} sEvent TODO : 파라미터 설명달기
		@param {Object} fHandlerToDetach TODO : 파라미터 설명달기
		@return {this} 컴포넌트 객체 자신
		@example
			//이벤트 해제 예제
			oInst.onappear = null; // 직접 해제
			oInst.detach('appear', fpHandler1); // detach 함수를 통해 해제
			oInst.detach({
				appear : fpHandler1,
				more : fpHandler2
			});
	**/
	detach : function(sEvent, fHandlerToDetach) {
		if (arguments.length == 1) {
			jindo.$H(arguments[0]).forEach(jindo.$Fn(function(fHandler, sEvent) {
				this.detach(sEvent, fHandler);
			}, this).bind());
		
			return this;
		}

		var aHandler = this._htEventHandler[sEvent];
		if (aHandler) {
			for (var i = 0, fHandler; (fHandler = aHandler[i]); i++) {
				if (fHandler === fHandlerToDetach) {
					aHandler = aHandler.splice(i, 1);
					break;
				}
			}
		}

		return this;
	},
	
	/**
		등록된 모든 커스텀 이벤트 핸들러를 해제한다.
		
		@method detachAll
		@param {String} sEvent 이벤트명. 생략시 모든 등록된 커스텀 이벤트 핸들러를 해제한다. 
		@return {this} 컴포넌트 객체 자신
		@example
			//"show" 커스텀이벤트 핸들러 모두 해제
			oInst.detachAll("show");
			
			//모든 커스텀이벤트 핸들러 해제
			oInst.detachAll();
	**/
	detachAll : function(sEvent) {
		var aHandler = this._htEventHandler;
		
		if (arguments.length) {
			
			if (typeof aHandler[sEvent] == 'undefined') {
				return this;
			}
	
			delete aHandler[sEvent];
	
			return this;
		}	
		
		for (var o in aHandler) {
			delete aHandler[o];
		}
		return this;				
	}
});

/**
	다수의 컴포넌트를 일괄 생성하는 Static Method
	
	@method factory
	@static
	@param {Array} aObject 기준엘리먼트의 배열
	@param {HashTable} htOption 옵션객체의 배열
	@return {Array} 생성된 컴포넌트 객체 배열
	@example
		var Instance = jindo.Component.factory(
			cssquery('li'),
			{
				foo : 123,
				bar : 456
			}
		);
**/
jindo.Component.factory = function(aObject, htOption) {
	var aReturn = [],
		oInstance;

	if (typeof htOption == "undefined") {
		htOption = {};
	}
	
	for(var i = 0, el; (el = aObject[i]); i++) {
		oInstance = new this(el, htOption);
		aReturn[aReturn.length] = oInstance;
	}

	return aReturn;
};

/**
	컴포넌트의 생성된 인스턴스를 리턴한다.
	
	@method getInstance
	@static
	@return {Array} 생성된 인스턴스의 배열
**/
jindo.Component.getInstance = function(){
	if (typeof this._aInstance == "undefined") {
		this._aInstance = [];
	}
	return this._aInstance;
};

/**
	@fileOverview UI 컴포넌트를 구현하기 위한 코어 클래스
	@version 1.1.0
**/
/**
	UI Component에 상속되어 사용되는 Jindo Component의 Core
	
	@class jindo.UIComponent
	@extends jindo.Component
	@keyword uicomponent, component, 유아이컴포넌트
**/
jindo.UIComponent = jindo.$Class({
	/** @lends jindo.UIComponent.prototype */
		
	/**
		@constructor
		jindo.UIComponent를 초기화한다.
	**/
	$init : function() {
		this._bIsActivating = false; //컴포넌트의 활성화 여부
	},

	/**
		컴포넌트의 활성여부를 가져온다.
		
		@method isActivating
		@return {Boolean}
	**/
	isActivating : function() {
		return this._bIsActivating;
	},

	/**
		컴포넌트를 활성화한다.
		_onActivate 메소드를 수행하므로 반드시 상속받는 클래스에 _onActivate 메소드가 정의되어야한다.
		
		@method activate
		@return {this}
	**/
	activate : function() {
		if (this.isActivating()) {
			return this;
		}
		this._bIsActivating = true;
		
		if (arguments.length > 0) {
			this._onActivate.apply(this, arguments);
		} else {
			this._onActivate();
		}
				
		return this;
	},
	
	/**
		컴포넌트를 비활성화한다.
		_onDeactivate 메소드를 수행하므로 반드시 상속받는 클래스에 _onDeactivate 메소드가 정의되어야한다.
		
		@method deactivate
		@return {this}
	**/
	deactivate : function() {
		if (!this.isActivating()) {
			return this;
		}
		this._bIsActivating = false;
		
		if (arguments.length > 0) {
			this._onDeactivate.apply(this, arguments);
		} else {
			this._onDeactivate();
		}
		
		return this;
	}
}).extend(jindo.Component);	

/**
	@fileOverview HTML 컴포넌트를 구현하기 위한 코어 클래스
	@version 1.1.0
**/
/**
	HTML 컴포넌트에 상속되어 사용되는 jindo.UIComponent.js
	
	@class jindo.HTMLComponent
	@extends jindo.UIComponent
	
	@keyword component, base, core, html
**/
jindo.HTMLComponent = jindo.$Class({
	/** @lends jindo.HTMLComponent.prototype */
	sTagName : "",
	
	/**
		jindo.HTMLComponent를 초기화한다.
		@constructor
	**/
	$init : function() {
	},
	
	/**
		컴포넌트를 새로 그려준다.
		상속받는 클래스는 반드시 _onPaint() 메소드가 정의되어야 한다.
		
		@method paint
		@return {this}
	**/
	paint : function() {
		this._onPaint();
		return this;
	}
}).extend(jindo.UIComponent);

/**
	다수의 컴포넌트의 paint 메소드를 일괄 수행하는 Static Method
	
	@method paint
	@static
**/
jindo.HTMLComponent.paint = function() {
	var aInstance = this.getInstance();
	for (var i = 0, oInstance; (oInstance = aInstance[i]); i++) {
		oInstance.paint();
	}
};
/**
	@fileOverview 이미지 스크롤바 컴포넌트
	@author senxation
	@version 1.1.0
**/
/**
	이미지 스크롤바 컴포넌트
	ScrollBar 컴포넌트는 정해진 크기의 박스내의 내용을 스크롤바를 이용해 이동하여 볼 수 있게합니다.
	스크롤바의 위치와 크기는 마크업의 정의에 따라 커스터마이징할 수 있습니다.
	박스내 내용이 고정되어있고 변하지 않는 경우에 사용합니다.
	
	@class jindo.ScrollBar
	@extends jindo.UIComponent
	@requires jindo.Slider
	@requires jindo.RolloverArea
	@requires jindo.Transition
	@keyword scrollbar, 스크롤바
**/
jindo.ScrollBar = new jindo.$Class({
	/** @lends jindo.ScrollBar.prototype */

	_bMouseEnter : false,
	_bIsEventAttachedForCommon : false,
	_bIsEventAttachedForVertical : false,
	_bIsEventAttachedForHorizontal : false,
	
	/**
		@constructor
		@param {HTMLElement} el
		@param {Object} [oOption] TODO : 파라미터 설명달기
			@param {String} [oOption.sClassPrefix="scrollbar-"] 클래스명 접두어
			@param {Number} [oOption.nDelta=16] 스크롤 속도
			@param {String} [oOption.sClassNameForRollover="rollover"] Rollover에 반응할 클래스명
			@param {Boolean} [oOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
		@example
			var oScrollBar = new jindo.ScrollBar("scroll", {
				sClassPrefix : "scrollbar-", // (String) Class Prefix
				nDelta : 16, // (Number) 스크롤 속도
				sClassNameForRollover : "rollover", // (String) Rollover에 반응할 class 명
				bActivateOnload : true
			}).attach({
				scroll : function(oCustomEvent) {
					//스크롤위치가 바뀔 때 마다 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	sDirection : (String) "left" 또는 "top"
					//	nPosition : (Number) 스크롤된 위치
					//}
				}
			});
	**/	
	$init : function(el, oOption) {
		
		this.option({
			sClassPrefix : "scrollbar-",
			nDelta : 16, //스크롤 속도
			sClassNameForRollover : "rollover", // (String) Rollover에 반응할 class 명
			bActivateOnload : true
		});
		
		this.option(oOption || {});
		
		this._el = jindo.$(el);
		
		this._oTimer = new jindo.Timer();
		this._oTransition = new jindo.Transition().fps(30);
		
		this._wfOnMouseEnter = jindo.$Fn(this._onMouseEnter, this);
		this._wfOnMouseLeave = jindo.$Fn(this._onMouseLeave, this);
		
		this._wfOnWheel = jindo.$Fn(this._onWheel, this);
		this._wfOnMouseUp = jindo.$Fn(this._onMouseUp, this);

		this._assignHTMLElements();
		this._initialize4Tablet();
		
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},
	
	_assignHTMLElements : function(){
		var el = this._el,
			sClassPrefix = this.option("sClassPrefix");

		this._elBox = jindo.$$.getSingle("."+sClassPrefix+"box", el);
		this._elContent = jindo.$$.getSingle("."+sClassPrefix+"content", el);
		
		var welBox = jindo.$Element(this._elBox),
			welContent = jindo.$Element(this._elContent);
			
		this._oBoxSize = {
			nWidth: welBox.width(),
			nHeight: welBox.height()
		};
		
		this._oContentSize = {
			nWidth: welContent.width(),
			nHeight: welContent.height()
		};

		this._oHorizontal = {
			elScrollBar : jindo.$$.getSingle("."+sClassPrefix+"h", el)
		};
		
		var oH = this._oHorizontal;
		if (oH.elScrollBar) {
			oH.elTrack = jindo.$$.getSingle("." + sClassPrefix + "track", oH.elScrollBar);
			oH.elThumb = jindo.$$.getSingle("." + sClassPrefix + "thumb", oH.elTrack);
			oH.elThumbHead = jindo.$$.getSingle("."+sClassPrefix+"thumb-head", oH.elThumb);
			oH.elThumbBody = jindo.$$.getSingle("."+sClassPrefix+"thumb-body", oH.elThumb);
			oH.elThumbFoot = jindo.$$.getSingle("."+sClassPrefix+"thumb-foot", oH.elThumb);			
			oH.elButtonLeft = jindo.$$.getSingle("." + sClassPrefix + "button-left", oH.elScrollBar);
			oH.elButtonRight = jindo.$$.getSingle("." + sClassPrefix + "button-right", oH.elScrollBar);
		}
		
		this._oVertical = {
			elScrollBar : jindo.$$.getSingle("."+sClassPrefix+"v", el)
		};
		var oV = this._oVertical;
		if (oV.elScrollBar) {
			oV.elTrack = jindo.$$.getSingle("." + sClassPrefix + "track", oV.elScrollBar);
			oV.elThumb = jindo.$$.getSingle("." + sClassPrefix + "thumb", oV.elTrack);
			oV.elThumbHead = jindo.$$.getSingle("."+sClassPrefix+"thumb-head", oV.elThumb);
			oV.elThumbBody = jindo.$$.getSingle("."+sClassPrefix+"thumb-body", oV.elThumb);
			oV.elThumbFoot = jindo.$$.getSingle("."+sClassPrefix+"thumb-foot", oV.elThumb);
			oV.elButtonUp = jindo.$$.getSingle("." + sClassPrefix + "button-up", oV.elScrollBar);
			oV.elButtonDown = jindo.$$.getSingle("." + sClassPrefix + "button-down", oV.elScrollBar);
		}
	},
	
	/**
		box 엘리먼트를 가져온다.
		
		@method getBox
		@return {HTMLElement}
	**/
	getBox : function() {
		return this._elBox;
	},
	
	/**
		content 엘리먼트를 가져온다
		
		@method getContent
		@return {HTMLElement}
	**/
	getContent : function() {
		return this._elContent;
	},
	
	/**
		초기 로딩시 정해진 박스의 크기를 가져온다.
		
		@method getDefaultBoxSize
		@return {Object}
		@example
			var oSize = {
				nWidth : (Number), 
				nHeight : (Number)
			}
	**/
	getDefaultBoxSize : function() {
		return this._oBoxSize;
	},
	
	/**
		초기 로딩시 정해진 박스의 크기를 가져온다.
		
		@method getDefaultContentSize
		@return {Object}
		@example
			var oSize = {
				nWidth : (Number), 
				nHeight : (Number)
			}
	**/
	getDefaultContentSize : function() {
		return this._oContentSize;
	},
	
	/**
		가로 스크롤바에 해당하는 HTMLElement 객체들을 가져온다.
		
		@method getScrollBarHorizontal
		@return {Object}
		@example
			var oScrollBarHorizontal = {
				elScrollBar : (HTMLElement),
				elTrack : (HTMLElement),
				elThumb : (HTMLElement),
				elThumbHead : (HTMLElement),
				elThumbBody : (HTMLElement),
				elThumbFoot : (HTMLElement),
				elButtonLeft : (HTMLElement), 
				elButtonRight : (HTMLElement)
			}
	**/
	getScrollBarHorizontal : function() {
		return this._oHorizontal;
	},
	
	/**
		세로 스크롤바에 해당하는 HTMLElement 객체들을 가져온다.
		
		@method getScrollBarVertical
		@return {Object}
		@example
			var oScrollBarVertical = {
				elScrollBar : (HTMLElement),
				elTrack : (HTMLElement),
				elThumb : (HTMLElement),
				elThumbHead : (HTMLElement),
				elThumbBody : (HTMLElement),
				elThumbFoot : (HTMLElement),
				elButtonUp : (HTMLElement), 
				elButtonDown : (HTMLElement)
			}
	**/
	getScrollBarVertical : function() {
		return this._oVertical;
	},
	
	/**
		가로 스크롤에 해당하는 슬라이더 객체를 가져온다.
		
		@method getSliderHorizontal
		@return {jindo.Slider}
	**/
	getSliderHorizontal : function() {
		return this._oSliderHorizontal || null;
	},
	
	/**
		세로 스크롤에 해당하는 슬라이더 객체를 가져온다.
		
		@method getSliderVertical
		@return {jindo.Slider}
	**/
	getSliderVertical : function() {
		return this._oSliderVertical || null;
	},
	
	/**
		RolloverArea 객체를 가져온다.
		
		@method getRolloverArea
		@return {jindo.RolloverArea}
	**/
	getRolloverArea : function() {
		return this._oRolloverArea;
	},
	
	_attachEvent : function(sDirection) {
		var sClassPrefix = this.option("sClassPrefix"),
			self = this,
			oH = this.getScrollBarHorizontal(),
			oV = this.getScrollBarVertical();	
		
		function attach(o) {
			if (o.elScrollBar) {
				var sClassNameForRollover = self.option("sClassNameForRollover");
				jindo.$Element(o.elTrack).addClass(sClassNameForRollover);
				jindo.$Element(o.elThumb).addClass(sClassNameForRollover);
				if (o.elButtonLeft) {
					jindo.$Element(o.elButtonLeft).addClass(sClassNameForRollover);	
				}
				if (o.elButtonRight) {
					jindo.$Element(o.elButtonRight).addClass(sClassNameForRollover);
				}
				if (o.elButtonUp) {
					jindo.$Element(o.elButtonUp).addClass(sClassNameForRollover);
				}
				if (o.elButtonDown) {
					jindo.$Element(o.elButtonDown).addClass(sClassNameForRollover);
				}
			}
		}
		
		function attachH() {
			if (!self._bIsEventAttachedForHorizontal) {
				attach(oH);
			}
			self._bIsEventAttachedForHorizontal = true;
		}
		
		function attachV() {
			if (!self._bIsEventAttachedForVertical) {
				attach(oV);
			}
			self._bIsEventAttachedForVertical = true;
		}
		
		//공통 이벤트
		if(!this._bIsEventAttachedForCommon) {
			this._initSliders();
			this._initRolloverArea();
			
			this._wfOnMouseEnter.attach(this._el, "mouseenter");
			this._wfOnMouseLeave.attach(this._el, "mouseleave");
			this._wfOnWheel.attach(document, "mousewheel");
			this._wfOnMouseUp.attach(document, "mouseup");
			this._bIsEventAttachedForCommon = true;
			jindo.$Element(this._el).removeClass(sClassPrefix + "noscript");
		}

		//방향이 없으면 전부
		if (!sDirection) {
			attachH();
			attachV();
		}
		if (sDirection == "horizontal") {
			attachH();
		}
		if (sDirection == "vertical") {
			attachV();
		}
	},
	
	_detachEvent : function(sDirection) {
		var sClassPrefix = this.option("sClassPrefix"),
			self = this,
			oH = this.getScrollBarHorizontal(),
			oV = this.getScrollBarVertical();	
		
		function detach(o) {
			if (o.elScrollBar) {
				var sClassNameForRollover = self.option("sClassNameForRollover");
				jindo.$Element(o.elTrack).removeClass(sClassNameForRollover);
				jindo.$Element(o.elThumb).removeClass(sClassNameForRollover);
				if (o.elButtonLeft) {
					jindo.$Element(o.elButtonLeft).removeClass(sClassNameForRollover);	
				}
				if (o.elButtonRight) {
					jindo.$Element(o.elButtonRight).removeClass(sClassNameForRollover);
				}
				if (o.elButtonUp) {
					jindo.$Element(o.elButtonUp).removeClass(sClassNameForRollover);
				}
				if (o.elButtonDown) {
					jindo.$Element(o.elButtonDown).removeClass(sClassNameForRollover);
				}
			}
		}
		
		function detachH() {
			if (self._bIsEventAttachedForHorizontal) {
				detach(oH);
			}
			self._bIsEventAttachedForHorizontal = false;
		}
		
		function detachV() {
			if (self._bIsEventAttachedForVertical) {
				detach(oV);
			}
			self._bIsEventAttachedForVertical = false;
		}

		//방향이 없으면 전부
		if (!sDirection) {
			detachH();
			detachV();
		}
		else if (sDirection == "horizontal") {
			detachH();
		}
		else if (sDirection == "vertical") {
			detachV();
		}

		//공통 이벤트
		if(this._bIsEventAttachedForCommon && !this._bIsEventAttachedForHorizontal && !this._bIsEventAttachedForVertical) {
			this._wfOnMouseEnter.detach(this._el, "mouseenter");
			this._wfOnMouseLeave.detach(this._el, "mouseleave");
			this._wfOnWheel.detach(document, "mousewheel");
			this._wfOnMouseUp.detach(document, "mouseup");
			this._bMouseEnter = false;
			this._bIsEventAttachedForCommon = false;
			this.getRolloverArea().deactivate();
			jindo.$Element(this._el).addClass(sClassPrefix + "noscript");	
		}
	},
	
	_activateH : function() {
		var oSliderH = this.getSliderHorizontal();
		if (oSliderH) {
			oSliderH.activate();
			this.getBox().scrollLeft = 0;
			this.setScrollLeft(0);
		}
	},
	
	_activateV : function() {
		var oSliderV = this.getSliderVertical();
		if (oSliderV) {
			oSliderV.activate();
			this.getBox().scrollTop = 0;
			this.setScrollTop(0);
		}
	},
	
	/**
		스크롤바의 동작을 활성화한다.
		@param {String} sDirection "vertical" || "horizontal" || null
	**/
	_onActivate : function(sDirection) {
		this._attachEvent(sDirection || null);
		this._activate4Tablet();
		
		if(!sDirection) {
			this._activateH();
			this._activateV();
			jindo.$Element(this._el).removeClass(this.option("sClassPrefix") + "noscript");
			return;
		}
		if(sDirection == "horizontal") {
			this._activateH();
			return;
		}
		if(sDirection == "vertical") {
			this._activateV();
			return;
		}
	},
	
	_deactivateH : function() {
		var oSliderH = this.getSliderHorizontal();
		if (oSliderH) {
			oSliderH.deactivate();
			this.getContent().style.left = "0px";
			this.getBox().scrollLeft = 0;
		}
	},
	
	_deactivateV : function() {
		var oSliderV = this.getSliderVertical();
		if (oSliderV) {
			oSliderV.deactivate();
			this.getContent().style.top = "0px";
			this.getBox().scrollTop = 0;
		}
	},
	
	/**
		스크롤바의 동작을 비활성화한다.
		@param {String} sDirection "vertical" || "horizontal" || null
	**/
	_onDeactivate : function(sDirection) {
		this._detachEvent(sDirection || null);
		this._deactivate4Tablet();
		
		if(!sDirection) {
			this._deactivateH();
			this._deactivateV();
			jindo.$Element(this._el).addClass(this.option("sClassPrefix") + "noscript");
			return;
		}
		if(sDirection == "horizontal") {
			this._deactivateH();
			return;
		}
		if(sDirection == "vertical") {
			this._deactivateV();
			return;
		}
	},
	
	_initSliders : function() {
		var self = this,
			sClassPrefix = this.option("sClassPrefix"),
			oH = this.getScrollBarHorizontal(),
			oV = this.getScrollBarVertical();		
		
		if (oH.elScrollBar) {

			this._nScrollWidth = jindo.$Element(this._elContent).width() - jindo.$Element(this._elBox).width();
			
			this._oSliderHorizontal = new jindo.Slider(oH.elTrack, {
				sClassPrefix: sClassPrefix,
				bVertical: false,
				nMinValue: 0,
				nMaxValue: this._nScrollWidth
			});
			this._oSliderHorizontal._oTransition = new jindo.Transition().fps(30);
			
			this._oSliderHorizontal.attach({
				beforeChange: function(oCustomEvent){
					var nTrackWidth = jindo.$Element(this.getTrack()).width(),
						nThumbWidth = jindo.$Element(this.getThumb(oCustomEvent.nIndex)).width(),
						nAvailWidth = nTrackWidth - nThumbWidth;
					
					oCustomEvent.nPos = Math.min(oCustomEvent.nPos, nAvailWidth); 
					oCustomEvent.nPos = Math.max(oCustomEvent.nPos, 0);

					if (oCustomEvent.bJump) {
						oCustomEvent.stop();
						
						this._oTransition.abort().start(200, this.getThumb(oCustomEvent.nIndex), {
							"@left" : jindo.Effect.easeOut(oCustomEvent.nPos + 'px') 
						}).attach({
							playing : function(oCustomEvent2) {
								self.setScrollLeft(self._oSliderHorizontal._getValue(0, parseInt(oCustomEvent2.sValue, 10)));
							}
						});
					} else {
						self.setScrollLeft(this._getValue(0, oCustomEvent.nPos));
					}
				}
			});
			
		}
		
		if (oV.elScrollBar) {
			this._nScrollHeight = jindo.$Element(this._elContent).height() - jindo.$Element(this._elBox).height();

			this._oSliderVertical = new jindo.Slider(oV.elTrack, {
				sClassPrefix: sClassPrefix,
				bVertical: true,
				nMinValue: 0,
				nMaxValue: this._nScrollHeight
			});
			this._oSliderVertical._oTransition = new jindo.Transition().fps(30);
			
			this._oSliderVertical.attach({
				beforeChange: function(oCustomEvent){
					var nTrackHeight = jindo.$Element(this.getTrack()).height(),
						nThumbHeight = jindo.$Element(this.getThumb(oCustomEvent.nIndex)).height(),
						nAvailHeight = nTrackHeight - nThumbHeight;
					
					oCustomEvent.nPos = Math.min(oCustomEvent.nPos, nAvailHeight); 
					oCustomEvent.nPos = Math.max(oCustomEvent.nPos, 0);

					if (oCustomEvent.bJump) {
						oCustomEvent.stop();
						this._oTransition.abort().start(200, this.getThumb(oCustomEvent.nIndex), {
							"@top" : jindo.Effect.easeOut(oCustomEvent.nPos + 'px') 
						}).attach({
							playing : function(oCustomEvent2) {
								self.setScrollTop(self._oSliderVertical.values(0));
							}
						});
					} else {
						self.setScrollTop(this._getValue(0, oCustomEvent.nPos));
					}
				}
			});
			
		}		
		
	},

	_initRolloverArea : function(){
		var self = this,
			sClassPrefix = this.option("sClassPrefix"),
			sClassNameForRollover = this.option("sClassNameForRollover");
			
		this._oRolloverArea = new jindo.RolloverArea(this._el, {
			sClassName : sClassNameForRollover, // (String) 컴포넌트가 적용될 엘리먼트의 class 명. 상위 기준 엘리먼트의 자식 중 해당 클래스명을 가진 모든 엘리먼트에 Rollover 컴포넌트가 적용된다.
			sClassPrefix : sClassPrefix // (String) 컴포넌트가 적용될 엘리먼트에 붙게될 class명의 prefix. (prefix+"over|down")
		}).attach({
			over: function(oCustomEvent){
				oCustomEvent.stop();
				self._onRollover("over", oCustomEvent.element);
			},
			down: function(oCustomEvent){
				oCustomEvent.stop();
				self._onMouseDown(oCustomEvent.element);
				self._onRollover("down", oCustomEvent.element);
			},
			up: function(oCustomEvent){
				oCustomEvent.stop();
				self._onMouseUp(oCustomEvent.element);
				self._onRollover("up", oCustomEvent.element);
			},
			out: function(oCustomEvent){
				oCustomEvent.stop();
				self._onRollover("out", oCustomEvent.element);
			}
		});
	},
	
	/**
		content의 내용의 크기가 달라졌을때 스크롤바의 이동 값을 재설정해준다.
		
		@method reset
	**/	
	reset : function() {
		var oSliderH = this.getSliderHorizontal(),
			oSliderV = this.getSliderVertical();
		
		if (oSliderH) {
			this._nScrollWidth = jindo.$Element(this._elContent).width() - jindo.$Element(this._elBox).width();
			oSliderH.option("nMaxValue", this._nScrollWidth);
			this.setScrollLeft(0);
		}
		if (oSliderV) {
			this._nScrollHeight = jindo.$Element(this._elContent).height() - jindo.$Element(this._elBox).height();
			oSliderV.option("nMaxValue", this._nScrollHeight);
			this.setScrollTop(0);			
		}
		
		this._elBox.scrollLeft = 0;
		this._elBox.scrollTop = 0;		
	},
	
	/**
		가로 스크롤이 화면에 표시되었는지 여부를 가져온다.
		
		@method hasScrollBarHorizontal
		@return {Boolean} 
	**/
	hasScrollBarHorizontal : function() {
		var sClassPrefix = this.option("sClassPrefix"),
			o = this.getScrollBarHorizontal();
		
		if (o.elScrollBar) {
			var welScrollBar = jindo.$Element(o.elScrollBar);
			return welScrollBar.visible() || welScrollBar.hasClass(sClassPrefix + "show");	
		}
		return false;
		
	},
	
	/**
		세로 스크롤이 화면에 표시되었는지 여부를 가져온다.
		
		@method hasScrollBarVertical
		@return {Boolean} 
	**/
	hasScrollBarVertical : function() {
		var sClassPrefix = this.option("sClassPrefix"),
			o = this.getScrollBarVertical();
		
		if (o.elScrollBar) {
			var welScrollBar = jindo.$Element(o.elScrollBar);
			return welScrollBar.visible() || welScrollBar.hasClass(sClassPrefix + "show");
		}
		return false;
	},
	
	/**
		세로 스크롤바의 포지션을 설정한다.
		
		@method setScrollTop
		@param {Number} n TODO : 파라미터 설명달기
		@remark 0.1.2 버전부터 slider 0.3.2버전 필요
	**/
	setScrollTop : function(n) {
		n = Math.min(n, this._nScrollHeight);
		n = Math.max(n, 0);
		n = Math.round(n);
		
		var htParam = {
			sDirection : "top",
			nPosition : n
		};
		
		jindo.$Element(this._elContent).css("top", (htParam.nPosition * -1) + "px");
		var oSliderV = this.getSliderVertical();
		if (oSliderV) {
			oSliderV.values(0, htParam.nPosition, false); //커스텀이벤트를 발생하지 않으면서 이동
		}
		
		this._fireScrollEvent(htParam);
	},

	/**
		가로 스크롤바의 포지션을 설정한다.
		
		@method setScrollLeft
		@param {Number} n TODO : 파라미터 설명달기
		@remark 0.1.2 버전부터 slider 0.3.2버전 필요
	**/
	setScrollLeft : function(n) {
		n = Math.min(n, this._nScrollWidth);
		n = Math.max(n, 0);
		n = Math.round(n);
		
		var htParam = {
			sDirection : "left",
			nPosition : n
		};
		
		jindo.$Element(this._elContent).css("left", (htParam.nPosition * -1) +"px");
		var oSliderH = this.getSliderHorizontal();
		if (oSliderH) {
			oSliderH.values(0, htParam.nPosition, false); //커스텀이벤트를 발생하지 않으면서 이동
		}
		
		this._fireScrollEvent(htParam);
	},
	
	/**
		세로 스크롤바의 포지션을 상대값으로 설정한다.
		
		@method setScrollTopBy
		@param {Number} n TODO : 파라미터 설명달기
	**/
	setScrollTopBy : function(n) {
		this.setScrollTop(this.getScrollTop()+n);
	},

	/**
		가로 스크롤바의 포지션을 상대값으로 설정한다.
		
		@method setScrollLeftBy
		@param {Number} n TODO : 파라미터 설명달기
	**/
	setScrollLeftBy : function(n) {
		this.setScrollLeft(this.getScrollLeft()+n);
	},

	/**
		컨텐트 영역의 상/하 위치를 구한다.
		
		@method getScrollTop
		@param {Number} n TODO : 파라미터 설명달기
	**/
	getScrollTop : function(n) {
		return parseInt(jindo.$Element(this._elContent).css("top"), 10) * -1;
	},
	
	/**
		컨텐트 영역의 좌/우 위치를 구한다.
		
		@method getScrollLeft
		@param {Object} n TODO : 파라미터 설명달기
	**/
	getScrollLeft : function(n) {
		return parseInt(jindo.$Element(this._elContent).css("left"), 10) * -1;
	},
	
	_getElementType : function(wel) {
		var sClassPrefix = this.option("sClassPrefix");
		
		if (wel.hasClass(sClassPrefix+"track")) {
			return "track";
		}
		else if (wel.hasClass(sClassPrefix+"thumb")) {
			return "thumb";
		}
		else if (wel.hasClass(sClassPrefix+"button-up")) {
			return "button-up";
		}
		else if (wel.hasClass(sClassPrefix+"button-up")) {
			return "button-up";
		}
		else if (wel.hasClass(sClassPrefix+"button-down")) {
			return "button-down";
		}
		else if (wel.hasClass(sClassPrefix+"button-left")) {
			return "button-left";
		}
		else if (wel.hasClass(sClassPrefix+"button-right")) {
			return "button-right";
		}
		else {
			return false;
		}
	},
	
	_fireScrollEvent : function(htParam) {
		/**
			스크롤위치가 바뀔 때
			
			@event scroll
			@param {String} sType 커스텀이벤트명
			@param {String} sDirection 
			<ul>
			<li>"left"</li>
			<li>"top"</li>
			</ul>
			@param {Number} nPosition 스크롤된 위치
			@example
				//커스텀이벤트 핸들링 예제
				oScrollBar.attach("scroll", function(oCustomEvent) { ... });
		**/
		this.fireEvent("scroll", htParam);
	},
	
	_onWheel : function(we) {
		if (!this._bMouseEnter) {
			return;
		}
		we.stop(jindo.$Event.CANCEL_DEFAULT);
		
		var nDelta = we.mouse().delta,
			nDirection  = nDelta / Math.abs(nDelta) * -1,
			n = Math.ceil(Math.abs(nDelta)) * nDirection * this.option("nDelta"),
			bH = this.hasScrollBarHorizontal(),
			bV = this.hasScrollBarVertical();
			
		if (!bH && !bV) {
			return;
		}
		
		if (this.hasScrollBarVertical() && this._bIsEventAttachedForVertical) {
			this.setScrollTop(this.getScrollTop()+n);
			return;
		}
		
		this.setScrollLeft(this.getScrollLeft()+n);
	},
	
	_onMouseDown : function(el) {
		var wel = jindo.$Element(el),
			self = this,
			setScrollBy,
			sElementType = this._getElementType(wel);
		
		switch (sElementType) {
			case "button-up" :
				setScrollBy = function (n){
					self.setScrollTopBy(~~(n * -1));
				};
			break;
			case "button-down" :
				setScrollBy = function (n){
					self.setScrollTopBy(n);
				};
			break;
			case "button-left" :
				setScrollBy = function (n){
					self.setScrollLeftBy(~~(n * -1));
				};
			break;
			case "button-right" :
				setScrollBy = function (n){
					self.setScrollLeftBy(n);
				};
			break;
			default :
			return;
		}
		
		this._oTimer.start(function(){
			setScrollBy(16);
			return true;
		}, 100);
		
	},
	
	_onMouseUp : function(el) {
		this._oTimer.abort();
	},
	
	_onMouseEnter : function(we) {
		this._bMouseEnter = true;
	},
	
	_onMouseLeave : function(we) {
		this._bMouseEnter = false;
	},
	
	_onRollover : function(sType, el) {
		var wel = jindo.$Element(el),
			sClassPrefix = this.option("sClassPrefix"),
			sElementType = this._getElementType(wel);
		
		switch (sType) {
			case "over" :
				wel.addClass(sClassPrefix + sElementType + "-over");		
			break;
			case "down" :
				wel.addClass(sClassPrefix + sElementType + "-hold");
			break;
			case "up" :
				wel.removeClass(sClassPrefix + sElementType + "-hold");
			break;
			case "out" :
				wel.removeClass(sClassPrefix + sElementType + "-over");
			break;
		}
		
	},
	
	_initialize4Tablet : function() {
		
		this._fpOnTouchDragStart = jindo.$Fn(function(oEvent) {
			this._oPos4Tablet = oEvent.pos();
		}, this);
		
		this._fpOnTouchDragMove = jindo.$Fn(function(oEvent) {
			
			if (!this._oPos4Tablet) { return; }
			
			var oOldPos = this._oPos4Tablet;
			var oNewPos = oEvent.pos();
			
			this.setScrollLeftBy(oOldPos.pageX - oNewPos.pageX);
			this.setScrollTopBy(oOldPos.pageY - oNewPos.pageY);

			this._oPos4Tablet = oNewPos;
			
			oEvent.stopDefault();
			
		}, this);
		
		this._fpOnTouchDragEnd = jindo.$Fn(function(oEvent) {
			this._oPos4Tablet = null;
		}, this);
		
	},
	
	_activate4Tablet : function() {
		
		var elEl = this._elContent;
		
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._el).preventTapHighlight(true);
		
		this._fpOnTouchDragStart.attach(elEl, 'touchstart');
		this._fpOnTouchDragMove.attach(elEl, 'touchmove');
		this._fpOnTouchDragEnd.attach(elEl, 'touchend');
		
	},
	
	_deactivate4Tablet : function() {
		
		var elEl = this._elContent;
		
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._el).preventTapHighlight(false);
		
		this._fpOnTouchDragStart.detach(elEl, 'touchstart');
		this._fpOnTouchDragMove.detach(elEl, 'touchmove');
		this._fpOnTouchDragEnd.detach(elEl, 'touchend');
		
	}
	
}).extend(jindo.UIComponent);

/**
	@fileOverview 영역내의 값을 마우스 클릭 또는 드래그로 선택하는 슬라이더 컴포넌트
	@author hooriza, modified by senxation
	@version 1.1.0
**/
/**
	영역내의 값을 마우스 클릭 또는 드래그로 선택하는 슬라이더 컴포넌트
	
	@class jindo.Slider
	@extends jindo.UIComponent
	@requires jindo.DragArea
	@keyword slider, thumb, track, 슬라이더
**/
jindo.Slider = jindo.$Class({
	/** @lends jindo.Slider.prototype */
	_elTrack : null,
	_aThumbs : null,
	_aPoses : null,
	_htSwap : null,
	
	/**
		Slider 컴포넌트를 생성한다.
		@constructor
		@param {String | HTMLElement} el Thumb이 움직이는 바탕이 되는 Track Element (id 혹은 엘리먼트 자체)
		@param {Object} [oOptions] 옵션 객체
			@param {String} [oOptions.sClassPrefix="slider-"] 클래스명 접두어
			@param {Boolean} [oOptions.bVertical=false] 슬라이더 세로 여부
			@param {Boolean} [oOptions.bJump=true] 슬라이더의 트랙 클릭시 thumb 객체의 이동 여부
			@param {Boolean} [oOptions.bDragOnTrack=true] 트랙에 마우스다운이후 드래그가능한지 여부
			@param {String} [oOptions.sClassPrefix="slider-"] 슬라이더를 구현할 객체의 클래스명 접두어
			@param {Number} [oOptions.nMinValue=0] 슬라이더의 최소값
			@param {Number} [oOptions.nMaxValue=0] 슬라이더의 최대값
			@param {Function} [oOptions.fAdjustValue=null] 슬라이더의 값을 원하는 값으로 조절하는 함수
			@param {Boolean} [oOptions.bActivateOnload=true] 컴포넌트 로드시 activate 여부
		@example
			var oSlider = new jindo.Slider(jindo.$('sample'), {
				fAdjustValue : function(nValue) {
					// value의 소숫점을 제거한다.
					return Math.round(nValue / 10) * 10;
				}});
				
			alert("value : " + oSlider.values()); // 소숫점이 제거된 value 노출.
		@example
			var alpha = new jindo.Slider(jindo.$('alpha'),{
				 sClassPrefix : 'slider-',
				 bVertical : false, //슬라이더 세로 여부
				 bJump : true, //트랙에 클릭하여 이동가능한지 여부
				 bDragOnTrack : true, //트랙에 마우스다운이후 드래그가능한지 여부
				 nMinValue : 0, 
				 nMaxValue : 1,
				 fAdjustValue : null,(Function) 값을 조절하기 위한 함수
				 bActivateOnload : true //(Boolean) 컴포넌트 로드시 activate 여부
			}).attach({
				beforeChange : function(oCustomEvent){
					//Thumb이 움직이기 전에 발생
					//oCustomEvent.stop()을 실행하면 change 이벤트가 발생하지 않고 중단된다.
				},
				change : function(oCustomEvent){
					//Thumb을 Drop한 이후 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	nIndex : (Number)
					//	nPos : (Number)
					//	nValue : (Number)
					//}
				}
			});
	**/
	
	$init : function(el, oOptions) {
		this.option({
			sClassPrefix : 'slider-',
			bVertical : false,
			bJump : true,
			bDragOnTrack : true,
			fAdjustValue : null,
			nMinValue : 0,
			nMaxValue : 1,
			bActivateOnload : true
		});
		this.option(oOptions || {});
		
		if (!this.option('bVertical')) {
			this._htSwap = {
				y : 'nY',
				x : 'nX',
				clientX : 'clientX',
				pageX : 'pageX',
				offsetWidth : 'offsetWidth',
				left : 'left'
			};
		} else {
			this._htSwap = {
				y : 'nX',
				x : 'nY',
				clientX : 'clientY',
				pageX : 'pageY',
				offsetWidth : 'offsetHeight',
				left : 'top'
			};
		}
		
		// Thumbs 들과 각각의 값을 저장할 공간 만들기
		this._elTrack = jindo.$(el);
		this._aThumbs = jindo.$$('.' + this.option('sClassPrefix') + 'thumb', this._elTrack);
		this._sRand = 'S' + parseInt(Math.random() * 100000000, 10);
		jindo.$ElementList(this._aThumbs).addClass(this._sRand);

		this._aPoses = this.positions();
		this._onTrackMouseDownFn = jindo.$Fn(this._onTrackMouseDown, this);
		this._initDragArea();
		
		if (this.option("bActivateOnload")){
			this.activate();		
		}
	},
	
	/**
		Track 엘리먼트를 구한다.
		
		@method getTrack
		@return {HTMLElement} 
	**/
	getTrack : function() {
		return this._elTrack;
	},
	
	/**
		n번째 Thumb 엘리먼트를 구한다.
		
		@method getThumb
		@param {Number} nIndex TODO : 파라미터 설명달기
		@return {HTMLElement} 
	**/
	getThumb : function(nIndex) {
		return this._aThumbs[nIndex];
	},
	
	_initDragArea : function() {
		var self = this;
		var htSwap = this._htSwap;
		
		// 컴퍼넌트 내부에서 사용하는 다른 컴퍼넌트 초기화
		this._oDragArea = new jindo.DragArea(this._elTrack, { 
			sClassName : this._sRand, 
			bFlowOut : false 
		}).attach({
			beforeDrag : function(oCustomEvent) {
				var nIndex = self._getThumbIndex(oCustomEvent.elHandle);
				var htParam = { 
					nIndex : nIndex,
					nPos : oCustomEvent[htSwap.x],
					bJump : false
				};
				
				/**
					Thumb이 움직이기 전에 발생
					
					@event beforeChange
					@param {String} sType 커스텀이벤트명
					@param {Function} stop 수행시 값이 바뀌지 않으며, change 이벤트가 발생하지 않고 중단된다.
					@example
						// Thumb이 움직이기 전에 발생 될 함수 구현.
						oSlider.attach("beforeChange", function(oCustomEvent) { ... });
				**/
				if (!self.fireEvent('beforeChange', htParam)) {
					oCustomEvent.stop();
					return false;
				}
				
				oCustomEvent[htSwap.x] = self._getAdjustedPos(nIndex, htParam.nPos);
				oCustomEvent[htSwap.y] = null;
			},
			drag : function(oCustomEvent) {
				var nIndex = self._getThumbIndex(oCustomEvent.elHandle);
				var nPos = oCustomEvent[htSwap.x];
				if (nPos != self._aPoses[nIndex]) {
					self._aPoses[nIndex] = nPos;
					self._fireChangeEvent(nIndex);
				}
			}
		});
	},
	
	/**
		적용된 DragArea 객체를 가져온다.
		
		@method getDragArea
		@return {jindo.DragArea}
	**/
	getDragArea : function() {
		return this._oDragArea; 
	},
	
	_fireChangeEvent : function(nIndex) {
		var nPos = this._getPosition(nIndex);
		/**
			Thumb을 Drop한 이후 발생
			
			@event change
			@param {String} sType 커스텀이벤트명
			@param {Number} nIndex 위치값을 가져올 Thumb의 index (생략시 모든 Thumb의 위치값 배열을 리턴)
			@param {Number} nPos 설정할 위치값(pixel단위)
			@param {Number} nValue drop 이후의 슬라이더 값
			@example
				// Thumb을 Drop한 이후 발생 단계에 실행 될 함수 구현.
				oSlider.attach("change", function(oCustomEvent) { ... });
		**/
		this.fireEvent('change', {
			nIndex : nIndex,
			nPos : nPos,
			nValue : this._getValue(nIndex, nPos)
		});
	},

	/**
		컴포넌트를 활성화시킨다.
	**/
	_onActivate : function() {
		this.getDragArea().activate();
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._elTrack).preventTapHighlight(true);
		this._onTrackMouseDownFn.attach(this._elTrack, 'mousedown');
	},
	
	/**
		컴포넌트를 비활성화시킨다.
	**/
	_onDeactivate : function() {
		this.getDragArea().deactivate();
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._elTrack).preventTapHighlight(false);
		this._onTrackMouseDownFn.detach(this._elTrack, 'mousedown');
	},
	
	_onTrackMouseDown : function(we) {
		if (!this.option('bJump')) {
			return;
		}
		
		we.stop(jindo.$Event.CANCEL_DEFAULT);
		var nIndex = 0;
		var htSwap = this._htSwap;
		var el = we.element;
		var sClass = '.' + this.option('sClassPrefix') + 'thumb';
		var bThumb = jindo.$$.test(el, sClass) || jindo.$$.getSingle('! ' + sClass, el);
		if (bThumb) {
			return;
		}
		
		var nPos = we.pos()[htSwap.pageX]; // 클릭한 위치
		nPos -= jindo.$Element(this._elTrack).offset()[htSwap.left];
		
		var nMaxDistance = 9999999;
		
		// 가장 가까운 Thumb 찾기
		for (var i = 0, oThumb; (oThumb = this._aThumbs[i]); i++) {
			var nThumbPos = parseInt(jindo.$Element(oThumb).css(htSwap.left), 10) || 0;
			nThumbPos += parseInt(oThumb[htSwap.offsetWidth] / 2, 10);
			
			var nDistance  = Math.abs(nPos - nThumbPos);
			
			if (nDistance < nMaxDistance) {
				nMaxDistance = nDistance;
				nIndex = i;
			}
		}

		nPos -= parseInt(this._aThumbs[nIndex][htSwap.offsetWidth] / 2, 10);
		this.positions(nIndex, nPos);
		
		if (this.option("bDragOnTrack")) {
			this.getDragArea().startDragging(this._aThumbs[nIndex]);
		}
	},
	
	_getTrackInfo : function(nIndex) {
		var htSwap = this._htSwap;
		var oThumb = this._aThumbs[nIndex];
		var nThumbSize = oThumb[htSwap.offsetWidth];
		var nTrackSize = this._elTrack[htSwap.offsetWidth];
		var nMaxPos = nTrackSize - nThumbSize;
		var nMax = this.option('nMaxValue');
		var nMin = this.option('nMinValue');
		
		return {
			maxPos : nMaxPos,
			max : nMax,
			min : nMin
		};
	},
	
	/**
		옵션의 fAdjustValue가 적용된 value를 구한다.
		@param {Object} nIndex
		@param {Object} nPos
		@ignore
	**/
	_getValue : function(nIndex, nPos) {
		if (typeof nPos == 'undefined') {
			nPos = this._getPosition(nIndex);
		}

		var oInfo = this._getTrackInfo(nIndex);
		var nValue = Math.min(Math.max(nPos * (oInfo.max - oInfo.min) / oInfo.maxPos + oInfo.min, oInfo.min), oInfo.max);

		var fAdjust = this.option('fAdjustValue');
		if (fAdjust) {
			nValue = fAdjust.call(this, nValue);
		}
		
		return nValue;
	},
	
	/**
		옵션의 fAdjustValue가 적용된 포지션을 구한다.
		@param {Object} nIndex
		@param {Object} nPos
		@ignore
	**/
	_getAdjustedPos : function(nIndex, nPos) {
		var nAdjustedPos = nPos;
		var oInfo = this._getTrackInfo(nIndex);
		
		var fAdjust = this.option('fAdjustValue');
		if (fAdjust) {
			var nValue = Math.min(Math.max(nAdjustedPos * (oInfo.max - oInfo.min) / oInfo.maxPos + oInfo.min, oInfo.min), oInfo.max);
			var nAfterValue = fAdjust.call(this, nValue);
			
			if (nValue != nAfterValue) {
				nAdjustedPos = oInfo.maxPos * (nAfterValue - oInfo.min) / (oInfo.max - oInfo.min);
			}
		}
		
		nAdjustedPos = Math.max(nAdjustedPos, 0);
		nAdjustedPos = Math.min(nAdjustedPos, oInfo.maxPos);
		
		return nAdjustedPos;		
	},
	
	_getThumbIndex : function(oThumb) {
		for (var i = 0, len = this._aThumbs.length; i < len; i++) {
			if (this._aThumbs[i] == oThumb) {
				return i;
			}
		}
			
		return -1;
	},
	
	_getPosition : function(nIndex) {
		var sPos = jindo.$Element(this._aThumbs[nIndex]).css(this._htSwap.left);
		return (sPos == "auto") ? 0 : parseInt(sPos, 10);
	},
	
	_setPosition : function(nIndex, nPos) {
		this._aPoses[nIndex] = nPos;
		jindo.$Element(this._aThumbs[nIndex]).css(this._htSwap.left, nPos + 'px');
	},
	
	/**
		pixel단위로 Thumb의 위치값을 가져온다.
		
		@method positions
		@param {Number} [nIndex] 위치값을 가져올 Thumb의 index (생략시 모든 Thumb의 위치값 배열을 리턴)
		@return {Number | Array}
		@example 
			oSlider.positions(0);
			oSlider.positions();
	**/
	/**
		pixel단위로 Thumb의 위치값을 설정한다.
		
		@method positions
		@param {Number} nIndex 위치값을 설정할 Thumb의 index
		@param {Number} nPos 설정할 위치값(pixel단위)
		@param {Boolean} bFireEvent 커스텀이벤트를 발생할지의 여부
		@return {this} 객체 자신
		@example 
			oSlider.positions(0, 100);
	**/
	positions : function(nIndex, nPos, bFireEvent) {
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;	
		}

		switch (arguments.length) {
			case 0:
				var aPoses = [];
				jindo.$A(this._aThumbs).forEach(function(el, i){
					aPoses[i] = this._getPosition(i);
				}, this);
				return aPoses;
	
			case 1:
				return this._getPosition(nIndex);
				
			default:
				if (bFireEvent) {
					var htParam = { 
						nIndex : nIndex,
						nPos : nPos,
						bJump : true
					};
					if (this.fireEvent('beforeChange', htParam)) {
						var nAfterPos = this._getAdjustedPos(nIndex, htParam.nPos);
						var bChanged = (nAfterPos != this._aPoses[nIndex]);
	
						this._setPosition(nIndex, nAfterPos);
						if (bChanged) {
							this._fireChangeEvent(nIndex);
						}
					}
				    return this;
				}
				this._setPosition(nIndex, this._getAdjustedPos(nIndex, nPos));
			    return this;
		} 
	},
	
	/**
		옵션으로 설정한 nMinValue, nMaxValue에 대한 상대값으로 해당 Thumb의 위치값을 가져온다.
		
		@method values
		@param {Number} [nIndex] Value를 가져올 Thumb의 index (생략시 모든 Thumb의 위치값 배열을 리턴)
		@return {Number | Array}
		@example 
			oSlider.values(0);
			oSlider.values();
	**/
	/**
		옵션으로 설정한 nMinValue, nMaxValue에 대한 상대값으로 해당 Thumb의 위치값을 설정한다.
		
		@method values
		@param {Number} nIndex Value를 설정할 Thumb의 index
		@param {Number} nValue 설정할 위치값
		@param {Boolean} bFireEvent 커스텀이벤트를 발생할지의 여부
		@return {this} 객체 자신
		@example 
			oSlider.values(0, 0.5);
	**/
	values : function(nIndex, nValue, bFireEvent) {
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;	
		}
		
		switch (arguments.length) {
			case 0:
				var aValues = [];
				for (var i = 0, len = this._aThumbs.length; i < len; i++) {
					aValues[i] = this._getValue(i);
				}
				return aValues;
				
			case 1:
				return this._getValue(nIndex, this.positions(nIndex)); //수정
	
			default:
				var oInfo = this._getTrackInfo(nIndex);
				this.positions(nIndex, ((nValue - oInfo.min) * oInfo.maxPos / (oInfo.max - oInfo.min)) || 0, bFireEvent);
				return this;
		}
	}
}).extend(jindo.UIComponent);
/**
	@fileOverview 마우스의 롤오버 액션을 커스텀이벤트 핸들링으로 쉽게 컨트롤할 수 있게 도와주는 컴퍼넌트
	@version 1.1.0
**/
/**
	마우스 이벤트에 따라 롤오버효과를 쉽게 처리할 수 있게 도와주는 컴포넌트
	RolloverArea 컴포넌트는 기준 엘리먼트의 자식들 중 특정 클래스명을 가진 엘리먼트에 마우스액션이 있을 경우 클래스명을 변경하는 이벤트를 발생시킨다.
	
	@class jindo.RolloverArea
	@extends jindo.UIComponent
	@keyword rolloverarea, area, 롤오버에어리어
**/
jindo.RolloverArea = jindo.$Class({
	/** @lends jindo.RolloverArea.prototype */
	  
	/**
		RolloverArea 컴포넌트를 초기화한다.
		
		@constructor
		@param {HTMLElement} el 상위 기준 엘리먼트. 컴포넌트가 적용되는 영역(Area)이 된다.
		@param {Object} [htOption] 옵션 객체
			@param {String} [htOption.sClassName="rollover"] RolloverArea 컴포넌트가 적용될 HTMLElement의 클래스명
			@param {String} [htOption.sClassPrefix="rollover-"] MouseOver, MouseDown이벤트 발생시 HTMLElement에 추가될 클래스명의 Prefix
			@param {Boolean} [htOption.bCheckMouseDown=true] MouseDown, MouseUp 이벤트를 사용여부. (false면 down, up시 클래스가 추가되지 않으며, 커스텀 함수도 발생하지 않음)
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 초기화 시점에 컴포넌트를 활성화(이벤트 바인딩) 시킬지 여부. false로 지정한경우에는 사용자가 직접 activate함수를 사용하여 활성화시킬수 있다.
			@param {Object} [htOption.htStatus] MouseOver, Down 이벤트 발생시 추가될 클래스명
			@param {String} [htOption.htStatus.sOver="over"] TODO : 파라미터 설명달기
			@param {String} [htOption.htStatus.sDown="down"] TODO : 파라미터 설명달기
		@example
			var oRolloverArea = new jindo.RolloverArea(document.body,{bActivateOnload:false, ... });
			oRolloverArea.activate();
		@example
			var oRolloverArea = new jindo.RolloverArea(document.body,{
			sClassPrefix : 'rollover-', htStatus : {
				sOver : "over", // MouseOver시 추가되는 클래스명 "rollover-over"
				sDown : "down" // MouseDown시 추가되는 클래스명 "rollover-down"
			}});
	**/
	$init : function(el, htOption) {
		this.option({ 
			sClassName : "rollover", 
			sClassPrefix : "rollover-",
			bCheckMouseDown : true,
			bActivateOnload : true,
			htStatus : {
				sOver : "over",
				sDown : "down"
			} 
		});
		this.option(htOption || {});
		
		this._elArea = jindo.$(el);
		this._aOveredElements = [];
		this._aDownedElements = [];
		this._wfMouseOver = jindo.$Fn(this._onMouseOver, this);
		this._wfMouseOut = jindo.$Fn(this._onMouseOut, this);
		this._wfMouseDown = jindo.$Fn(this._onMouseDown, this);
		this._wfMouseUp = jindo.$Fn(this._onMouseUp, this);
		
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},
	
	_addOvered : function(el) {
		this._aOveredElements.push(el);
	},
	
	_removeOvered : function(el) {
		this._aOveredElements.splice(jindo.$A(this._aOveredElements).indexOf(el), 1);
	},
	
	_addStatus : function(el, sStatus) {
		jindo.$Element(el).addClass(this.option('sClassPrefix') + sStatus);
	},
	
	_removeStatus : function(el, sStatus) {
		jindo.$Element(el).removeClass(this.option('sClassPrefix') + sStatus);
	},
	
	_isInnerElement : function(elParent, elChild) {
		return elParent === elChild ? true : jindo.$Element(elParent).isParentOf(elChild);
	},
	
	/**
		RolloverArea를 활성화시킨다.
		@return {this}
	**/
	_onActivate : function() {
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._elArea).preventTapHighlight(true);
		this._wfMouseOver.attach(this._elArea, 'mouseover');
		this._wfMouseOut.attach(this._elArea, 'mouseout');
		if (this.option("bCheckMouseDown")) {
			this._wfMouseDown.attach(this._elArea, 'mousedown');
			this._wfMouseUp.attach(document, 'mouseup');
		}
	},
	
	/**
		RolloverArea를 비활성화시킨다.
		@return {this}
	**/
	_onDeactivate : function() {
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._elArea).preventTapHighlight(false);
		this._wfMouseOver.detach(this._elArea, 'mouseover');
		this._wfMouseOut.detach(this._elArea, 'mouseout');
		this._wfMouseDown.detach(this._elArea, 'mousedown');
		this._wfMouseUp.detach(document, 'mouseup');
		
		this._aOveredElements.length = 0;
		this._aDownedElements.length = 0;
	},
	
	_findRollover : function(el) {
		var sClassName = this.option('sClassName');
		return jindo.$$.test(el, '.' + sClassName) ? el : jindo.$$.getSingle('! .' + sClassName, el);
	},
	
	_onMouseOver : function(we) {
		var el = we.element,
			elRelated = we.relatedElement,
			htParam;
		
		for (; (el = this._findRollover(el)); el = el.parentNode) {
			if (elRelated && this._isInnerElement(el, elRelated)) {
				continue;
			}
			
			this._addOvered(el);
				
			htParam = { 
				element : el,
				htStatus : this.option("htStatus"),
				weEvent : we
			};
			
			/**
				MouseOver 이벤트 발생시 (적용된 Element에 마우스가 커서가 올라간 경우)
				
				@event over
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@param {Function} stop 수행시 클래스명이 추가되지 않는다.
				@example
					oRolloverArea.attach("over", function(oCustomEvent) { ... });
			**/
			if (this.fireEvent('over', htParam)) {
				this._addStatus(htParam.element, htParam.htStatus.sOver);
			} 
		}
	},
	
	_onMouseOut : function(we) {
		var el = we.element,
			elRelated = we.relatedElement,
			htParam;
		
		for (; (el = this._findRollover(el)); el = el.parentNode) {
			if (elRelated && this._isInnerElement(el, elRelated)) {
				continue;
			} 
			
			this._removeOvered(el);
				
			htParam = { 
				element : el,
				htStatus : this.option("htStatus"),
				weEvent : we
			};
			
			/**
				MouseOut 이벤트 발생시 (적용된 Element에서 마우스가 빠져나간 경우)
				
				@event out
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@param {Function} stop 수행시 클래스명이 제거되지 않는다.
				@example
					oRolloverArea.attach("out", function(oCustomEvent) { ... });
			**/
			if (this.fireEvent('out', htParam)) {
				this._removeStatus(htParam.element, htParam.htStatus.sOver);
			} 
		}
	},
	
	_onMouseDown : function(we) {
		var el = we.element,
			htParam;
			
		while ((el = this._findRollover(el))) {
			htParam = { 
				element : el,
				htStatus : this.option("htStatus"),
				weEvent : we
			};
			this._aDownedElements.push(el);
			
			/**
				MouseDown 이벤트 발생시 (적용된 Element 위에서 마우스 버튼이 눌린 경우 발생)
				
				@event down
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement}element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@param {Function} stop 수행시 클래스명이 추가되지 않는다
				@example
					oRolloverArea.attach("down", function(oCustomEvent) { ... });
			**/
			if (this.fireEvent('down', htParam)) {
				this._addStatus(htParam.element, htParam.htStatus.sDown);
			}
			
			el = el.parentNode;
		}
	},
	
	_onMouseUp : function(we) {
		var el = we.element,
			aTargetElementDatas = [],		
			aDownedElements = this._aDownedElements,
			htParam,
			elMouseDown,
			i;
		
		for (i = 0; (elMouseDown = aDownedElements[i]); i++) {
			aTargetElementDatas.push({ 
				element : elMouseDown,
				htStatus : this.option("htStatus"),
				weEvent : we
			});
		}
		
		for (; (el = this._findRollover(el)); el = el.parentNode) {
			if (jindo.$A(aDownedElements).indexOf(el) > -1) {
				continue;
			}
			
			aTargetElementDatas.push({ 
				element : el,
				htStatus : this.option("htStatus"),
				weEvent : we
			});
		}
		
		for (i = 0; (htParam = aTargetElementDatas[i]); i++) {
			/**
				MouseUp 이벤트 발생시 (적용된 Element에 마우스를 눌렀다가 놓은경우 발생)
				
				@event up
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@param {Function}stop 수행시 클래스명이 제거되지 않는다
				@example
					oRolloverArea.attach("up", function(oCustomEvent) { ... });
			**/
			if (this.fireEvent('up', htParam)) {
				this._removeStatus(htParam.element, htParam.htStatus.sDown);
			}		
		}
		
		this._aDownedElements = [];
	}
}).extend(jindo.UIComponent);

/**
	@fileOverview 엘리먼트의 css 스타일을 조정해 부드러운 움직임(변형)을 표현하는 컴포넌트
	@version 1.1.0
**/
/**
	엘리먼트의 css style의 변화를 주어 움직이는 효과를 주는 컴포넌트
	
	@class jindo.Transition
	@extends jindo.Component
	@requires jindo.Effect
	@requires jindo.Timer
	@keyword transition, 트랜지션
**/
jindo.Transition = jindo.$Class({
	/** @lends jindo.Transition.prototype */
	_nFPS : 30,
	
	_aTaskQueue : null,
	_oTimer : null,
	
	_bIsWaiting : true, // 큐의 다음 동작을 하길 기다리는 상태
	_bIsPlaying : false, // 재생되고 있는 상태
	
	/**
		Transition 컴포넌트를 초기화한다.
		
		@constructor
		@param {Object} [htOption] 옵션 객체
			@param {Function} [htOption.fEffect=jindo.Effect.linear] jindo.Effect 이펙트 함수
			@param {Boolean} [htOption.bCorrection=false] 소수점에 의해 어긋나는 사이즈를 보정할지 여부
	**/
	$init : function(htOption) {
		this._aTaskQueue = [];
		this._oTimer = new jindo.Timer();
		this._oSleepTimer = new jindo.Timer();
		
		this.option({ 
			fEffect : jindo.Effect.linear, 
			bCorrection : false 
		});
		this.option(htOption || {});
	},

	/**
		효과가 재생될 초당 frame rate를 가져온다.
		
		@method fps
		@return {Number} 
	**/
	/**
		효과가 재생될 초당 frame rate를 설정한다.
		
		@method fps
		@param {Number} nFPS
		@return {this} 
	**/
	fps : function(nFPS) {
		if (arguments.length > 0) {
			this._nFPS = nFPS;
			return this;
		}
		
		return this._nFPS;
	},
	
	/**
		트랜지션이 진행중인지 여부를 가져온다.
		
		@method isPlaying
		@return {Boolean}
	**/
	isPlaying : function() {
		return this._bIsPlaying;
	},
	
	/**
		진행되고 있는 Transition을 중지시킨다.
		
		@method abort
		@return {this}
	**/
	abort : function() {
		this._aTaskQueue = [];
		this._oTimer.abort();
		this._oSleepTimer.abort();
		
		if (this._bIsPlaying) {
			/**
				Transition이 중단되었을 때 발생
				
				@event abort
				@param {String} sType 커스텀이벤트명
				@example
					// Transition이 중단되었을 때 실행 될 함수 구현.
					oTransition.attach("abort", function() { ... });
			**/
			this.fireEvent("abort");
		}

		this._bIsWaiting = true;
		this._bIsPlaying = false;
		
		this._htTaskToDo = null;
		return this;
	},
	
	/**
		Transition을 수행한다.
		파라메터를 지정(queue 메소드와 동일)하였을 경우에는 해당 동작을 바로 실행시키고, 파라메터가 생략되었을 때에는 지금까지 queue()로 지정된 동작들을 시작시킨다.
		파라메터는 function타입으로 지정하여 콜백을 수행할수 있다. (예제 참고)
		
		@method start
		@param {Number} nDuration Transition이 진행될 시간
		@param {Array} aCommand 적용할 명령셋
		@return {this}
		@see jindo.Transition#queue
		@example
			oTransition.start(1000,
				jindo.$("foo"), {
					'@left' : '200px'
				}
			));
		@example
			oTransition.start(1000, [
				[jindo.$("foo"), {
					'@left' : '200px'
				}],
				
				[jindo.$("bar"), {
					'@top' : '200px'
				}]
			]));
		@example
			oTransition.queue(1000,
				jindo.$("foo"), {
					'@left' : '200px'
				}
			));
			oTransition.start();
	**/
	start : function(nDuration, elTarget, htInfo) {
		if (arguments.length > 0) {
			this.queue.apply(this, arguments);
		}
		
		this._prepareNextTask();
		return this;
	},
	
	/**
		Transition을 큐에 담는다.
		여러 단계의 Transition을 담아두고 순차적으로 실행시킬때 사용한다. start() 메소드가 호출되기 전까지 수행되지 않는다.
		파라메터 aCommand는 [(HTMLElement)엘리먼트, (HashTable)Transition정보]로 구성되어야 하고, 여러명령을 동시에 적용할 수 있다.
		파라메터로 function을 지정하여 콜백을 등록할 수 있다.
		
		@method queue
		@param {Number} nDuration Transition이 진행될 시간
		@param {Array} aCommand 적용할 명령셋
		@return {this}
		@see jindo.Transition#start
		@example
			// 하나의 엘리먼트에 여러개의 명령을 지정하는 예제
			oTransition.queue(1000,
				jindo.$("foo"), {
					'@left' : '200px',
					'@top' : '50px',
					'@width' : '200px',
					'@height' : '200px',
					'@backgroundColor' : [ '#07f', 'rgb(255, 127, 127)' ]
				}
			); 
		@example
			// 여러개의 엘리먼트에 명령을 지정하는 예 1
			oTransition.queue(1000,
				jindo.$("foo"), {
					"@left" : jindo.Effect.linear("200px")
				},
				jindo.$("bar"), {
					"@top" : jindo.Effect.easeOut("200px")
				}
			);
		@example
			// 여러개의 엘리먼트에 명령을 지정하는 예 2
			oTransition.queue(1000, [
				[jindo.$("foo"), {
					"@left" : jindo.Effect.linear("200px")
				}],
				[jindo.$("bar"), {
					"@top" : jindo.Effect.easeIn("200px")
				}]
			]);  
		@example
			// 엘리먼트를 getter / setter 함수로 지정하는 예  
			oTransition.queue(1000, [
				[{
					getter : function(sKey) {
						return jindo.$Element("foo")[sKey]();
					},
					
					setter : function(sKey, sValue) {
						jindo.$Element("foo")[sKey](parseFloat(sValue));
					}
				}, {
					'height' : jindo.Effect.easeIn(100)
				}]
			]);  
		@example
			// 파라메터로 function을 지정하여 콜백을 수행하는 예제
			oTransition.start(function(){
				alert("end")
			});
	**/
	queue : function(nDuration, aCommand) {
		var htTask;
		if (typeof arguments[0] == 'function') {
			htTask = {
				sType : "function",
				fTask : arguments[0]
			};
		} else {
			var a = [];
			if (arguments[1] instanceof Array) {
				a = arguments[1];
			} else {
				var aInner = [];
				jindo.$A(arguments).forEach(function(v, i){
					if (i > 0) {
						aInner.push(v);
						if (i % 2 === 0) {
							a.push(aInner.concat());
							aInner = [];
						} 
					}
				});
			}
			
			htTask = {
				sType : "task",
				nDuration : nDuration, 
				aList : []
			};
			
			for (var i = 0, nLen = a.length; i < nLen; i ++) {
				var aValue = [],
					htArg = a[i][1],
					sEnd;
				
				for (var sKey in htArg) {
					sEnd = htArg[sKey];
					if (/^(@|style\.)(\w+)/i.test(sKey)) {
						aValue.push([ "style", RegExp.$2, sEnd ]);
					} else {
						aValue.push([ "attr", sKey, sEnd ]);
					}
				}
				
				htTask.aList.push({
					elTarget : a[i][0],
					aValue : aValue
				});
			}
		}
		this._queueTask(htTask);
		
		return this;
	},
	
	/**
		진행되고 있는 Transition을 일시중지시킨다.
		Transition이 진행중일때만 가능하다. (sleep 상태일 때에는 불가능)
		
		@method pause
		@return {this}
	**/
	pause : function() {
		if (this._oTimer.abort()) {
			/**
				Transition이 일시정지 되었을 때 발생
				
				@event pause
				@param {String} sType 커스텀이벤트명
				@example
					// Transition이 일시정지 되었을 때 실행 될 함수 구현.
					oTransition.attach("pause", function() { ... });
			**/
			this.fireEvent("pause");
		}
		return this;
	},
	
	/**
		일시중지된 Transition을 재시작시킨다.
		
		@method resume
		@return {this}
	**/
	resume : function() {
		if (this._htTaskToDo) {
			if (this._bIsWaiting === false && this._bIsPlaying === true) {
				/**
					Transition이 재시작 될 때 발생
					
					@event resume
					@param {String} sType 커스텀이벤트명
					@example
						// Transition이 재시작 될 때 실행 될 함수 구현.
						oTransition.attach("resume", function() { ... });
				**/
				this.fireEvent("resume");
			}
			
			this._doTask();
			
			this._bIsWaiting = false;
			this._bIsPlaying = true;
		
			var self = this;
			this._oTimer.start(function() {
				var bEnd = !self._doTask();
				if (bEnd) {
					self._bIsWaiting = true;
					setTimeout(function() { 
						self._prepareNextTask(); 
					}, 0);
				}
				
				return !bEnd;
			}, this._htTaskToDo.nInterval);
		}
		return this;
	},
	
	/**
		지정된 Transition이 종료된 이후에 또 다른 Transition 을 수행한다.
		start() 메소드는 더이상 현재 진행중인 Transition을 abort시키지 않는다.
		
		@method precede
		@return {this}
		@deprecated start() 사용권장
	**/
	precede : function(nDuration, elTarget, htInfo) {
		this.start.apply(this, arguments);
		return this;
	},
	
	/**
		현재의 Transition 종료 후 다음 Transition 진행하기전에 지정된 시간만큼 동작을 지연한다.
		
		@method sleep
		@param {Number} nDuration 지연할 시간
		@param {Function} fCallback 지연이 시작될때 수행될 콜백함수 (생략가능)
		@return {this}
		@example
			oTransition.start(1000, jindo.$("foo"), {
				"@left" : jindo.Effect.linear(oPos.pageX + "px")
			}).sleep(500).start(1000, jindo.$("bar"), {
				"@top" : jindo.Effect.easeOut(oPos.pageY + "px")
			});
	**/
	sleep : function(nDuration, fCallback) {
		if (typeof fCallback == "undefined") {
			fCallback = function(){};
		}
		this._queueTask({
			sType : "sleep",
			nDuration : nDuration,
			fCallback : fCallback 
		});
		this._prepareNextTask();
		return this;
	},
	
	_queueTask : function(v) {
		this._aTaskQueue.push(v);
	},
	
	_dequeueTask : function() {
		var htTask = this._aTaskQueue.shift();
		if (htTask) {
			if (htTask.sType == "task") {
				var aList = htTask.aList;
				for (var i = 0, nLength = aList.length; i < nLength; i++) {
					
					var elTarget = aList[i].elTarget,
						welTarget = null;
					
					for (var j = 0, aValue = aList[i].aValue, nJLen = aValue.length; j < nJLen; j++) {
						var sType = aValue[j][0],
							sKey = aValue[j][1],
							fFunc = aValue[j][2];
						
						if (typeof fFunc != "function") {
							var fEffect = this.option("fEffect");
							if (fFunc instanceof Array) {
								fFunc = fEffect(fFunc[0], fFunc[1]);
							} else {
								fFunc = fEffect(fFunc);
							}
							aValue[j][2] = fFunc;
						}
						
						if (fFunc.setStart) {
							if (this._isHTMLElement(elTarget)) {
								welTarget = welTarget || jindo.$Element(elTarget);
								switch (sType) {
									case "style":
										fFunc.setStart(welTarget.css(sKey));
										break;
										
									case "attr":
										fFunc.setStart(welTarget.$value()[sKey]);
										break;
								}
							} else {
								fFunc.setStart(elTarget.getter(sKey));
							}
						}
					}
				}
			}
			return htTask;
		} else {
			return null;
		}
	},
	
	_prepareNextTask : function() {
		if (this._bIsWaiting) {
			var htTask = this._dequeueTask();
			if (htTask) {
				switch (htTask.sType) {
					case "task":
						if (!this._bIsPlaying) {
							/**
								Transition이 시작될 때 발생.
								
								@event start
								@param sType {String} 커스텀이벤트명
								@example
									// Transition이 시작될 때 실행 될 함수 구현.
									oTransition.attach("start", function() { ... });
							**/
							this.fireEvent("start");
						}
						var nInterval = 1000 / this._nFPS,
							nGap = nInterval / htTask.nDuration;
						
						this._htTaskToDo = {
							aList: htTask.aList,
							nRatio: 0,
							nInterval: nInterval,
							nGap: nGap,
							nStep: 0,
							nTotalStep: Math.ceil(htTask.nDuration / nInterval)
						};
						
						this.resume();
						break;
					case "function":
						if (!this._bIsPlaying) {
							this.fireEvent("start");
						}
						htTask.fTask();
						this._prepareNextTask();
						break;
					case "sleep":
						if (this._bIsPlaying) {
							/**
								Transition이 휴면 상태일 때 발생
								
								@event sleep
								@param {String} sType 커스텀이벤트명
								@param {Number} nDuration 휴면 시간
								@example
									// Transition이 휴면 상태일 때 실행 될 함수 구현.
									oTransition.attach("sleep", function(oCustomEvent) { ... });
							**/
							this.fireEvent("sleep", {
								nDuration: htTask.nDuration
							});
							htTask.fCallback();
						}
						var self = this;
						this._oSleepTimer.start(function(){
							/**
								Transition이 휴면상태에서 깨어났을 때 발생
								
								@event awake
								@param {String} sType 커스텀이벤트명
								@example
									// Transition이 휴면상태에서 깨어났을 때 실행 될 함수 구현.
									oTransition.attach("awake", function() { ... });
							**/
							self.fireEvent("awake");
							self._prepareNextTask();
						}, htTask.nDuration);
						break;
				}
			} else {
				if (this._bIsPlaying) {
					this._bIsPlaying = false;
					this.abort();
					/**
						Transition이 끝났을 때 발생
						
						@event end
						@param sType (String) : 커스텀이벤트명
						@example
							// Transition이 끝날 때 실행 될 함수 구현.
							oTransition.attach("end", function() { ... });
					**/
					this.fireEvent("end");
				}
			}
		}
	},
	
	_isHTMLElement : function(el) {
		return ("tagName" in el);
	},
	
	_doTask : function() {
		// Task Queue가 존재하지 않는 경우,
		if (!this._htTaskToDo) {
			return false;
		}

		var htTaskToDo = this._htTaskToDo,
			nRatio = parseFloat(htTaskToDo.nRatio.toFixed(5), 1),
			nStep = htTaskToDo.nStep,
			nTotalStep = htTaskToDo.nTotalStep,
			aList = htTaskToDo.aList,
			htCorrection = {},
			bCorrection = this.option("bCorrection");
		
		for (var i = 0, nLength = aList.length; i < nLength; i++) {
			var elTarget = aList[i].elTarget,
				welTarget = null;
			
			for (var j = 0, aValue = aList[i].aValue, nJLen = aValue.length; j < nJLen; j++) {
				var sType = aValue[j][0],
					sKey = aValue[j][1],
					sValue = aValue[j][2](nRatio);
				
				if (this._isHTMLElement(elTarget)) {
					if (bCorrection) {
						var sUnit = /^\-?[0-9\.]+(%|px|pt|em)?$/.test(sValue) && RegExp.$1 || "";
						if (sUnit) {
							var nValue = parseFloat(sValue);
							nValue += htCorrection[sKey] || 0;
							nValue = parseFloat(nValue.toFixed(5));
							if (i == nLength - 1) {
								sValue = Math.round(nValue) + sUnit;
							} else {
								htCorrection[sKey] = nValue - Math.floor(nValue);
								sValue = parseInt(nValue, 10) + sUnit;
							}
						}
					}
					
					welTarget = welTarget || jindo.$Element(elTarget);
					
					switch (sType) {
						case "style":
							welTarget.css(sKey, sValue);
							break;
							
						case "attr":
							welTarget.$value()[sKey] = sValue;
							break;
					}
				} else {
					elTarget.setter(sKey, sValue);
				}
				
				if (this._bIsPlaying) {
					/**
						Transition이 진행되는 매 단계에 발생
						
						@event playing
						@param {String} sType 커스텀이벤트명
						@param {HTMLElement} element 변화되고있는 객체
						@param {String} sKey 변화할 대상
						@param {String} sValue 변화할 값
						@param {Number} nStep 현재의 Transition의 단계
						@param {Number} nTotalStep Transition이 완료되기까지 playing 커스텀이벤트가 발생할 횟수
						@example
							// Transition이 진행되는 매 단계에 실행 될 함수 구현.
							oTransition.attach("playing", function(oCustomEvent) { ... });
					**/
					this.fireEvent("playing", {
						element : elTarget,
						sKey : sKey,
						sValue : sValue,
						nStep : nStep,
						nTotalStep : nTotalStep
					});
				}
			}
		}
		htTaskToDo.nRatio = Math.min(htTaskToDo.nRatio + htTaskToDo.nGap, 1);
		htTaskToDo.nStep += 1;
		return nRatio != 1;
	}
}).extend(jindo.Component);

// jindo.$Element.prototype.css 패치
(function() {
	
	var b = jindo.$Element.prototype.css;
	jindo.$Element.prototype.css = function(k, v) {
		if (k == "opacity") {
			return typeof v != "undefined" ? this.opacity(parseFloat(v)) : this.opacity();
		} else {
			return typeof v != "undefined" ? b.call(this, k, v) : b.call(this, k);
		}
	};
})();
/**
	@fileOverview HTML Element를 Drag할 수 있게 해주는 컴포넌트
	@author hooriza, modified by senxation
	@version 1.1.0
**/

/**
	HTML Element를 Drag할 수 있게 해주는 컴포넌트
	DragArea 컴포넌트는 상위 기준 엘리먼트의 자식들 중 특정 클래스명을 가진 모든 엘리먼트를 Drag 가능하게 하는 기능을 한다.
	
	@class jindo.DragArea
	@extends jindo.UIComponent
	
	@keyword drag, area, 드래그&드랍, 드래그, 영역
**/
jindo.DragArea = jindo.$Class({
	/** @lends jindo.DragArea.prototype */
	
	/**
		DragArea 컴포넌트를 생성한다.
		@constructor
		@param {HTMLElement} el Drag될 엘리먼트들의 상위 기준 엘리먼트. 컴포넌트가 적용되는 영역(Area)이 된다.
		@param {Object} [htOption] 옵션 객체
			@param {String} [htOption.sClassName="draggable"] 드래그 될 엘리먼트의 클래스명. 상위 기준 엘리먼트의 자식 중 해당 클래스명을 가진 모든 엘리먼트는 드래그가능하게 된다.
			@param {Boolean} [htOption.bFlowOut=true] 드래그될 엘리먼트가 상위 기준 엘리먼트의 영역을 벗어날 수 있는지의 여부. 상위 엘리먼트의 크기가 드래그되는 객체보다 크거나 같아야지만 동작한다. 작은 경우 document사이즈로 제한한다.
			@param {Boolean} [htOption.bSetCapture=true] ie에서 setCapture() 명령 사용여부
			@param {Number} [htOption.nThreshold=0] 드래그가 시작되기 위한 최소 역치값(px)
		@example
			var oDragArea = new jindo.DragArea(document, {
				"sClassName" : 'dragable', // (String) 상위 기준 엘리먼트의 자식 중 해당 클래스명을 가진 모든 엘리먼트는 Drag 가능하게 된다. 
				"bFlowOut" : true, // (Boolean) 드래그될 엘리먼트가 상위 기준 엘리먼트의 영역을 벗어날 수 있는지의 여부. 상위 엘리먼트의 크기가 드래그되는 객체보다 크거나 같아야지만 동작하도록 수정. 작은 경우 document사이즈로 제한한다.
				"bSetCapture" : true, //ie에서 setCapture 사용여부
				"nThreshold" : 0 // (Number) 드래그가 시작되기 위한 최소 역치값(px) 
			}).attach({
				handleDown : function(oCustomEvent) {
					//드래그될 handle 에 마우스가 클릭되었을 때 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 될 엘리먼트 (핸들을 드래그하여 레이어 전체를 드래그되도록 하고 싶으면 이 값을 설정한다. 아래 예제코드 참고)
					//	weEvent : (jindo.$Event) mousedown시 발생되는 jindo.$Event 객체
					//};
					//oCustomEvent.stop(); 이 수행되면 dragStart 이벤트가 발생하지 않고 중단된다.
				},
				dragStart : function(oCustomEvent) {
					//드래그가 시작될 때 발생 (마우스 클릭 후 첫 움직일 때 한 번)
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elArea : (HTMLElement) 기준 엘리먼트
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 될 엘리먼트 (핸들을 드래그하여 레이어 전체를 드래그되도록 하고 싶으면 이 값을 설정한다. 아래 예제코드 참고)
					//	htDiff : (HashTable) handledown된 좌표와 dragstart된 좌표의 차이 htDiff.nPageX, htDiff.nPageY
					//	weEvent : (jindo.$Event) 마우스 이동 중 (mousemove) 발생되는 jindo.$Event 객체
					//};
					//oCustomEvent.stop(); 이 수행되면 뒤따르는 beforedrag 이벤트가 발생하지 않고 중단된다.
				},
				beforeDrag : function(oCustomEvent) {
					//드래그가 시작되고 엘리먼트가 이동되기 직전에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elArea : (HTMLElement) 기준 엘리먼트
					//	elFlowOut : (HTMLElement) bFlowOut 옵션이 적용될 상위 기준 엘리먼트 (변경가능)
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 될 엘리먼트
					//	weEvent : (jindo.$Event) 마우스 이동 중 (mousemove) 발생되는 jindo.$Event 객체
					//	nX : (Number) 드래그 될 x좌표. 이 좌표로 엘리먼트가 이동 된다.
					//	nY : (Number) 드래그 될 y좌표. 이 좌표로 엘리먼트가 이동 된다.
					//	nGapX : (Number) 드래그가 시작된 x좌표와의 차이
					//	nGapY : (Number) 드래그가 시작된 y좌표와의 차이
					//};
					//oCustomEvent.stop(); 이 수행되면 뒤따르는 drag 이벤트가 발생하지 않고 중단된다.
					//oCustomEvent.nX = null; // 가로로는 안 움직이게
					//oCustomEvent.nX = Math.round(oCustomEvent.nX / 20) * 20;
					//oCustomEvent.nY = Math.round(oCustomEvent.nY / 20) * 20;
					//if (oCustomEvent.nX < 0) oCustomEvent.nX = 0;
					//if (oCustomEvent.nY < 0) oCustomEvent.nY = 0;
				},
				drag : function(oCustomEvent) {
					//드래그 엘리먼트가 이동하는 중에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elArea : (HTMLElement) 기준 엘리먼트
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 될 엘리먼트
					//	weEvent : (jindo.$Event) 마우스 이동 중 (mousemove) 발생되는 jindo.$Event 객체
					//	nX : (Number) 드래그 된 x좌표. 이 좌표로 엘리먼트가 이동 된다.
					//	nY : (Number) 드래그 된 y좌표. 이 좌표로 엘리먼트가 이동 된다.
					//	nGapX : (Number) 드래그가 시작된 x좌표와의 차이
					//	nGapY : (Number) 드래그가 시작된 y좌표와의 차이
					//};
				},
				dragEnd : function(oCustomEvent) {
					//드래그(엘리먼트 이동)가 완료된 후에 발생 (mouseup시 1회 발생. 뒤이어 handleup 발생)
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elArea : (HTMLElement) 기준 엘리먼트
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 된 엘리먼트
					//	bInterupted : (Boolean) 드래그중 stopDragging() 호출로 강제적으로 드래그가 종료되었는지의 여부
					//	nX : (Number) 드래그 된 x좌표.
					//	nY : (Number) 드래그 된 y좌표.
					//}
				},
				handleUp : function(oCustomEvent) {
					//드래그된 handle에 마우스 클릭이 해제됬을 때 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elHandle : (HTMLElement) 옵션의 className으로 설정된 드래그 된 핸들 엘리먼트 (mousedown된 엘리먼트)
					//	elDrag : (HTMLElement) 실제로 드래그 된 엘리먼트
					//	weEvent : (jindo.$Event) mouseup시 발생되는 jindo.$Event 객체 
					//};
				}
			});
	**/
	$init : function(el, htOption) {
		this.option({
			sClassName : 'draggable',
			bFlowOut : true,
			bSetCapture : true, //ie에서 bSetCapture 사용여부
			nThreshold : 0
		});
		
		this.option(htOption || {});
		
		this._el = el;
		
		this._bIE = jindo.$Agent().navigator().ie;
		
		this._htDragInfo = {
			"bIsDragging" : false,
			"bPrepared" : false, //mousedown이 되었을때 true, 이동중엔 false
			"bHandleDown" : false,
			"bForceDrag" : false
		};

		this._wfOnMouseDown = jindo.$Fn(this._onMouseDown, this);
		this._wfOnMouseMove = jindo.$Fn(this._onMouseMove, this);
		this._wfOnMouseUp = jindo.$Fn(this._onMouseUp, this);
		
		this._wfOnDragStart = jindo.$Fn(this._onDragStart, this);
		this._wfOnSelectStart = jindo.$Fn(this._onSelectStart, this);
		
		this.activate();
	},
	
	_findDraggableElement : function(el) {
		if (el.nodeType === 1 && jindo.$$.test(el, "input[type=text], textarea, select")){
			return null;
		} 
		
		var self = this;
		var sClass = '.' + this.option('sClassName');
		
		var isChildOfDragArea = function(el) {
			if (el === null) {
				return false;
			}
			if (self._el === document || self._el === el) {
				return true;
			} 
			return jindo.$Element(self._el).isParentOf(el);
		};
		
		var elReturn = jindo.$$.test(el, sClass) ? el : jindo.$$.getSingle('! ' + sClass, el);
		if (!isChildOfDragArea(elReturn)) {
			elReturn = null;
		}
		return elReturn;
	},
	
	/**
		레이어가 현재 드래그 되고 있는지 여부를 가져온다.
		
		@method isDragging
		@return {Boolean} 레이어가 현재 드래그 되고 있는지 여부
	**/
	isDragging : function() {
		var htDragInfo = this._htDragInfo; 
		return htDragInfo.bIsDragging && !htDragInfo.bPrepared;
	},
	
	/**
		드래그를 강제 종료시킨다.
		
		@method stopDragging
		@return {this}
	**/
	stopDragging : function() {
		this._stopDragging(true);
		return this;
	},
	
	_stopDragging : function(bInterupted) {
		this._wfOnMouseMove.detach(document, 'mousemove');
		this._wfOnMouseUp.detach(document, 'mouseup');
		
		if (this.isDragging()) {
			var htDragInfo = this._htDragInfo,
				welDrag = jindo.$Element(htDragInfo.elDrag);
			
			htDragInfo.bIsDragging = false;
			htDragInfo.bForceDrag = false;
			htDragInfo.bPrepared = false;
			
			if(this._bIE && this._elSetCapture) {
				this._elSetCapture.releaseCapture();
				this._elSetCapture = null;
			}
			
			/**
				드래그(엘리먼트 이동)가 완료된 후에 발생 (mouseup시 1회 발생. 뒤이어 handleup 발생)
				
				@event dragEnd
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} elArea 기준 엘리먼트
				@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
				@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
				@param {Boolean} bInterupted 드래그중 stopDragging() 호출로 강제적으로 드래그가 종료되었는지의 여부
				@param {Number} nX 드래그 된 x좌표.
				@param {Number} nY 드래그 된 y좌표.
				@example
					// 커스텀이벤트 핸들링 예제
					oDragArea.attach("dragEnd", function(oCustomEvent) {
						//~~
					});
			**/
			this.fireEvent('dragEnd', {
				"elArea" : this._el,
				"elHandle" : htDragInfo.elHandle,
				"elDrag" : htDragInfo.elDrag,
				"nX" : parseInt(welDrag.css("left"), 10) || 0,
				"nY" : parseInt(welDrag.css("top"), 10) || 0,
				"bInterupted" : bInterupted
			});
		}
	},
	
	/**
		DragArea 동작을 위한 mousedown, dragstart, selectstart 이벤트를 attach 한다. 
	**/
	_onActivate : function() {
		this._wfOnMouseDown.attach(this._el, 'mousedown');
		this._wfOnDragStart.attach(this._el, 'dragstart'); // for IE
		this._wfOnSelectStart.attach(this._el, 'selectstart'); // for IE	
	},
	
	/**
		DragArea 동작을 위한 mousedown, dragstart, selectstart 이벤트를 detach 한다. 
	**/
	_onDeactivate : function() {
		this._wfOnMouseDown.detach(this._el, 'mousedown');
		this._wfOnDragStart.detach(this._el, 'dragstart'); // for IE
		this._wfOnSelectStart.detach(this._el, 'selectstart'); // for IE
	},
	
	/**
		이벤트를 attach한다.
		
		@method attachEvent
		@deprecated activate() 사용권장
	**/
	attachEvent : function() {
		this.activate();
	},
	
	/**
		이벤트를 detach한다.
		
		@method detachEvent
		@deprecated deactivate() 사용권장
	**/
	detachEvent : function() {
		this.deactivate();
	},
	
	/**
		이벤트의 attach 여부를 가져온다.
		
		@method isEventAttached
		@deprecated isActivating() 사용권장
	**/
	isEventAttached : function() {
		return this.isActivating();
	},
	
	/**
		마우스다운이벤트와 관계없이 지정된 엘리먼트를 드래그 시작한다.
		
		@method startDragging
		@param {HTMLElement} el 드래그할 엘리먼트
		@return {Boolean} 드래그시작여부
	**/
	startDragging : function(el) {
		var elDrag = this._findDraggableElement(el);
		if (elDrag) {
			this._htDragInfo.bForceDrag = true;
			this._htDragInfo.bPrepared = true;
			this._htDragInfo.elHandle = elDrag;
			this._htDragInfo.elDrag = elDrag;
			
			this._wfOnMouseMove.attach(document, 'mousemove');
			this._wfOnMouseUp.attach(document, 'mouseup');
			return true;
		}
		return false;
	},
	
	_onMouseDown : function(we) {
		
		var mouse = we.mouse(true);
		
		/* IE에서 네이버 툴바의 마우스제스처 기능 사용시 우클릭하면 e.mouse().right가 false로 들어오므로 left값으로만 처리하도록 수정 */
		if (!mouse.left || mouse.right || mouse.scrollbar) {
			this._stopDragging(true);
			return;
		}
		
		// 드래그 할 객체 찾기
		var el = this._findDraggableElement(we.element);
		if (el) {
			var oPos = we.pos(),
				htDragInfo = this._htDragInfo;
			
			htDragInfo.bHandleDown = true;
			htDragInfo.bPrepared = true;
			htDragInfo.nButton = we._event.button;
			htDragInfo.elHandle = el;
			htDragInfo.elDrag = el;
			htDragInfo.nPageX = oPos.pageX;
			htDragInfo.nPageY = oPos.pageY;
			/**
				드래그될 handle 에 마우스가 클릭되었을 때 발생
				
				@event handleDown
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
				@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
				@param {jindo.$Event} weEvent mousedown시 발생되는 jindo.$Event 객체
				@param {Function} stop dragStart 이벤트를 발생시키지 않고 중단시킬때 호출
				@example
					// 커스텀이벤트 핸들링 예제
					oDragArea.attach("handleDown", function(oCustomEvent){
						// 뒤따르는 dragStart 이벤트가 발생하지 않고 중단하고 싶은 경우
						oCustomEvent.stop();
					});
			**/
			if (this.fireEvent('handleDown', { 
				elHandle : el, 
				elDrag : el, 
				weEvent : we 
			})) {
				this._wfOnMouseMove.attach(document, 'mousemove');
			} 
			this._wfOnMouseUp.attach(document, 'mouseup');
			
			we.stop(jindo.$Event.CANCEL_DEFAULT);			
		}
	},
	
	_onMouseMove : function(we) {
		var htDragInfo = this._htDragInfo,
			htParam, htRect,
			oPos = we.pos(), 
			htGap = {
				"nX" : oPos.pageX - htDragInfo.nPageX,
				"nY" : oPos.pageY - htDragInfo.nPageY
			};

		if (htDragInfo.bPrepared) {
			var nThreshold = this.option('nThreshold'),
				htDiff = {};
			
			if (!htDragInfo.bForceDrag && nThreshold) {
				htDiff.nPageX = oPos.pageX - htDragInfo.nPageX;
				htDiff.nPageY = oPos.pageY - htDragInfo.nPageY;
				var nDistance = Math.sqrt(htDiff.nPageX * htDiff.nPageX + htDiff.nPageY * htDiff.nPageY);
				if (nThreshold > nDistance){
					return;
				} 
			}

			if (this._bIE && this.option("bSetCapture")) {
				this._elSetCapture = (this._el === document) ? document.body : this._findDraggableElement(we.element);
				if (this._elSetCapture) {
					this._elSetCapture.setCapture(false);
				}
			}
			 
			htParam = {
				elArea : this._el,
				elHandle : htDragInfo.elHandle,
				elDrag : htDragInfo.elDrag,
				htDiff : htDiff, //nThreshold가 있는경우 htDiff필요
				weEvent : we //jindo.$Event
			};
			
				
			htDragInfo.bIsDragging = true;
			htDragInfo.bPrepared = false;
			/**
				드래그가 시작될 때 발생 (마우스 클릭 후 첫 움직일 때 한 번)
				
				@event dragStart
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} elArea 기준 엘리먼트
				@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
				@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
				@param {Object} htDiff handledown된 좌표와 dragstart된 좌표의 차이
				@param {Number} htDiff.nPageX TODO : 파라미터 설명달기
				@param {Number} htDiff.nPageY TODO : 파라미터 설명달기
				@param {jindo.$Event} weEvent mousedown시 발생되는 jindo.$Event 객체
				@param {Function} stop beforedrag 이벤트를 발생시키지 않고 중단시킬때 호출
				@example
					// 커스텀이벤트 핸들링 예제
					oDragArea.attach("dragStart", function(oCustomEvent){
						// 뒤따르는 beforedrag 이벤트가 발생하지 않고 중단하고 싶은 경우
						oCustomEvent.stop();
					});
			**/
			if (this.fireEvent('dragStart', htParam)) {
				var welDrag = jindo.$Element(htParam.elDrag),
					htOffset = welDrag.offset();
				
				htDragInfo.elHandle = htParam.elHandle;
				htDragInfo.elDrag = htParam.elDrag;
				htDragInfo.nX = parseInt(welDrag.css('left'), 10) || 0;
				htDragInfo.nY = parseInt(welDrag.css('top'), 10) || 0;
				htDragInfo.nClientX = htOffset.left + welDrag.width() / 2;
				htDragInfo.nClientY = htOffset.top + welDrag.height() / 2;
			} else {
				htDragInfo.bPrepared = true;
				return;
			}
		} 
				
		if (htDragInfo.bForceDrag) {
			htGap.nX = oPos.clientX - htDragInfo.nClientX;
			htGap.nY = oPos.clientY - htDragInfo.nClientY;
		}
		
		htParam = {
			"elArea" : this._el,
			"elFlowOut" : htDragInfo.elDrag.parentNode, 
			"elHandle" : htDragInfo.elHandle,
			"elDrag" : htDragInfo.elDrag,
			"weEvent" : we, 		 //jindo.$Event
			"nX" : htDragInfo.nX + htGap.nX,
			"nY" : htDragInfo.nY + htGap.nY,
			"nGapX" : htGap.nX,
			"nGapY" : htGap.nY
		};
		
		/**
			드래그가 시작되고 엘리먼트가 이동되기 직전에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)
			
			@event beforeDrag
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} elArea 기준 엘리먼트
			@param {HTMLElement} elFlowOut bFlowOut 옵션이 적용될 상위 기준 엘리먼트 (변경가능)
			@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
			@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
			@param {Number} nX 드래그 될 x좌표. 이 좌표로 엘리먼트가 이동 된다.
			@param {Number} nY 드래그 될 y좌표. 이 좌표로 엘리먼트가 이동 된다.
			@param {Number} nGapX 드래그가 시작된 x좌표와의 차이
			@param {Number} nGapY 드래그가 시작된 y좌표와의 차이
			@param {jindo.$Event} weEvent mousedown시 발생되는 jindo.$Event 객체
			@param {Function} stop drag 이벤트를 발생시키지 않고 중단시킬때 호출
			@example
				// 커스텀이벤트 핸들링 예제
				oDragArea.attach("beforeDrag", function(oCustomEvent) {
					// 뒤따르는 drag 이벤트가 발생하지 않고 중단하고 싶은 경우
					oCustomEvent.stop();
					
					// 가로로는 안 움직이게 않게 할 경우
					oCustomEvent.nX = null;
					
					// Grid 좌표로 이동하게 할 경우
					oCustomEvent.nX = Math.round(oCustomEvent.nX / 20) * 20;
					oCustomEvent.nY = Math.round(oCustomEvent.nY / 20) * 20;
					
					if(oCustomEvent.nX < 0){
						oCustomEvent.nX = 0;
					}
					
					if(oCustomEvent.nY < 0){
						oCustomEvent.nY = 0;
					}
				});
		**/
		if (this.fireEvent('beforeDrag', htParam)) {
			var elDrag = htDragInfo.elDrag;
			if (this.option('bFlowOut') === false) {
				var elParent = htParam.elFlowOut,
					aSize = [ elDrag.offsetWidth, elDrag.offsetHeight ],
					nScrollLeft = 0, nScrollTop = 0;
					
				if (elParent == document.body) {
					nScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
					nScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
					elParent = null;
				}
				
				if (elParent && aSize[0] <= elParent.scrollWidth && aSize[1] <= elParent.scrollHeight) {
					htRect = { 
						nWidth : elParent.clientWidth, 
						nHeight : elParent.clientHeight
					};	
					nScrollLeft = elParent.scrollLeft;
					nScrollTop = elParent.scrollTop;
				} else {
					var	htClientSize = jindo.$Document().clientSize();
						
					htRect = {
						nWidth : htClientSize.width, 
						nHeight : htClientSize.height
					};
				}
	
				if (htParam.nX !== null) {
					htParam.nX = Math.max(htParam.nX, nScrollLeft);
					htParam.nX = Math.min(htParam.nX, htRect.nWidth - aSize[0] + nScrollLeft);
				}
				
				if (htParam.nY !== null) {
					htParam.nY = Math.max(htParam.nY, nScrollTop);
					htParam.nY = Math.min(htParam.nY, htRect.nHeight - aSize[1] + nScrollTop);
				}
			}
			if (htParam.nX !== null) {
				elDrag.style.left = htParam.nX + 'px';
			}
			if (htParam.nY !== null) {
				elDrag.style.top = htParam.nY + 'px';
			}
			
			/**
				드래그 엘리먼트가 이동하는 중에 발생 (이동중 beforedrag, drag 순으로 연속적으로 발생)
				
				@event drag
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} elArea 기준 엘리먼트
				@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
				@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
				@param {Number} nX 드래그 된 x좌표.
				@param {Number} nY 드래그 된 y좌표.
				@param {Number} nGapX 드래그가 시작된 x좌표와의 차이
				@param {Number} nGapY 드래그가 시작된 y좌표와의 차이
				@param {jindo.$Event} weEvent mousedown시 발생되는 jindo.$Event 객체
				@example
					//커스텀이벤트 핸들링 예제
					oDragArea.attach("drag", function(oCustomEvent) {
						//~~
					});
			**/
			this.fireEvent('drag', htParam);
		}else{
			htDragInfo.bIsDragging = false;
		}
	},
	
	_onMouseUp : function(we) {
		this._stopDragging(false);
		
		var htDragInfo = this._htDragInfo;
		htDragInfo.bHandleDown = false;
		/**
			드래그된 handle에 마우스 클릭이 해제됬을 때 발생
			
			@event handleUp
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} elHandle 옵션의 className으로 설정된 드래그 될 핸들 엘리먼트
			@param {HTMLElement} elDrag 실제로 드래그 될 엘리먼트
			@param {jindo.$Event} weEvent mousedown시 발생되는 jindo.$Event 객체
			@example
				// 커스텀이벤트 핸들링 예제
				oDragArea.attach("handleUp", function(oCustomEvent) {
					//~~
				});
		**/
		this.fireEvent("handleUp", {
			weEvent : we,
			elHandle : htDragInfo.elHandle,
			elDrag : htDragInfo.elDrag 
		});
	},
	
	_onDragStart : function(we) {
		if (this._findDraggableElement(we.element)) { 
			we.stop(jindo.$Event.CANCEL_DEFAULT); 
		}
	},
	
	_onSelectStart : function(we) {
		if (this.isDragging() || this._findDraggableElement(we.element)) {
			we.stop(jindo.$Event.CANCEL_DEFAULT);	
		}
	}
	
}).extend(jindo.UIComponent);
/**
	@version 1.1.0
**/

/*
	TERMS OF USE - EASING EQUATIONS
	Open source under the BSD License.
	Copyright (c) 2001 Robert Penner, all rights reserved.
**/

/**
	수치의 중간값을 쉽게 얻을 수 있게 하는 static 컴포넌트
	새로운 이펙트 함수를 생성한다.
	
	@class jindo.Effect
	@static
	@param {Function} fEffect 0~1 사이의 숫자를 인자로 받아 정해진 공식에 따라 0~1 사이의 값을 리턴하는 함수
	@return {Function} 이펙트 함수. 이 함수는 시작값과 종료값을 입력하여 특정 시점에 해당하는 값을 구하는 타이밍 함수를 생성한다.
	
	@keyword effect, 효과, animation, 애니메이션
**/
jindo.Effect = function(fEffect) {
	if (this instanceof arguments.callee) {
		throw new Error("You can't create a instance of this");
	}
	
	var rxNumber = /^(\-?[0-9\.]+)(%|px|pt|em)?$/,
		rxRGB = /^rgb\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+)\)$/i,
		rxHex = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
		rx3to6 = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/i;
	
	var getUnitAndValue = function(v) {
		var nValue = v, sUnit;
		
		if (rxNumber.test(v)) {
			nValue = parseFloat(v); 
			sUnit = RegExp.$2 || "";
		} else if (rxRGB.test(v)) {
			nValue = [parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)];
			sUnit = 'color';
		} else if (rxHex.test(v = v.replace(rx3to6, '#$1$1$2$2$3$3'))) {
			nValue = [parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16)];
			sUnit = 'color';
		} 
				
		return { 
			nValue : nValue, 
			sUnit : sUnit 
		};
	};
	
	return function(nStart, nEnd) {
		var sUnit;
		if (arguments.length > 1) {
			nStart = getUnitAndValue(nStart);
			nEnd = getUnitAndValue(nEnd);
			sUnit = nEnd.sUnit;
		} else {
			nEnd = getUnitAndValue(nStart);
			nStart = null;
			sUnit = nEnd.sUnit;
		} 
		
		// 두개의 단위가 다르면
		if (nStart && nEnd && nStart.sUnit != nEnd.sUnit) {
			throw new Error('unit error');
		}
		
		nStart = nStart && nStart.nValue;
		nEnd = nEnd && nEnd.nValue;
		
		var fReturn = function(p) {
			var nValue = fEffect(p),
				getResult = function(s, d) {
					return (d - s) * nValue + s + sUnit; 
				};
			
			if (sUnit == 'color') {
				var r = Math.max(0, Math.min(255, parseInt(getResult(nStart[0], nEnd[0]), 10))) << 16;
				r |= Math.max(0, Math.min(255, parseInt(getResult(nStart[1], nEnd[1]), 10))) << 8;
				r |= Math.max(0, Math.min(255, parseInt(getResult(nStart[2], nEnd[2]), 10)));
				
				r = r.toString(16).toUpperCase();
				for (var i = 0; 6 - r.length; i++) {
					r = '0' + r;
				}
					
				return '#' + r;
			}
			return getResult(nStart, nEnd);
		};
		
		if (nStart === null) {
			fReturn.setStart = function(s) {
				s = getUnitAndValue(s);
				
				if (s.sUnit != sUnit) {
					throw new Error('unit eror');
				}
				nStart = s.nValue;
			};
		}
		return fReturn;
	};
};

/**
	linear 이펙트 함수
	
	@method linear
	@static
**/
jindo.Effect.linear = jindo.Effect(function(s) {
	return s;
});

/**
	easeInSine 이펙트 함수
	
	@method easeInSine
	@static
**/
jindo.Effect.easeInSine = jindo.Effect(function(s) {
	return (s == 1) ? 1 : -Math.cos(s * (Math.PI / 2)) + 1;
});
/**
	easeOutSine 이펙트 함수
	
	@method easeOutSine
	@static
**/
jindo.Effect.easeOutSine = jindo.Effect(function(s) {
	return Math.sin(s * (Math.PI / 2));
});
/**
	easeInOutSine 이펙트 함수
	
	@method easeInOutSine
	@static
**/
jindo.Effect.easeInOutSine = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInSine(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInSine 이펙트 함수
	
	@method easeOutInSine
	@static
**/
jindo.Effect.easeOutInSine = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutSine(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuad 이펙트 함수
	
	@method easeInQuad
	@static
**/
jindo.Effect.easeInQuad = jindo.Effect(function(s) {
	return s * s;
});
/**
	easeOutQuad 이펙트 함수
	
	@method easeOutQuad
	@static
**/
jindo.Effect.easeOutQuad = jindo.Effect(function(s) {
	return -(s * (s - 2));
});
/**
	easeInOutQuad 이펙트 함수
	
	@method easeInOutQuad
	@static
**/
jindo.Effect.easeInOutQuad = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInQuad(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuad 이펙트 함수
	
	@method easeOutInQuad
	@static
**/
jindo.Effect.easeOutInQuad = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutQuad(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCubic 이펙트 함수
	
	@method easeInCubic
	@static
**/
jindo.Effect.easeInCubic = jindo.Effect(function(s) {
	return Math.pow(s, 3);
});
/**
	easeOutCubic 이펙트 함수
	
	@method easeOutCubic
	@static
**/
jindo.Effect.easeOutCubic = jindo.Effect(function(s) {
	return Math.pow((s - 1), 3) + 1;
});
/**
	easeInOutCubic 이펙트 함수
	
	@method easeInOutCubic
	@static
**/
jindo.Effect.easeInOutCubic = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeIn(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOut(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCubic 이펙트 함수
	
	@method easeOutInCubic
	@static
**/
jindo.Effect.easeOutInCubic = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOut(0, 1)(2 * s) * 0.5 : jindo.Effect.easeIn(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuart 이펙트 함수
	
	@method easeInQuart
	@static
**/
jindo.Effect.easeInQuart = jindo.Effect(function(s) {
	return Math.pow(s, 4);
});
/**
	easeOutQuart 이펙트 함수
	
	@method easeOutQuart
	@static
**/
jindo.Effect.easeOutQuart = jindo.Effect(function(s) {
	return -(Math.pow(s - 1, 4) - 1);
});
/**
	easeInOutQuart 이펙트 함수
	
	@method easeInOutQuart
	@static
**/
jindo.Effect.easeInOutQuart = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInQuart(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuart 이펙트 함수
	
	@method easeOutInQuart
	@static
**/
jindo.Effect.easeOutInQuart = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutQuart(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInQuint 이펙트 함수
	
	@method easeInQuint
	@static
**/
jindo.Effect.easeInQuint = jindo.Effect(function(s) {
	return Math.pow(s, 5);
});
/**
	easeOutQuint 이펙트 함수
	
	@method easeOutQuint
	@static
**/
jindo.Effect.easeOutQuint = jindo.Effect(function(s) {
	return Math.pow(s - 1, 5) + 1;
});
/**
	easeInOutQuint 이펙트 함수
	
	@method easeInOutQuint
	@static
**/
jindo.Effect.easeInOutQuint = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInQuint(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInQuint 이펙트 함수
	
	@method easeOutInQuint
	@static
**/
jindo.Effect.easeOutInQuint = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutQuint(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInCircle 이펙트 함수
	
	@method easeInCircle
	@static
**/
jindo.Effect.easeInCircle = jindo.Effect(function(s) {
	return -(Math.sqrt(1 - (s * s)) - 1);
});
/**
	easeOutCircle 이펙트 함수
	
	@method easeOutCircle
	@static
**/
jindo.Effect.easeOutCircle = jindo.Effect(function(s) {
	return Math.sqrt(1 - (s - 1) * (s - 1));
});
/**
	easeInOutCircle 이펙트 함수
	
	@method easeInOutCircle
	@static
**/
jindo.Effect.easeInOutCircle = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInCircle(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutInCircle 이펙트 함수
	
	@method easeOutInCircle
	@static
**/
jindo.Effect.easeOutInCircle = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutCircle(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInBack 이펙트 함수
	
	@method easeInBack
	@static
**/
jindo.Effect.easeInBack = jindo.Effect(function(s) {
	var n = 1.70158;
	return (s == 1) ? 1 : (s / 1) * (s / 1) * ((1 + n) * s - n);
});
/**
	easeOutBack 이펙트 함수
	
	@method easeOutBack
	@static
**/
jindo.Effect.easeOutBack = jindo.Effect(function(s) {
	var n = 1.70158;
	return (s === 0) ? 0 : (s = s / 1 - 1) * s * ((n + 1) * s + n) + 1;
});
/**
	easeInOutBack 이펙트 함수
	
	@method easeInOutBack
	@static
**/
jindo.Effect.easeInOutBack = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInBack(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutBack(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInElastic 이펙트 함수
	
	@method easeInElastic
	@static
**/
jindo.Effect.easeInElastic = jindo.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return -(a * Math.pow(2, 10 * (s -= 1)) * Math.sin((s - 1) * (2 * Math.PI) / p));
});

/**
	easeOutElastic 이펙트 함수
	
	@method easeOutElastic
	@static
**/
jindo.Effect.easeOutElastic = jindo.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return (a * Math.pow(2, -10 * s) * Math.sin((s - n) * (2 * Math.PI) / p ) + 1);
});
/**
	easeInOutElastic 이펙트 함수
	
	@method easeInOutElastic
	@static
**/
jindo.Effect.easeInOutElastic = jindo.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1/2) == 2) {
		return 1;
	}
	if (!p) {
		p = (0.3 * 1.5);
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	if (s < 1) {
		return -0.5 * (a * Math.pow(2, 10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ));
	}
	return a * Math.pow(2, -10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ) * 0.5 + 1;
});

/**
	easeOutBounce 이펙트 함수
	
	@method easeOutBounce
	@static
**/
jindo.Effect.easeOutBounce = jindo.Effect(function(s) {
	if (s < (1 / 2.75)) {
		return (7.5625 * s * s);
	} else if (s < (2 / 2.75)) {
		return (7.5625 * (s -= (1.5 / 2.75)) * s + 0.75);
	} else if (s < (2.5 / 2.75)) {
		return (7.5625 * (s -= (2.25 / 2.75)) * s + 0.9375);
	} else {
		return (7.5625 * (s -= (2.625 / 2.75)) * s + 0.984375);
	} 
});
/**
	easeInBounce 이펙트 함수
	
	@method easeInBounce
	@static
**/
jindo.Effect.easeInBounce = jindo.Effect(function(s) {
	return 1 - jindo.Effect.easeOutBounce(0, 1)(1 - s);
});
/**
	easeInOutBounce 이펙트 함수
	
	@method easeInOutBounce
	@static
**/
jindo.Effect.easeInOutBounce = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInBounce(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutBounce(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	easeInExpo 이펙트 함수
	
	@method easeInExpo
	@static
**/
jindo.Effect.easeInExpo = jindo.Effect(function(s) {
	return (s === 0) ? 0 : Math.pow(2, 10 * (s - 1));
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutExpo
	@static
**/
jindo.Effect.easeOutExpo = jindo.Effect(function(s) {
	return (s == 1) ? 1 : -Math.pow(2, -10 * s / 1) + 1;
});
/**
	easeInOutExpo 이펙트 함수
	
	@method easeInOutExpo
	@static
**/
jindo.Effect.easeInOutExpo = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeInExpo(0, 1)(2 * s) * 0.5 : jindo.Effect.easeOutExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
	easeOutExpo 이펙트 함수
	
	@method easeOutInExpo
	@static
**/
jindo.Effect.easeOutInExpo = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.easeOutExpo(0, 1)(2 * s) * 0.5 : jindo.Effect.easeInExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
	Cubic-Bezier curve
	@method _cubicBezier
	@private
	@param {Number} x1
	@param {Number} y1
	@param {Number} x2
	@param {Number} y2
	@see http://www.netzgesta.de/dev/cubic-bezier-timing-function.html 
**/
jindo.Effect._cubicBezier = function(x1, y1, x2, y2){
	return function(t){
		var cx = 3.0 * x1, 
	    	bx = 3.0 * (x2 - x1) - cx, 
	    	ax = 1.0 - cx - bx, 
	    	cy = 3.0 * y1, 
	    	by = 3.0 * (y2 - y1) - cy, 
	    	ay = 1.0 - cy - by;
		
	    function sampleCurveX(t) {
	    	return ((ax * t + bx) * t + cx) * t;
	    }
	    function sampleCurveY(t) {
	    	return ((ay * t + by) * t + cy) * t;
	    }
	    function sampleCurveDerivativeX(t) {
	    	return (3.0 * ax * t + 2.0 * bx) * t + cx;
	    }
	    function solveCurveX(x,epsilon) {
	    	var t0, t1, t2, x2, d2, i;
	    	for (t2 = x, i = 0; i<8; i++) {
	    		x2 = sampleCurveX(t2) - x; 
	    		if (Math.abs(x2) < epsilon) {
	    			return t2;
	    		} 
	    		d2 = sampleCurveDerivativeX(t2); 
	    		if(Math.abs(d2) < 1e-6) {
	    			break;
	    		} 
	    		t2 = t2 - x2 / d2;
	    	}
		    t0 = 0.0; 
		    t1 = 1.0; 
		    t2 = x; 
		    if (t2 < t0) {
		    	return t0;
		    } 
		    if (t2 > t1) {
		    	return t1;
		    }
		    while (t0 < t1) {
		    	x2 = sampleCurveX(t2); 
		    	if (Math.abs(x2 - x) < epsilon) {
		    		return t2;
		    	} 
		    	if (x > x2) {
		    		t0 = t2;
		    	} else {
		    		t1 = t2;
		    	} 
		    	t2 = (t1 - t0) * 0.5 + t0;
		    }
	    	return t2; // Failure.
	    }
	    return sampleCurveY(solveCurveX(t, 1 / 200));
	};
};

/**
	Cubic-Bezier 함수를 생성한다.
	
	@method cubicBezier
	@static
	@see http://en.wikipedia.org/wiki/B%C3%A9zier_curve
	@param {Number} x1 control point 1의 x좌표
	@param {Number} y1 control point 1의 y좌표
	@param {Number} x2 control point 2의 x좌표
	@param {Number} y2 control point 2의 y좌표
	@return {Function} 생성된 이펙트 함수
**/
jindo.Effect.cubicBezier = function(x1, y1, x2, y2){
	return jindo.Effect(jindo.Effect._cubicBezier(x1, y1, x2, y2));
};

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 ease 함수
	
	@example
		jindo.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
	
	@method cubicEase
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.Effect.cubicEase = jindo.Effect.cubicBezier(0.25, 0.1, 0.25, 1);

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeIn 함수

	@example
		jindo.Effect.cubicBezier(0.42, 0, 1, 1);
	
	@method cubicEaseIn
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.Effect.cubicEaseIn = jindo.Effect.cubicBezier(0.42, 0, 1, 1);

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeOut 함수
	
	@example
		jindo.Effect.cubicBezier(0, 0, 0.58, 1);
	
	@method cubicEaseOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.Effect.cubicEaseOut = jindo.Effect.cubicBezier(0, 0, 0.58, 1);

/**
	Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeInOut 함수
	
	@example
		jindo.Effect.cubicBezier(0.42, 0, 0.58, 1);
	
	@method cubicEaseInOut
	@static
	@see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
**/
jindo.Effect.cubicEaseInOut = jindo.Effect.cubicBezier(0.42, 0, 0.58, 1);

/**
	Cubic-Bezier 커브를 이용해 easeOutIn 함수를 구한다.
	
	@example
		jindo.Effect.cubicBezier(0, 0.42, 1, 0.58);
	
	@method cubicEaseOutIn
	@static
**/
jindo.Effect.cubicEaseOutIn = jindo.Effect.cubicBezier(0, 0.42, 1, 0.58);

/**
	overphase 이펙트 함수
	
	@method overphase
	@static
**/
jindo.Effect.overphase = jindo.Effect(function(s){
	s /= 0.652785;
	return (Math.sqrt((2 - s) * s) + (0.1 * s)).toFixed(5);	
});

/**
	sin 곡선의 일부를 이용한 sinusoidal 이펙트 함수
	
	@method sinusoidal
	@static
**/
jindo.Effect.sinusoidal = jindo.Effect(function(s) {
	return (-Math.cos(s * Math.PI) / 2) + 0.5;
});

/**
	mirror 이펙트 함수
	sinusoidal 이펙트 함수를 사용한다.
	
	@method mirror
	@static
**/
jindo.Effect.mirror = jindo.Effect(function(s) {
	return (s < 0.5) ? jindo.Effect.sinusoidal(0, 1)(s * 2) : jindo.Effect.sinusoidal(0, 1)(1 - (s - 0.5) * 2);
});

/**
	nPulse의 진동수를 가지는 cos 함수를 구한다.
	
	@method pulse
	@static
	@param {Number} nPulse 진동수
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.Effect.pulse(3); //진동수 3을 가지는 함수를 리턴
		//시작 수치값과 종료 수치값을 설정해 jindo.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 100
**/
jindo.Effect.pulse = function(nPulse) {
    return jindo.Effect(function(s){
		return (-Math.cos((s * (nPulse - 0.5) * 2) * Math.PI) / 2) + 0.5;	
	});
};

/**
	nPeriod의 주기와 nHeight의 진폭을 가지는 sin 함수를 구한다.
	
	@method wave
	@static
	@param {Number} nPeriod 주기
	@param {Number} nHeight 진폭
	@return {Function} 생성된 이펙트 함수
	@example
		var f = jindo.Effect.wave(3, 1); //주기 3, 높이 1을 가지는 함수를 리턴
		//시작 수치값과 종료 수치값을 설정해 jindo.Effect 함수를 생성
		var fEffect = f(0, 100);
		fEffect(0); => 0
		fEffect(1); => 0
**/
jindo.Effect.wave = function(nPeriod, nHeight) {
    return jindo.Effect(function(s){
    	return (nHeight || 1) * (Math.sin(nPeriod * (s * 360) * Math.PI / 180)).toFixed(5);
	});
};

/**
	easeIn 이펙트 함수
	easeInCubic 함수와 동일하다.
	
	@method easeIn
	@static
	@see easeInCubic
**/
jindo.Effect.easeIn = jindo.Effect.easeInCubic;
/**
	easeOut 이펙트 함수
	easeOutCubic 함수와 동일하다.
	
	@method easeOut
	@static
	@see easeOutCubic
**/
jindo.Effect.easeOut = jindo.Effect.easeOutCubic;
/**
	easeInOut 이펙트 함수
	easeInOutCubic 함수와 동일하다.
	
	@method easeInOut
	@static
	@see easeInOutCubic
**/
jindo.Effect.easeInOut = jindo.Effect.easeInOutCubic;
/**
	easeOutIn 이펙트 함수
	easeOutInCubic 함수와 동일하다.
	
	@method easeOutIn
	@static
	@see easeOutInCubic
**/
jindo.Effect.easeOutIn = jindo.Effect.easeOutInCubic;
/**
	bounce 이펙트 함수
	easeOutBounce 함수와 동일하다.
	
	@method bounce
	@static
	@see easeOutBounce
**/
jindo.Effect.bounce = jindo.Effect.easeOutBounce;
/**
	elastic 이펙트 함수
	easeInElastic 함수와 동일하다.
	
	@method elastic
	@static
	@see easeInElastic
**/
jindo.Effect.elastic = jindo.Effect.easeInElastic;
/**
	@fileOverview 타이머를 편리하게 사용할 수 있게해주는 컴포넌트
	@version 1.1.0
**/
/**
	
	타이머의 사용을 편리하게 해주는 컴포넌트
	
	@class jindo.Timer
	@extends jindo.Component
	@keyword timer, 타이머, setTimeout, setInterval
 */
jindo.Timer = jindo.$Class({
	/** @lends jindo.Timer.prototype */

	/**
		Timer 컴포넌트를 초기화한다.
		
		@constructor
 	 */
	$init : function() { 
		this._nTimer = null;
		this._nLatest = null;
		this._nRemained = 0;
		this._nDelay = null;
		this._fRun = null;
		this._bIsRunning = false;
	},
	
	/**
		함수를 지정한 시간이 지난 후에 실행한다. 실행될 콜백 함수가 true 를 리턴하면 setInterval 을 사용한 것처럼 계속 반복해서 수행된다.
		
		@method start
		@param {Function} fCallback 지정된 지연 시간 이후에 실행될 콜백 함수
		@param {Number} nDelay msec 단위의 지연 시간
		@return {Boolean} 항상 true
		@example
			var o = new jindo.Timer();
			o.start(function() {
				// ...
				return true;
			}, 100);
	**/
 	start : function(fRun, nDelay) {
		this.abort();
		
		this._nRemained = 0;
		this._nDelay = nDelay;
		this._fRun = fRun;
		
		this._bIsRunning = true;
		this._nLatest = this._getTime();
		this.fireEvent('wait');
		this._excute(this._nDelay, false);
		
		return true;
	},
	
	/**
		타이머의 동작 여부를 가져온다.
		
		@method isRunning
		@return {Boolean} 동작중이면 true, 그렇지 않으면 false
	**/
	isRunning : function() {
		return this._bIsRunning;
	},
	
	_getTime : function() {
		return new Date().getTime();
	},
	
	_clearTimer : function() {
		var bFlag = false;
		
		if (this._nTimer) {
			clearInterval(this._nTimer);
			this._bIsRunning = false;
			bFlag = true;
		}
		
		this._nTimer = null;
		return bFlag;
	},
	
	/**
		현재 대기상태에 있는 타이머를 중단시킨다.
		
		@method abort
		@return {Boolean} 이미 멈춰있었으면 false, 그렇지 않으면 true
	**/
	abort : function() {
		var bReturn = this._clearTimer();
		if (bReturn) {
			/**
				Timer가 수행을 강제로 종료했을 때 발생
				
				@event abort
				@param {String} sType 커스텀이벤트명
				@example
					// 커스텀이벤트 핸들링 예제
					oTimer.attach("abort", function(oCustomEvent) { ... });
			**/
			this.fireEvent('abort');
			this._fRun = null;
		}
		return bReturn;
	},
	
	/**
		현재 동작하고 있는 타이머를 일시정지 시킨다.
		
		@method pause
		@return {Boolean} 이미 멈춰있었으면 false, 그렇지 않으면 true
	**/
	pause : function() {
		var nPassed = this._getTime() - this._nLatest;
		this._nRemained = Math.max(this._nDelay - nPassed, 0);
		
		return this._clearTimer();
	},
	
	_excute : function(nDelay, bResetDelay) {
		var self = this;
		this._clearTimer();
	
		this._bIsRunning = true;
		
		var launcher = function(bDontUseTimer) {
			if (self._nTimer || bDontUseTimer) { //self._nTimer가 null일때도 간헐적으로 수행되는 버그가 있어 추가
				/**
					Timer 동작 수행이 시작될 때 발생
					
					@event run
					@param {String} sType 커스텀이벤트명
					@example
						// 커스텀이벤트 핸들링 예제
						oTimer.attach("run", function(oCustomEvent) { ... });
				**/
				self.fireEvent('run');
				
				var r = self._fRun();
				self._nLatest = self._getTime();
				
				if (!r) {
					if (!bDontUseTimer) {
						clearInterval(self._nTimer);
					}
					self._nTimer = null;
					self._bIsRunning = false;
					/**
						Timer 동작이 종료될 때 발생
						
						@event end
						@param {String} sType 커스텀이벤트명
						@example
							// 커스텀이벤트 핸들링 예제
							oTimer.attach("end", function(oCustomEvent) { ... });
					**/
					self.fireEvent('end');
					return;
				}
				
				/**
					Timer가 기다리기 시작한 시점에 발생
					
					@event wait
					@param {String} sType 커스텀이벤트명
					@example
						// 커스텀이벤트 핸들링 예제
						oTimer.attach("wait", function(oCustomEvent) { ... });
				**/
				self.fireEvent('wait');
				if (bResetDelay || bDontUseTimer) {
					self._excute(self._nDelay, false);
				}
			}
		};
		
		if (nDelay > -1) {
			this._nTimer = setInterval(launcher, nDelay);
		} else {
			launcher(true);
		}
	},
	
	/**
		일시정지 상태인 타이머를 재개시킨다.
		
		@method resume
		@return {Boolean} 재개에 성공했으면 true, 그렇지 않으면 false
	**/
	resume : function() {
		if (!this._fRun || this.isRunning()) {
			return false;
		}
		
		this._bIsRunning = true;
		this.fireEvent('wait');
		this._excute(this._nRemained, true);
		this._nRemained = 0;
		return true;
	}
}).extend(jindo.Component);

/**
	@fileOverview 특정 엘리먼트 및 엘리먼트 그룹에서 발생한 이벤트에 따라 레이어를 보여주고 숨겨주는 역할을 하는 컴포넌트
	@version 1.1.0
**/
/**
	특정 엘리먼트와 지정한 엘리먼트 그룹에서 발생한 이벤트에 따라 레이어를 보여주고 숨겨주는 컴포넌트
	
	@class jindo.LayerManager
	@extends jindo.UIComponent
	@requires jindo.Timer
	
	@keyword layer, manager, 레이어, 관리
**/
jindo.LayerManager = jindo.$Class({
	/** @lends jindo.LayerManager.prototype */
	
	_bIsActivating  : false,
	_bIsHiding : false, //hide() 메소드가 Timer로 수행되고 있는지의 여부
	_bIsShowing : false,
	_aLink : null,
	
	/**
		LayerManager 컴포넌트를 초기화한다.
		@constructor
		@param {HTMLElement | String} el 숨기고자하는 레이어 엘리먼트 (혹은 id)
		@param {Object} [htOption] 추가 옵션 (생략가능)
			@param {String} [htOption.sCheckEvent="click"] 레이어가 숨김동작을 확인할 이벤트 종류. 이 이벤트는 document.body에 바인딩된다. 이벤트 명은 on을 제외하고 입력한다. 예를들어 레이어에서 커서가 벗어나 document.body에 마우스오버되었을 경우 레이어가 닫히게 하고 싶은 경우 "mouseover"로 지정한다. ("mouseout" 아님)
			@param {Number} [htOption.nCheckDelay=100] 레이어 숨김여부를 확인하기 위한 지연시간. sCheckEvent옵션으로 정의된 이벤트가 발생하고 난 후, 지정된 지연시간 전에 link된 엘리먼트에 mouseover되는 경우 레이어가 숨겨지지 않고 취소 된다. 이때 ignore 커스텀이벤트가 발생한다.<br/>- 단위는 ms(1000이 1초)
			@param {Number} [htOption.nShowDelay=0] 레이어가 보여지기까지의 지연시간<br/>- 단위는 ms(1000이 1초)
			@param {Number} [htOption.nHideDelay=100] 레이어가 숨겨지기까지의 지연시간<br/>- 단위는 ms(1000이 1초)
	**/
	$init: function(el, htOption){
		this.option({
			sCheckEvent: "click",
			nCheckDelay: 100,
			nShowDelay: 0,
			nHideDelay: 100
		});
		
		this.option(htOption || {});
		this.setLayer(el);
		
		this._aLink = [];
		this._oShowTimer = new jindo.Timer();
		this._oHideTimer = new jindo.Timer();
		this._oEventTimer = new jindo.Timer();
		this._wfOnEvent = jindo.$Fn(this._onEvent, this);
		this.getVisible();
		this.activate();
	},
	
	/**
		컴포넌트를 활성화한다.
	**/
	_onActivate : function() {
		this._wfOnEvent.attach(document, this.option("sCheckEvent"));
	},
	
	/**
		컴포넌트를 비활성화한다.
	**/
	_onDeactivate : function() {
		this._wfOnEvent.detach(document, this.option("sCheckEvent"));
	},
	
	/**
		Layer가 보여지고 있는지 여부를 가져온다.
		
		@method getVisible
		@return {Boolean}
	**/
	getVisible: function(){
		return this._wel.visible();
	},
	
	_check: function(el){
		var wel = jindo.$Element(el);
		for (var i = 0, elLink, welLink; (elLink = this._aLink[i]); i++) {
			welLink = jindo.$Element(elLink);
			if (welLink) {
				elLink = welLink.$value();
				if (elLink && (el == elLink || wel.isChildOf(elLink))) {
					return true;
				} 
			}
		}
		return false;
	},
	
	_find: function(el){
		for (var i = 0, elLink; (elLink = this._aLink[i]); i++) {
			if (elLink == el) {
				return i;
			} 
		}
		return -1;
	},
	
	/**
		보여주고 숨겨줄 레이어 객체를 가져온다.
		
		@method getLayer
		@return {HTMLElement} 
	**/
	getLayer : function() {
		return this._el;
	},
	
	/**
		보여주고 숨겨줄 레이어 객체를 설정한다.
		
		@method setLayer
		@param {HTMLElement} el TODO : 파라미터 설명달기
		@return {this} 
	**/
	setLayer : function(el) {
		this._el = jindo.$(el);
		this._wel = jindo.$Element(el);
		return this;
	},
	
	/**
		link된 엘리먼트 배열을 가져온다.
		
		@method getLinks
		@return {Array}
	**/
	getLinks : function() {
		return this._aLink;
	},
	
	/**
		link할 엘리먼트 배열을 설정한다.
		
		@method setLinks
		@param {Array} a TODO : 파라미터 설명달기
		@return {this} 인스턴스 자신
	**/
	setLinks : function(a) {
		this._aLink = jindo.$A(a).unique().$value();
		return this;
	},
	
	/**
		생성자의 옵션으로 지정한 이벤트가 발생해도 레이어를 닫지 않게 할 엘리먼트를 지정한다
		
		@method link
		@param {vElement} vElement 이벤트를 무시할 엘리먼트 또는 엘리먼트의 ID (인자를 여러개 주어서 다수 지정 가능)
		@return {this} 인스턴스 자신
		@example
			o.link(jindo.$("one"), "two", oEl);
	**/
	link: function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.link(arguments[i]);
			}
			return this;
		}
		
		if (this._find(vElement) != -1) {
			return this;
		} 
		
		this._aLink.push(vElement);
		return this;
	},
	
	/**
		생성자의 옵션으로 지정한 이벤트가 발생해도 레이어를 닫지 않게 할 엘리먼트 지정한 것을 제거한다
		
		@method unlink
		@param {vElement} vElement 이벤트가 무시된 엘리먼트 또는 엘리먼트의 ID (인자를 여러개 주어서 다수 지정 가능)
		@return {this} 인스턴스 자신
		@example
			o.unlink(jindo.$("one"), "two", oEl);
	**/
	unlink: function(vElement){
		if (arguments.length > 1) {
			for (var i = 0, len = arguments.length; i < len; i++) {
				this.unlink(arguments[i]);
			}
			return this;
		}
		
		var nIndex = this._find(vElement);
		if (nIndex > -1) {
			this._aLink.splice(nIndex, 1);
		}
		
		return this;
	},
	
	_fireEventBeforeShow : function() {
		/**
			레이어를 보여주기 전에 발생
			
			@event beforeShow
			@param {String} sType 커스텀이벤트명
			@param {Array} aLinkedElement link된 엘리먼트들
			@param {Element} elLayer 보여지고 감춰지는 대상 레이어
			@param {Function} stop 레이어 보여주는 것을 중단하는 메소드
			@example
				// beforeShow 커스텀이벤트 핸들링
				oLayerManager.attach("beforeShow", function(oCustomEvent) { ... });
			@example
				// 레이어가 보여지지 않도록 처리
				oLayerManager.attach("beforeShow", function(oCustomEvent) {
					oCustomEvent.stop();
				});
		**/
		return this.fireEvent("beforeShow", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	
	_fireEventShow : function() {
		this._bIsShowing = false;
		/**
			레이어가 화면에 나타나는 것이 끝난 후 발생
			
			@event show
			@param {String} sType 커스텀이벤트명
			@param {Array} aLinkedElement link된 엘리먼트들
			@param {Element} elLayer 보여지고 감춰지는 대상 레이어
			@example
				// show 커스텀이벤트 핸들링
				oLayerManager.attach("show", function(oCustomEvent) { ... });
		**/
		this.fireEvent("show", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	
	_fireEventBeforeHide : function() {
		/**
			레이어를 감추기 전에 발생
			
			@event beforeHide
			@param {String} sType 커스텀이벤트명
			@param {Array} aLinkedElement link된 엘리먼트들
			@param {Element} elLayer 보여지고 감춰지는 대상 레이어
			@param {Function} stop 레이어를 감추는 것을 중단하는 메소드
			@example
				// beforeHide 커스텀이벤트 핸들링
				oLayerManager.attach("beforeHide", function(oCustomEvent) { ... });
			@example
				// 레이어가 감춰지지 않도록 처리
				oLayerManager.attach("beforeHide", function(oCustomEvent) {
					oCustomEvent.stop();
				});
		**/
		var bRet = this.fireEvent("beforeHide", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
		
		if (!bRet) { this._bIsHiding = false; }
		return bRet;
	},
	
	_fireEventHide : function() {
		this._bIsHiding = false;
		/**
			레이어가 감춰진 후 발생
			
			@event hide
			@param {String} sType 커스텀이벤트명
			@param {Array} aLinkedElement link된 엘리먼트들
			@param {Element} elLayer 보여지고 감춰지는 대상 레이어
			@example
				// hide 커스텀이벤트 핸들링
				oLayerManager.attach("hide", function(oCustomEvent) { ... });
		**/
		this.fireEvent("hide", {
			elLayer : this.getLayer(),
			aLinkedElement : this.getLinks()
		});
	},
	
	_show: function(fShow, nDelay){
		var self = this;
		
		this._oEventTimer.abort();
		this._bIsShowing = true;
		this._bIsHiding = false;

		if (nDelay <= 0) { self._oHideTimer.abort(); }
		this._oShowTimer.start(function() {
			fShow();
		}, nDelay);
	},
	
	_hide: function(fHide, nDelay){
		var self = this;

		this._bIsShowing = false;
		this._bIsHiding = true;
		
		if (nDelay <= 0) { self._oShowTimer.abort(); }
		this._oHideTimer.start(function() {
			fHide();
		}, nDelay);
	},
	
	/**
		레이어를 보여준다.
		
		@method show
		@param {Number} nDelay 레이어를 보여줄 때의 지연시간을 지정 (생략시 옵션으로 지정한 nShowDelay 값을 따른다)
		@return {this} 인스턴스 자신
	**/
	show : function(nDelay) {
		if (typeof nDelay == "undefined") {
			nDelay = this.option("nShowDelay");
		}
		var self = this;
		this._show(function(){
			if (!self.getVisible()) {
				if (self._fireEventBeforeShow()) {
					self._wel.show();
					self._fireEventShow();
				}
			}
		}, nDelay);
		
		return this;
	},
	
	/**
		레이어를 숨긴다.
		
		@method hide
		@param {Number} nDelay nDelay 레이어를 숨길 때의 지연시간을 지정 (생략시 옵션으로 지정한 nHideDelay 값을 따른다)
		@return {this} 인스턴스 자신
	**/
	hide : function(nDelay) {
		if (typeof nDelay == "undefined") {
			nDelay = this.option("nHideDelay");
		}
		var self = this;
		this._hide(function(){
			if (self.getVisible()) {
				if (self._fireEventBeforeHide()) {
					self._wel.hide();
					self._fireEventHide();
				}
			}
		}, nDelay);
		return this;
	},
	
	/**
		레이어를 보여주거나 숨기도록 요청한다.
		
		@method toggle
		@param {Number} nDelay 레이어를 보여주거나 숨길 때의 지연시간을 지정 (생략시 옵션으로 지정한 showDelay/hideDelay 값을 따른다)
		@return {this} 인스턴스 자신
	**/
	toggle: function(nDelay){
		if (!this.getVisible() || this._bIsHiding) {
			this.show(nDelay || this.option("nShowDelay"));
		} else {
			this.hide(nDelay || this.option("nHideDelay"));
		}
		return this;
	},
	
	_onEvent : function(we){
		var el = we.element,
			self = this;
		
		this._oEventTimer.start(function() {
			if (!self._bIsHiding && self.getVisible()) {
				if (self._check(el)) { // hide()수행중이 아니고 links 객체들 안에서 발생한거면 무시
					if (!self._bIsShowing) {
						/**
							sCheckEvent가 발생했으나 레이어를 숨기지 않도록 무시된 경우에 발생
							
							@event ignore
							@param {String} sType 커스텀이벤트명
							@param {Array} aLinkedElement link된 엘리먼트들
							@param {Element} elLayer 보여지고 감춰지는 대상 레이어
							@param {String} sCheckEvent 발생된 이벤트 타입
							@example
								// ignore 커스텀이벤트 핸들링
								oLayerManager.attach("ignore", function(oCustomEvent) { ... });
						**/
						self.fireEvent("ignore", {
							sCheckEvent : self.option("sCheckEvent")
						});
						self._oHideTimer.abort();
						self._bIsHiding = false;
					}
				} else { //이벤트에 의해 hide()
					//mousedown시 disabled된 input일 경우 el이 제대로 리턴되지 않는 IE버그 수정
					if (typeof el.tagName != "undefined") {
						self.hide();
					}
				}
			}
		}, this.option("nCheckDelay"));	//link된 레이어 내를 클릭해서 레이어를 닫으려하는 경우 처리
	}
}).extend(jindo.UIComponent);
/**
	@fileOverview 특정 엘리먼트로부터 상대적인 레이어의 위치를 구한다. 
	@author senxation
	@version 1.1.0
**/

/**
	레이어를 지정된 엘리먼트에 상대적으로 위치시켜주는 컴포넌트
	
	@class jindo.LayerPosition
	@extends jindo.Component

	@remark
		위치를 설정할 레이어 엘리먼트는 document.body의 바로 아래에 존재해야야 한다.
		그렇지 않을 경우 강제로 document.body로 이동된다.
	
	@keyword layer, position, 레이어, 위치
**/
jindo.LayerPosition = jindo.$Class({
	/** @lends jindo.LayerPosition.prototype */

	/**
		컴포넌트를 생성한다.
		@constructor  
		@param {HTMLElement} el 기준이 되는 엘리먼트, document.body도 가능하다
		@param {HTMLElement} elLayer 위치를 설정할 레이어 엘리먼트
		@param {Object} [htOption] 옵션 객체
			@param {String} [htOption.sPosition="outside-bottom"] 레이어를 띄울 위치를 설정, 총 17가지 위치 설정 가능.
			<ul>
			<li>"outside-top-left"</li>
			<li>"outside-top"</li>
			<li>"outside-top-right"</li>
			<li>"outside-right"</li>
			<li>"outside-bottom-right"</li>
			<li>"outside-bottom"</li>
			<li>"outside-bottom-left"</li>
			<li>"outside-left"</li>
			<li>"inside-top-left"</li>
			<li>"inside-top"</li>
			<li>"inside-top-right"</li>
			<li>"inside-right"</li>
			<li>"inside-bottom-right"</li>
			<li>"inside-bottom"</li>
			<li>"inside-bottom-left"</li>
			<li>"inside-left"</li>
			<li>"inside-center"</li>
			</ul>
			@param {String} [htOption.sAlign="left"] 레이어의 위치가 top/bottom일 때 좌우 정렬 값.
			<ul>
			<li>"left"</li>
			<li>"center"</li>
			<li>"middle"</li>
			</ul>
			@param {String} [htOption.sValign=""] 레이어의 위치가 left/right일 때 상하 정렬 값.
			<ul>
			<li>"top"</li>
			<li>"middle"</li>
			<li>"bottom"</li>
			</ul>
			@param {Number} [htOption.nTop=0] 기준 레이어와의 y좌표 차이
			@param {Number} [htOption.nLeft=0] 기준 레이어와의 x좌표 차이
			@param {Boolean} [htOption.bAuto=false] 자동 정렬 여부. 스크롤과 브라우저창의 크기가 변경되거나 스크롤될 때 레이어 위치를 다시 조정한다.
		@example
			var oLayerPosition = new jindo.LayerPosition(jindo.$("center"), jindo.$("layer26"), { 
				sPosition: "outside-bottom", //레이어를 띄울 위치. 총 17가지의 위치를 가질 수 있다.
				sAlign: "left", //레이어의 위치가 top/bottom일 때 좌우 정렬 값 "left" || "center" || "middle" 
				sValign: "", //레이어의 위치가 left/right일 때 상하 정렬 값 "top" || "middle" || "bottom"
				nTop: 0, //기준 레이어와의 y좌표의 차이
				nLeft: 0, //기준 레이어와의 x좌표의 차이
				bAuto: false //자동정렬 여부. 스크롤과 브라우저창의 크기가 변경될 때 레이어 위치를 다시 조정한다.
			}).attach({
				beforeAdjust : function(oCustomEvent){
					//bAuto 옵션에 의해 자동으로 위치가 조정되기 전에 발생
					//이벤트 객체 oCustomEvent = {
					//	elLayer : {HTMLElement} 레이어 엘리먼트
					//	htCurrentPosition : {HashTable} 현재 위치
					//	htAdjustedPosition : {HashTable} 이동될 위치
					//}
					//oCustomEvent.stop(); 수행시 조정되지 않음
				},
				adjust : function(oCustomEvent){
					//bAuto 옵션에 의해 자동으로 위치가 조정된 이후에 발생
					//이벤트 객체 oCustomEvent = {
					//	elLayer : {HTMLElement} 레이어 엘리먼트
					//	htCurrentPosition : {HashTable} 조정된 현재 위치
					//}
				}
			});
		@example
			htOption.sPosition = "outside-top-left" || "outside-top" || "outside-top-right" || "outside-right" || "outside-bottom-right" || "outside-bottom" || "outside-bottom-left" || "outside-left" || "inside-top-left" || "inside-top" || "inside-top-right" || "inside-right" || "inside-bottom-right" || "inside-bottom" || "inside-bottom-left" || "inside-left" || "inside-center"
	**/
	$init: function(el, elLayer, htOption){
		this.option({
			sPosition: "outside-bottom",
			sAlign: "left",
			sValign: "",
			nTop: 0,
			nLeft: 0,
			bAuto: false
		});
		this.option(htOption || {});
		this.setElement(el);
		if (elLayer) {
			this.setLayer(elLayer);
		}
		if (el && elLayer) {
			this.setPosition();	
		}
		
		this._wfSetPosition = jindo.$Fn(function(){
			var el = this._elLayer;
			if (el && this._welLayer.visible()){
				/**
					bAuto 옵션값이 true일 때 자동으로 위치가 조정되기 전 발생
					
					@event beforeAdjust
					@param {String} sType 커스텀이벤트명
					@param {HTMLElement} elLayer 레이어 엘리먼트
					@param {Object} htCurrentPosition 현재 위치
						@param {Number} htCurrentPosition.nTop TODO : 파라미터 설명달기
						@param {Number} htCurrentPosition.nLeft TODO : 파라미터 설명달기
					@param {Object} htAdjustedPosition 이동될 위치
						@param {Number} htAdjustedPosition.nTop TODO : 파라미터 설명달기
						@param {Number} htAdjustedPosition.nLeft TODO : 파라미터 설명달기
					@example
						// beforeAdjust 커스텀이벤트 핸들링
						oLayerPosition.attach("beforeAdjust", function(oCustomEvent) { ... });
					@example
						// 레이어 위치 조정되지 않도록 처리
						oLayerPosition.attach("beforeAdjust", function(oCustomEvent) {
							oCustomEvent.stop();
						});
				**/
				if (this.fireEvent("beforeAdjust", {
						elLayer : el,
						htCurrentPosition : this.getCurrentPosition(),
						htAdjustedPosition : this._adjustPosition(this.getCurrentPosition())
					})) {
					this.setPosition();
					/**
						bAuto 옵션값이 true일 때 자동으로 위치가 조정된 이후에 발생
						
						@event adjust
						@param {String} sType 커스텀이벤트명
						@param {HTMLElement} elLayer 레이어 엘리먼트
						@param {Object} htCurrentPosition 조정된 현재 위치
							@param {Number} htCurrentPosition.nTop TODO : 파라미터 설명달기
							@param {Number} htCurrentPosition.nLeft TODO : 파라미터 설명달기
						@example
							// adjust 커스텀이벤트 핸들링
							oLayerPosition.attach("adjust", function(oCustomEvent) { ... });
					**/
					this.fireEvent("adjust", {
						elLayer : el,
						htCurrentPosition : this.getCurrentPosition()
					});
				}
			}
		}, this);
		
		if (this.option("bAuto")) {
			this._wfSetPosition.attach(window, "scroll").attach(window, "resize");
		}
	},
	
	/**
		기준 엘리먼트를 구한다.
		
		@method getElement
		@return {HTMLElement}
	**/
	getElement : function() {
		return this._el;
	},
	
	/**
		기준 엘리먼트를 설정한다.
		
		@method setElement
		@param el {HTMLElement}
		@return {this} 인스턴스 자신
	**/
	setElement : function(el) {
		this._wel = this._el = jindo.$(el);
		if (this._el) {
			this._wel = jindo.$Element(el);
		}
		
		return this;
	},
	
	/**
		레이어 엘리먼트를 구한다.
		
		@method getLayer
		@return {HTMLElement}
	**/
	getLayer : function() {
		return this._elLayer;
	},
	
	/**
		레이어 엘리먼트를 설정한다. 설정된 엘리먼트는 document.body에 append된다.
		
		@method setLayer
		@param elLayer {HTMLElement || String} 레이어엘리먼트 또는 엘리먼트의 id
		@return {this} 인스턴스 자신
	**/
	setLayer : function(elLayer) {
		this._elLayer = jindo.$(elLayer);
		this._welLayer = jindo.$Element(elLayer);
		if (this._elLayer.parentNode != document.body) {
			document.body.appendChild(this._elLayer);
		}
		return this;
	},
	
	_isPosition : function(htOption, sWord) {
		if (htOption.sPosition.indexOf(sWord) > -1) {
			return true;
		}
		return false;
	},
	
	_setLeftRight : function (htOption, htPosition){
		var el = this.getElement(),
			elLayer = this.getLayer(),
			nWidth = el.offsetWidth,
			nLayerWidth = elLayer.offsetWidth;
			
		if (el == document.body) {
			nWidth = jindo.$Document().clientSize().width;
		}
		
		var bLeft = this._isPosition(htOption, "left"),
			bRight = this._isPosition(htOption, "right"),
			bInside = this._isPosition(htOption, "inside");
		
		
		if (bLeft) {
			if (bInside) {
				htPosition.nLeft += htOption.nLeft;
			} else {
				htPosition.nLeft -= nLayerWidth;
				htPosition.nLeft -= htOption.nLeft;					
			}
		} else if (bRight) {
			htPosition.nLeft += nWidth;
			if (bInside) {
				htPosition.nLeft -= nLayerWidth;
				htPosition.nLeft -= htOption.nLeft;
			} else {
				htPosition.nLeft += htOption.nLeft;
			}
		} else {
			if (htOption.sAlign == "left") {
				htPosition.nLeft += htOption.nLeft;	
			}
			
			if (htOption.sAlign == "center") {
				htPosition.nLeft += (nWidth - nLayerWidth) / 2;
			}
				
			if (htOption.sAlign == "right") {
				htPosition.nLeft += nWidth - nLayerWidth;
				htPosition.nLeft -= htOption.nLeft;	
			}
		}
		return htPosition;
	},
	
	_setVerticalAlign : function (htOption, htPosition) {
		var el = this.getElement(),
			elLayer = this.getLayer(),
			nHeight = el.offsetHeight,
			nLayerHeight = elLayer.offsetHeight;
			
		if (el == document.body) {
			nHeight = jindo.$Document().clientSize().height;
		}
		
		switch (htOption.sValign) {
			case "top" :
				htPosition.nTop += htOption.nTop;	
			break;
			case "middle" :
				htPosition.nTop += (nHeight - nLayerHeight) / 2;
			break;
			case "bottom" :
				htPosition.nTop += nHeight - nLayerHeight - htOption.nTop;
			break;
		}
		
		return htPosition;
	},
	
	_adjustScrollPosition : function(htPosition) {
		/* 기준 엘리먼트가 body인 경우 scroll 포지션에 따른 보정 */
		if (this.getElement() == document.body) {
			var htScrollPosition = jindo.$Document().scrollPosition();
			htPosition.nTop += htScrollPosition.top;	
			htPosition.nLeft += htScrollPosition.left;
		}
		return htPosition;
	},
	
	/**
		옵션에 해당하는 레이어의 위치를 구한다.
		
		@method getPosition
		@param {Object} [htOption] TODO : 파라미터 설명달기
		@return {Object} htPosition
		@example
			oLayerPosition.getPosition({
				sPosition: "outside-bottom",
				sAlign: "left",
				sValign: "",
				nTop: 10, //지정되지 않으면 0으로 설정된다.
				nLeft: 10 //지정되지 않으면 0으로 설정된다.
			}); 
			
			(return value) htPosition = {
				nTop : (Number) 문서상의 y좌표
				nLeft : (Number) 문서상의 x좌표
			} 
	**/
	getPosition : function(htOption) {
		if (typeof htOption != "object") {
			htOption = this.option();
		} 
		if (typeof htOption.nTop == "undefined") {
			htOption.nTop = 0;
		}
		if (typeof htOption.nLeft == "undefined") {
			htOption.nLeft = 0;
		}
		
		var sArea,
			bCenter = this._isPosition(htOption, "center"),
			bInside = this._isPosition(htOption, "inside"),
			
			bTop = this._isPosition(htOption, "top"),
			bBottom = this._isPosition(htOption, "bottom"),
			bLeft = this._isPosition(htOption, "left"),
			bRight = this._isPosition(htOption, "right");
		
		if (bLeft) {
			sArea = "left";
		}
		if (bRight) {
			sArea = "right";
		}
		if (bTop) {
			sArea = "top";
		}
		if (bBottom) {
			sArea = "bottom";
		}
		if (bCenter){
			sArea = "center";
		}
		
		var el = this.getElement(),
			wel = jindo.$Element(el),
			elLayer = this.getLayer(),
			welLayer = jindo.$Element(elLayer),
			htElementPosition = wel.offset(),
			nWidth = el.offsetWidth,
			nHeight = el.offsetHeight,
			oClientSize,
			nLayerWidth = elLayer.offsetWidth,
			nLayerHeight = elLayer.offsetHeight,
			htPosition = {
				nTop: htElementPosition.top,
				nLeft: htElementPosition.left
			};
			
		if (el == document.body) {
			oClientSize = jindo.$Document().clientSize();
			nWidth = oClientSize.width;
			nHeight = oClientSize.height;
		}
		
		//Layer에 마진이 있는경우 렌더링 보정.
		nLayerWidth += parseInt(welLayer.css('marginLeft'), 10) + parseInt(welLayer.css('marginRight'), 10) || 0;
		nLayerHeight += parseInt(welLayer.css('marginTop'), 10) + parseInt(welLayer.css('marginBottom'), 10) || 0;
		
		switch (sArea) {
			case "center" :
				htPosition.nTop += (nHeight - nLayerHeight) / 2;
				htPosition.nTop += htOption.nTop;
				htPosition.nLeft += (nWidth - nLayerWidth) / 2;
				htPosition.nLeft += htOption.nLeft;
			break;
			case "top" :
				if (bInside) {
					htPosition.nTop += htOption.nTop;	
				} else {
					htPosition.nTop -= htOption.nTop + nLayerHeight;
				}
				htPosition = this._setLeftRight(htOption, htPosition);
			break;
			case "bottom" :
				htPosition.nTop += nHeight;
				if (bInside) {
					htPosition.nTop -= htOption.nTop + nLayerHeight;
				} else {
					htPosition.nTop += htOption.nTop;
				}
				htPosition = this._setLeftRight(htOption, htPosition);
			break;
			case "left" :
				if (bInside) {
					htPosition.nLeft += htOption.nLeft;
				} else {
					htPosition.nLeft -= htOption.nLeft + nLayerWidth;
				}
				htPosition = this._setVerticalAlign(htOption, htPosition);
			break;
			case "right" :
				htPosition.nLeft += nWidth;
				if (bInside) {
					htPosition.nLeft -= htOption.nLeft + nLayerWidth;
				} else {
					htPosition.nLeft += htOption.nLeft;
				}
				htPosition = this._setVerticalAlign(htOption, htPosition);
			break;
		}
		
		htPosition = this._adjustScrollPosition(htPosition);

		//[2572]IE6에서 IFrame 내부에 있고, FrameBorder가 있는 경우 2px보정
		if(jindo.$Agent().navigator().ie && jindo.$Agent().navigator().version < 8 && window.external){
			try{
				var bHasFrameBorder = (window != top) && (window.frameElement) && !window.frameElement.frameBorder;
				if(bHasFrameBorder){
					htPosition.nLeft -= 2;
					htPosition.nTop -= 2;
				}
			}catch(e){}
		}
		
		return htPosition;
	},
	
	/**
		레이어를 지정된 옵션에 맞게 위치시킨다.
		
		@method setPosition
		@param {Object} [htPosition] 위치에 대한 객체 (생략시, 설정된 옵션에 따라 자동으로 계산된다)
		@return {this} 인스턴스 자신
		@remark css의 top, left 속성으로 위치를 설정한다. 
		@example
			oLayerPosition.setPosition({ nTop : 100, nLeft : 100 });
	**/
	setPosition : function(htPosition){
		var welLayer = jindo.$Element(this.getLayer()),
			bVisible = welLayer.visible(); 
		
		if (!bVisible) {
			welLayer.show();
		}
		welLayer.css("left", "-9999px").css("top", "0px");
		
		if (typeof htPosition == "undefined") {
			htPosition = this.getPosition();
		}
		if (this.option("bAuto")) {
			htPosition = this._adjustPosition(htPosition);
		}
		welLayer.css("left", htPosition.nLeft + "px").css("top", htPosition.nTop + "px"); //offset으로 설정할경우 간혹 수치가 맞지 않음
		
		if (!bVisible) {
			welLayer.hide();
		}
		return this;
	},
	
	/**
		현재 레이어의 위치를 구한다.
		
		@method getCurrentPosition
		@return {Object}
		@remark 설정된 css의 top, left 속성값을 숫자값으로 리턴한다.
		@example
			(return value) htPosition = {
				nTop : (Number) 문서상의 y좌표
				nLeft : (Number) 문서상의 x좌표
			} 
	**/
	getCurrentPosition : function() {
		var welLayer = jindo.$Element(this.getLayer());
			
		return {
			nTop : parseInt(welLayer.css("top"), 10),
			nLeft : parseInt(welLayer.css("left"), 10)
		};
	},
	
	/**
		레이어 전체가 화면에 보이는지 여부를 가져온다.
		@param {Object} htPosition
		@return {Boolean}
		@ignore
	**/
	_isFullyVisible : function(htPosition){
		var elLayer = this.getLayer(),
			welLayer = jindo.$Element(elLayer),
			oScrollPosition = jindo.$Document().scrollPosition(),
			nScrollTop = oScrollPosition.top, 	//top
			nScrollLeft = oScrollPosition.left,	//left
			oClientSize = jindo.$Document().clientSize(),
			nLayerWidth = elLayer.offsetWidth + (parseInt(welLayer.css('marginLeft'), 10) + parseInt(welLayer.css('marginRight'), 10) || 0),
			nLayerHeight = elLayer.offsetHeight + (parseInt(welLayer.css('marginTop'), 10) + parseInt(welLayer.css('marginBottom'), 10) || 0);
		
		if (htPosition.nLeft >= 0 && 
			htPosition.nTop >= 0 && 
			oClientSize.width >= htPosition.nLeft - nScrollLeft + nLayerWidth && 
			oClientSize.height >= htPosition.nTop - nScrollTop + nLayerHeight) {
			return true;
		}
		return false;
	},
	
	/**
		가로방향으로 반전되어 배치되도록 변환된 옵션 객체를 가져온다.
		@param {Object} htOption
		@return {Object} htOption
		@ignore
	**/
	_mirrorHorizontal : function(htOption) {
		if (htOption.sAlign == "center" || htOption.sPosition == "inside-center") {
			return htOption;
		}
		
		var htConvertedOption = {};
		for (var i in htOption) {
			htConvertedOption[i] = htOption[i];
		}
		
		if (this._isPosition(htConvertedOption, "right")) {
			htConvertedOption.sPosition = htConvertedOption.sPosition.replace(/right/, "left");
		} else if (this._isPosition(htConvertedOption, "left")) {
			htConvertedOption.sPosition = htConvertedOption.sPosition.replace(/left/, "right");
		} else if (htConvertedOption.sAlign == "right") {
			htConvertedOption.sAlign = "left";
		} else if (htConvertedOption.sAlign == "left") {
			htConvertedOption.sAlign = "right";
		}
		
		return htConvertedOption;
	},
	
	/**
		세로방향으로 반전되어 배치되도록 변환된 옵션 객체를 가져온다.
		@param {Object} htOption
		@return {Object} htOption
		@ignore
	**/
	_mirrorVertical : function(htOption) {
		if (htOption.sValign == "middle" || htOption.sPosition == "inside-center") {
			return htOption;
		}
		
		var htConvertedOption = {};
		for (var i in htOption) {
			htConvertedOption[i] = htOption[i];
		}
		
		if (this._isPosition(htConvertedOption, "top")) {
			htConvertedOption.sPosition = htConvertedOption.sPosition.replace(/top/, "bottom");
		} else if (this._isPosition(htConvertedOption, "bottom")) {
			htConvertedOption.sPosition = htConvertedOption.sPosition.replace(/bottom/, "top");
		} else if (htConvertedOption.sValign == "top") {
			htConvertedOption.sValign = "bottom";
		} else if (htConvertedOption.sValign == "bottom") {
			htConvertedOption.sValign = "top";
		}
		
		return htConvertedOption;
	},
	
	/**
		레이어가 항상 보이도록 위치를 자동 조절한다.
		우선순위는 가로 반전, 세로반전, 가로세로반전 순이다.
		모든 경우에도 레이어 전체가 보이지 않을 경우 원위치시킨다.
		@param {Object} htPosition
		@return {Object} htOption
		@ignore
	**/
	_adjustPosition: function(htPosition){
		var htOption = this.option(),
			aCandidatePosition = [];
		
		aCandidatePosition.push(htPosition);
		aCandidatePosition.push(this.getPosition(this._mirrorHorizontal(htOption)));
		aCandidatePosition.push(this.getPosition(this._mirrorVertical(htOption)));
		aCandidatePosition.push(this.getPosition(this._mirrorVertical(this._mirrorHorizontal(htOption))));
		
		for (var i = 0, htCandidatePosition; (htCandidatePosition = aCandidatePosition[i]); i++) {
			if (this._isFullyVisible(htCandidatePosition)) {
				htPosition = htCandidatePosition;
				break;
			}
		}
		return htPosition;
	}
}).extend(jindo.Component);
/**
	@fileOverview jindo.RolloverArea와 달리 mousedown/mouseup이 아닌 click과 dbclick이벤트를 체크하는 컴포넌트
	@version 1.1.0
**/
/**
	RolloverArea와 달리 mousedown/mouseup이 아닌 click이벤트를 체크하는 컴포넌트
	RolloverClick 컴포넌트는 기준 엘리먼트의 자식들 중 특정 클래스명을 가진 엘리먼트에 마우스액션이 있을 경우 클래스명을 변경하는 이벤트를 발생시킨다.
	
	@class jindo.RolloverClick
	@extends jindo.UIComponent
	@requires jindo.RolloverArea
	@keyword rolloverclick, click, 롤오버클릭
**/
jindo.RolloverClick = jindo.$Class({
	/** @lends jindo.RolloverClick.prototype */
	
	/**
		RolloverClick 컴포넌트를 초기화한다.
		
		@constructor
		@param {HTMLElement} el RolloverArea에 적용될 상위 기준 엘리먼트. 컴포넌트가 적용되는 영역(Area)이 된다.
		@param {Object} [htOption] 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 초기화 시점에 컴포넌트를 활성화(이벤트 바인딩) 시킬지 여부. false로 지정한경우에는 사용자가 직접 activate함수를 사용하여 활성화시킬수 있다.
			@param {String} [htOption.sCheckEvent="click"] 체크할 마우스이벤트명. "mousedown" 혹은 "mouseup"으로 대체가능
			@param {Boolean} [htOption.bCheckDblClick=false] 더블클릭 이벤트를 체크할것인지 여부
			@param {Object} [htOption.RolloverArea] RolloverArea에 적용될 옵션 (RolloverArea 컴포넌트 문서 참고)
				@param {String} [htOption.RolloverArea.sClassName="rollover"] TODO : 파라미터 설명달기
				@param {String} [htOption.RolloverArea.sClassPrefix="rollover-"] TODO : 파라미터 설명달기
				@param {Boolean} [htOption.RolloverArea.bCheckMouseDown=false] TODO : 파라미터 설명달기
				@param {Boolean} [htOption.RolloverArea.bActivateOnload=false] TODO : 파라미터 설명달기
				@param {Object} [htOption.RolloverArea.htStatus] TODO : 파라미터 설명달기
				@param {String} [htOption.RolloverArea.htStatus.sOver="over"] TODO : 파라미터 설명달기
				@param {String} [htOption.RolloverArea.htStatus.sDown="down"] TODO : 파라미터 설명달기
		@exmaple
			var oRolloverClick = new jindo.RolloverClick(document.body,{bActivateOnload:flase, ... });
			oRolloverClick.activate();
	**/
	$init : function(el, htOption) {
		this.option({ 
			bActivateOnload : true,
			sCheckEvent : "click",
			bCheckDblClick : false, // (Boolean) 더블클릭이벤트를 체크할 지 여부
			RolloverArea : { //RolloverArea에 적용될 옵션 객체
				sClassName : "rollover", // (String) 컴포넌트가 적용될 엘리먼트의 class 명. 상위 기준 엘리먼트의 자식 중 해당 클래스명을 가진 모든 엘리먼트에 Rollover 컴포넌트가 적용된다.
				sClassPrefix : "rollover-", // (String) 컴포넌트가 적용될 엘리먼트에 붙게될 class명의 prefix. (prefix+"over|down")
				bCheckMouseDown : false,
				bActivateOnload : false,
				htStatus : {
					sOver : "over", // (String) mouseover시 추가될 클래스명
					sDown : "down" // (String) mousedown시 추가될 클래스명
				}  
			}
		});
		this.option(htOption || {});
		
		var self = this;
		this._oRolloverArea = new jindo.RolloverArea(el, this.option("RolloverArea")).attach({
			over : function(oCustomEvent) {
				/**
					MouseOver 이벤트 발생시(적용된 Element에 마우스가 커서가 올라간 경우)
					
					@event over
					@param {String} sType 커스텀이벤트명
					@param {HTMLElement} element 이벤트가 발생 Element
					@param {Object} htStatus htStatus 옵션값
					@param {jindo.$Event} weEvent 이벤트 객체
					@param {Function} stop 수행시 클래스명이 추가되지 않는다
					@example
						oRolloverClick.attach("over", function(oCustomEvent) { ... });
				**/
				if (!self.fireEvent("over", oCustomEvent)) {
					oCustomEvent.stop();
				}
			},
			out : function(oCustomEvent) {
				/**
					MouseOut 이벤트 발생시(적용된 Element에서 마우스가 빠져나간 경우)
					
					@event out
					@param {String} sType 커스텀이벤트명
					@param {HTMLElement} element 이벤트가 발생 Element
					@param {Object} htStatus htStatus 옵션값
					@param {jindo.$Event} weEvent 이벤트 객체
					@param {Function} stop 수행시 클래스명이 제거되지 않는다
					@example
						oRolloverClick.attach("out", function(oCustomEvent) { ... });
				**/
				if (!self.fireEvent("out", oCustomEvent)) {
					oCustomEvent.stop();
				}
			}
		});
		this._wfClick = jindo.$Fn(this._onClick, this);
		this._wfDblClick = jindo.$Fn(this._onClick, this);
		
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},
	
	_onClick : function(we) {
		var elRollover = we.element,
			sType = "click";
			
		if (we.type == "dblclick") {
			sType = we.type;
		}
		
		while ((elRollover = this._oRolloverArea._findRollover(elRollover))) {
			/**
				click 이벤트 발생시(적용된 Element 위에서 마우스가 클릭된경우 발생)
				
				@event click
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@example
					oRolloverClick.attach("click", function(oCustomEvent) { ... });
			**/
			/**
				dblclick 이벤트 발생시(적용된 Element에 마우스를 눌렀다가 놓은 경우 발생)
				
				@event dblclick
				@param {String} sType 커스텀이벤트명
				@param {HTMLElement} element 이벤트가 발생 Element
				@param {Object} htStatus htStatus 옵션값
				@param {jindo.$Event} weEvent 이벤트 객체
				@example
					oRolloverClick.attach("dblclick", function(oCustomEvent) { ... });
			**/
			this.fireEvent(sType, { 
				element : elRollover,
				htStatus : this._oRolloverArea.option("htStatus"),
				weEvent : we
			});
			
			elRollover = elRollover.parentNode;
		}
	},
	
	/**
		RolloverClick를 활성화시킨다.
		@return {this}
	**/
	_onActivate : function() {
		this._wfClick.attach(this._oRolloverArea._elArea, this.option("sCheckEvent"));
		if (this.option("bCheckDblClick")) {
			this._wfDblClick.attach(this._oRolloverArea._elArea, 'dblclick');
		}
		this._oRolloverArea.activate();
	},
	
	/**
		RolloverClick를 비활성화시킨다.
		@return {this}
	**/
	_onDeactivate : function() {
		this._wfClick.detach(this._oRolloverArea._elArea, this.option("sCheckEvent"));
		this._wfDblClick.detach(this._oRolloverArea._elArea, 'dblclick');
		this._oRolloverArea.deactivate();
	}
}).extend(jindo.UIComponent);
/**
	@fileOverview Ajax History  
	@author AjaxUI-1 <TarauS> modified by senxation
	@version 1.1.0
**/

/**
    한 페이지내에서 모든 기능을 구현하는 서비스에서 브라우저 히스토리 기능을 사용 할 수 있도록 하는 컴퍼넌트
    
    @class jindo.AjaxHistory
    @extends jindo.Component
    
    @keyword ajax, history, 히스토리, hash, 해쉬, 해시, pushState
**/
jindo.AjaxHistory = jindo.$Class({
	/** @lends jindo.AjaxHistory.prototype */
	
	/**
		이벤트 핸들러 저장 객체
		@type {HashTable}
	**/
	_htEventHandler : {},
	/**
		히스토리 데이터 저장 객체
		@type {HashTable}
	**/
	_htHistoryData : {},
	/**
		에이전트 정보 저장 객체
		@type {Object}
	**/
	_oAgent : null,
	/**
		IE 7이하에서 사용할 아이프레임 객체
		@type {WrappingElement}
	**/
	_welIFrame : null,
	/**
		setInterval()의 리턴 값
		@type {Number}
	**/
	_nIntervalId : 0,
	/**
		로케이션 변경 체크 방법
		@type {String}
	**/
	_sCheckType : "",
	/**
		컴포넌트 인스턴스의 고유 아이디 값
		@type {String}
	**/
	_sComponentId : "",

	/**
		스태틱 메소드
		@private
	**/
	$static : {
		/**
			IE7 이하의 브라우저에서 로케이션 변경을 체크하기 위한 함수<br/>
			Hidden IFrame의 history.html이 로딩될 때마다 이 함수를 호출 함
			
			@method checkIFrameChange
			@static
			@private
			@param oLocation
		**/
		checkIFrameChange : function(oLocation){
			var htQueryString = jindo.$S(oLocation.search.substring(1)).parseString();
			this.getInstance()[0]._checkLocationChange(encodeURIComponent(htQueryString.hash));
			/*
			for(var i=0; i<aInstanceList.length; i++){
				if(htQueryString.componentId == aInstanceList[i].getComponentId()){
				alert("iframe callback : "+htQueryString.hash);
					aInstanceList[i]._checkLocationChange(encodeURIComponent(htQueryString.hash));
					break;
				}
			}
			*/
		}
	},
	
	/**
		@constructor
		@param {Object} [htOption] 초기화 옵션 객체
			@param {Number} [htOption.nCheckInterval=100] IE 7 이하나 onhashchange 이벤트를 지원하지 않는 브라우저에서 location.hash의 변경을 체크할 주기.<br/>특별히 문제가 없을 경우, 변경을 할 필요 없음
			@param {String} [htOption.sIFrameUrl="history.html"] IE7 이하의 브라우저에서 로케이션 변경을 체크하기 위해 로딩하는 웹문서의 위치
		@example
			var oAjaxHistoryInstance = new jindo.AjaxHistory({
				// IE7 이하의 브라우저에서 로케이션 변경을 체크하기 위해 로딩하는 웹문서의 위치
				"sIFrameUrl" : "history.html",
				// attach() 함수를 사용하지 않고, 초기화 시에 이벤트 핸들러를 연결하기 위해 사용
				"htCustomEventHandler" : {
					"load" : function(){
						alert("load event");
					},
					"change" : function(oChangeEvent){
						alert("change event");
					}
				},
				// setInterval()을 이용하여 로케이션 변경을 체크 시, 체크 주기
				"nCheckInterval" : 100
			});
		
			oAjaxHistoryInstance.initialize(); //초기화
			oAjaxHistoryInstance.addHistory({
				"sPageType" : "layer",
				"aParameter" : [
					"1", "2", "3"
				]
			});
	**/
	$init : function(htOption){
		this._oAgent = jindo.$Agent().navigator();
		this._sComponentId = "AjaxHistory"+(new Date()).getTime();
		this.option({
			sIFrameUrl : "history.html",
			nCheckInterval : 100
		});
		this.option(htOption || {});
	},

	/**
		컴포넌트 초기화 후에, 로케이션 변경 체크 및 초기 이벤트 발생을 위한 초기화 함수
		
		@method initialize
		@return {this}
	**/
	initialize : function(){
		var sHash = this._getLocationHash();
		
		// onHashChange 이벤트를 지원하는 경우
		if((this._oAgent.ie && (document.documentMode||this._oAgent.version) >= 8 && jindo.$Document().renderingMode() == "Standards") || (this._oAgent.firefox && this._oAgent.version >= 3.6) || (this._oAgent.chrome && this._oAgent.version > 3) || (this._oAgent.safari && this._oAgent.version >= 5) || (this._oAgent.opera && this._oAgent.version >= 10.6)){
			this._htEventHandler["hashchange"] = jindo.$Fn(this._checkLocationChange, this).attach(window, "hashchange");
			this._sCheckType = "hashchangeevent";
		// IE 7 이하인 경우
		}else if(this._oAgent.ie){
			this._welIFrame = jindo.$Element("<IFRAME>");
			this._welIFrame.hide();
			this._welIFrame.appendTo(document.body);
			this._sCheckType = "iframe";
			
		// setInterval() 함수를 이용하여 체크해야 하는 경우
		}else{
			this._nIntervalId = setInterval(jindo.$Fn(this._checkLocationChange, this).bind(), this.option("nCheckInterval"));
			this._sCheckType = "setinterval";
		}

		if(sHash&&sHash!="%7B%7D"){
			
			if(this._sCheckType == "iframe"){
				this._welIFrame.$value().src = this.option("sIFrameUrl") + "?hash=" + sHash;
			}else{
				this._htHistoryData = this._getDecodedData(sHash);
				/**
					사용자가 앞으로/뒤로가기 버튼을 눌러 이동을 하거나 히스토리 데이터가 포함된 URL을 이용하여 접근시 발생
					
					@event change
					@param {String} sType 커스텀이벤트명
					@param {Object} htHistoryData 커스텀이벤트객체 프로퍼티2
					@example
						oAjaxHistory.attach("change", function(oCustomEvent){
							// htHistoryData의 데이터를 바탕으로 화면의 UI를 재구성
							if(oChangeEvent.sPageType == "main_page"){
								showPage(oChangeEvent.sLayer, oChangeEvent.nPage);
							}else{
								showPageAnother(oChangeEvent.sLayer, oChangeEvent.nPage);
							}
						});
				**/
				this.fireEvent("change", {
					htHistoryData : this._htHistoryData
				});
			}
		}else{
			
			var that = this;
			if(this._oAgent.ie&&(document.documentMode||this._oAgent.version) < 8){
				var ifr = this._welIFrame.$value();
			    ifr.onreadystatechange = function(){
			        if (ifr.readyState == "complete"){
			        	/**
			        	 * 페이지 로딩시 발생되는데, URL에 히스토리 데이터를 포함하고 있을 경우엔 load 이벤트 대신 change 이벤트가 발생
			        	 *
			        	 * @event load
			        	 * @param {String} sType 커스텀이벤트명
			        	 * @example
			        	 * 	oAjaxHistory.attach("load", function(oCustomEvent) {
			        	 * 		//히스토리 데이터를 포함하지 않은 URL로 페이지가 로딩되었을 경우, 초기 UI 구성에 대한 작업을 수행
			        	 * 	});
			        	 */
						that.fireEvent("load");
						ifr.onreadystatechange = function(){};
			        }
			    };

				ifr.src = this.option("sIFrameUrl");
			}else{
				setTimeout(function(){
					that.fireEvent("load");	
				},0);	
			}
		}
		
		return this;
	},

	/**
		컴포넌트의 고유 아이디를 리턴
		
		@method getComponentId
		@return {String} 컴포넌트 고유 아이디
	**/
	getComponentId : function(){
		return this._sComponentId;
	},

	/**
		현재 설정되어 있는 Hash String을 리턴
        @method _getLocationHash
        @private
		@return {String} 현재 설정된 Hash String
	**/
	_getLocationHash : function(){
		return this._oAgent.firefox ? encodeURIComponent(location.hash.substring(1)) : (location.hash.substring(1)||"%7B%7D");
	},

	/**
		location.hash 설정 함수
		@method _setLocationHash
		@private
		@param {String} sHash location.hash를 sHash로 변경
	**/
	_setLocationHash : function(sHash){
		location.hash = sHash=="%7B%7D"?"":sHash;
	},

	/**
		htHistoryData를 브라우저의 히스토리에 추가
		
		@method addHistory
		@param {Object} htHistoryData 추가할 히스토리 데이터 객체
		@return {Boolean} 히스토리 추가 결과
	**/
	addHistory : function(htHistoryData){;
		if(htHistoryData && typeof(htHistoryData) == "object" && jindo.$H(htHistoryData).length() > 0){
			this._htHistoryData = jindo.$Json(jindo.$Json(htHistoryData).toString()).toObject(); //deep copy
			var sHash = this._getEncodedData(htHistoryData);

			// 현재 설정된 데이터와 추가하려는 데이터가 같지 않을 경우에만 히스토리에 추가
			if(this._getLocationHash() != sHash){
				this._setLocationHash(sHash);
				if(this._sCheckType == "iframe"){
					this._welIFrame.$value().src = this.option("sIFrameUrl") + "?hash=" + sHash;
				}
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
	},

	/**
		히스토리 변경을 체크하여 change 이벤트를 발생시키는 함수
		
        @method _checkLocationChange
        @private
		@param {String} [sHash] 로케이션 변경 체크 시, 사용할 히스토리 데이터 문자열
	**/
	_checkLocationChange : function(sHash){
		sHash = sHash=="undefined" ? "%7B%7D": sHash;
//		console.log(sHash)
		sHash = (sHash && typeof(sHash) == "string") ? sHash : this._getLocationHash();
		var htCurrentHistoryData = this._getDecodedData(sHash);
//		console.log(htCurrentHistoryData);
		
		if(!this._compareData(this._htHistoryData, htCurrentHistoryData)){
			this._htHistoryData = htCurrentHistoryData;
			if(this._sCheckType == "iframe"){
				this._setLocationHash(sHash);
			}
//			console.log(this._htHistoryData);
			// change 이벤트 발생
			this.fireEvent("change", {
				htHistoryData : this._htHistoryData
			});
		}
	},

	/**
		htHistoryData 객체를 Json 문자열로 변환 후, 인코딩하여 리턴
		- JSON.stringify() 함수를 브라우저에서 지원할 경우, 해당 함수 사용
		- 위의 함수를 지원하지 않을 경우, jindo.$Json().toString() 함수 사용

        @method _getEncodedData
        @private
		@param {Object} htHistoryData 히스토리 데이터 객체
		@return {String} Json 문자열로 변환 후, 인코딩한 문자열
	**/
	_getEncodedData : function(htHistoryData){
		if(htHistoryData){
			// JSON.stringify() 함수를 지원하는 경우
			if(typeof(JSON) == "object" && typeof(JSON.stringify) == "function"){
				return encodeURIComponent(JSON.stringify(htHistoryData));
			}else{
				return encodeURIComponent(jindo.$Json(htHistoryData).toString());
			}
		}else{
			return "";
		}
	},
	
	/**
		인코딩된 히스토리 데이터를 HashTable 객체로 변환 후, 리턴
		- JSON.parse() 함수를 브라우저에서 지원할 경우, 해당 함수 사용
		- 위의 함수를 지원하지 않을 경우, jindo.$Json().toObject() 함수 사용

        @method _getDecodedData
        @private
		@param {String} sEncodedHash 인코딩된 히스토리 데이터
		@return {Object} 디코딩 후, HashTable로 변환한 객체
	**/
	_getDecodedData : function(sEncodedHash){
		try {
			if(sEncodedHash){
				var sHashString = decodeURIComponent(sEncodedHash);
				// JSON.parse() 함수를 지원하는 경우
				if(typeof(JSON) == "object" && typeof(JSON.parse) == "function"){
					return JSON.parse(sHashString);
				}else{
					return jindo.$Json(sHashString).toObject();
				}
			}
		} catch (e) {}
		return {};
	},

	/**
		두 데이터 객체를 비교하여 결과를 리턴
		- 하위 데이터가 Object나 Array일 경우, 재귀적으로 비교

        @method _compareData
        @private
		@param {Object} htBase 비교 기준 객체
		@param {Object} htComparison 비교 객체
		@param {Boolean} 비교 결과
	**/
	_compareData : function(htBase, htComparison){
		
		if (!htBase || !htComparison) { return false; }
			
		var wBase = htBase instanceof Array ? jindo.$A(htBase) : jindo.$H(htBase);
		var wComparison = htComparison instanceof Array ? jindo.$A(htComparison) : jindo.$H(htComparison);
		
		if (wBase.length() != wComparison.length()) { return false; }
		
		var bRet = true;
		var fpCallee = arguments.callee;
		
		wBase.forEach(function(v, k) {
			
			if(typeof(v) == "object"){
				if(!fpCallee(v, htComparison[k])){
					bRet = false;
					return;
				}
			}else{
				if(v != htComparison[k]){
					bRet = false;
					return;
				}
			}
			
		});
		
		return bRet;

	},

	/**
		컴포넌트 소멸자
		
		@method destroy
	**/
	destroy : function(){
		// 설정된 로케이션 체크 방법을 해제
		if(this._sCheckType == "hashchangeevent"){
			this._htEventHandler["hashchange"].detach(window, "hashchange");
		}else if(this._sCheckType == "iframe"){
			this._welIFrame.leave();
		}else{
			clearInterval(this._nIntervalId);
		}
		// 프로퍼티 초기화
		this._htEventHandler = null;
		this._htHistoryData = null;
		this._oAgent = null;
		this._welIFrame = null;
		this._nIntervalId = null;
		this._sCheckType = null;
		this._sComponentId = null;
	}
}).extend(jindo.Component);
/**
	@fileOverview 리스트의 아이템들을 부드러운 움직임으로 이동시켜 볼 수 있도록하는 컴포넌트 
	@author hooriza, modified by senxation
	@version 1.1.0
**/
/**
	리스트의 아이템들을 부드러운 움직임으로 이동시켜 볼 수 있도록하는 컴포넌트
	
	@class jindo.Rolling
	@extends jindo.Component
	@requires jindo.Effect
	@requires jindo.Transition
	@keyword rolling, 롤링
**/
jindo.Rolling = jindo.$Class({
	/** @lends jindo.Rolling.prototype */
	
	_oTransition : null,

	/**
		Rolling 컴포넌트를 생성한다.
		
		@constructor
		@param {String | HTMLElement} el 리스트를 감싸고 있는 엘리먼트의 id 혹은 엘리먼트 자체  
		@param {Object} [htOption] 옵션객체
			@param {Number} [htOption.nFPS=50] 초당 롤링 이동을 표현할 프레임수
			@param {Number} [htOption.nDuration=800] transition이 진행 될 시간, 단위 ms
			@param {String} [htOption.sDirection="horizontal"] 롤링의 방향 설정.
		<ul>
		<li>"horizontal" : 가로</li>
		<li>"vertical" : 세로</li>
		</ul>
		@param {Function} [htOption.fEffect=jindo.Effect.linear] jindo.Effect 이펙트 함수
		@example
			<xmp>
			<div id="horz_wrap">
				<ul>
					<li>첫번째</li>
					<li>두번째</li>
					<li>세번째</li>
					<li>네번째</li>
					<li>다섯번째</li>
					<li>여섯번째</li>
					<li>일곱번째</li>
					<li>여덟번째</li>
					<li>아홉번째</li>
					<li>마지막</li>
				</ul>
			</div>
			<script>
				new jindo.Rolling(jindo.$('horz_wrap'), {
					nFPS : 50, // (Number) 초당 롤링 이동을 표현할 프레임수
					nDuration : 400, // (ms) jindo.Effect, jindo.Transtition 참고
					sDirection : 'horizontal', // || 'vertical'
					fEffect : jindo.Effect.linear, //jindo.Effect 참고
				}).attach({
					beforeMove : function(oCustomEvent) {
						//oCustomEvent.element 어느 엘리먼트의 scrollLeft 가 바뀌는지
						//oCustomEvent.nIndex 몇번째 항목으로 이동하는지
						//oCustomEvent.nScroll 이동할 포지션
						//oCustomEvent.stop()시 이동하지 않음
					},
					afterMove : function(oCustomEvent) {
						//oCustomEvent.nIndex 몇번째 항목으로 이동하였는지
					}
				});
			</script>
			</xmp>
	**/
	$init : function(el, htOption) {
		this._el = jindo.$(el);
		this._elList = jindo.$$.test(this._el, 'ul, ol') ? this._el : jindo.$$.getSingle('> ul, > ol', el);
		
		this.option({
			nFPS : 50,
			nDuration : 800,
			sDirection : "horizontal",
			fEffect : jindo.Effect.linear
		});
		
		this.option(htOption || {});
		
		this._oKeys = this.option('sDirection') == 'horizontal' ? {
			offsetWidth : 'offsetWidth',
			marginLeft : 'marginLeft',
			marginRight : 'marginRight',
			clientWidth : 'clientWidth',
			scrollLeft : 'scrollLeft'
		} : {
			offsetWidth : 'offsetHeight',
			marginLeft : 'marginTop',
			marginRight : 'marginBottom',
			clientWidth : 'clientHeight',
			scrollLeft : 'scrollTop'
		};

		this._initTransition();
	},
	
	_initTransition: function(){
		var self = this;
		this._oTransition = new jindo.Transition().fps(this.option("nFPS")).attach({
			end : function(oCustomEvent) {
				/**
					이동한 후
					
					@event afterMove
					@param {String} sType 커스텀이벤트명
					@param {Number} nIndex 이동한 항목의 리스트내 순서
					@example
						// 커스텀이벤트 핸들링 예제
						oRolling.attach("afterMove", function(oCustomEvent) { ... });
				**/
				self.fireEvent("afterMove", { nIndex : self.getIndex() });
			}
		});
	},
	
	/**
		jindo.Transition 컴포넌트의 인스턴스를 가져온다.
		
		@method getTransition
		@return {jindo.Transition}
	**/
	getTransition : function() {
		return this._oTransition;
	},
	
	/**
		리스트 엘리먼트를 구한다
		
		@method getList
		@return {HTMLElement} 리스트 엘리먼트 ul 또는 ol
	**/
	getList : function() {
		return this._elList;
	},
	
	/**
		리스트의 아이템(LI, 즉 자식 엘리먼트)들을 구한다.
		
		@method getItems
		@return {Array} LI 엘리먼트들의 배열
	**/
	getItems : function() {
		return jindo.$$('> li', this._elList);
	},
	
	_offsetSize : function(el) {
		var eEl = jindo.$Element(el),
			oKeys = this._oKeys,
			nMarginLeft = parseInt(eEl.css(oKeys.marginLeft), 10) || 0,
			nMarginRight = parseInt(eEl.css(oKeys.marginRight), 10) || 0;
		return el[oKeys.offsetWidth] + nMarginLeft + nMarginRight;
	},
	
	/**
		현재 표시되고있는 LI의 인덱스를 구한다.
		
		@method getIndex
		@return {Number} 현재 표시되고있는 LI의 인덱스
	**/
	getIndex : function() {
		if (this.isMoving()) {
			return this._nMoveTo;
		}
		
		var el = this._el,
			oKeys = this._oKeys,
			nScroll = el[oKeys.scrollLeft],
			aItems = this.getItems(),
			nSize = 0,
			n = 0,
			nMinDistance = 99999999;

		for (var i = 0; i < aItems.length; i++) {
			var nDistance = Math.abs(nScroll - nSize);
			
			if (nDistance < nMinDistance) {
				nMinDistance = nDistance;
				n = i;
			}
			
			nSize += this._offsetSize(aItems[i]);
		}
		
		return n;
	},
	
	_getPosition : function (n) {
		var el = this._el,
			oKeys = this._oKeys,
			aItems = this.getItems(),
			nPos = 0, nSize = this._getSize();
		
		for (var i = 0; i < n; i++) {
			nPos += this._offsetSize(aItems[i]);
		}
		
		if (nPos + el[oKeys.clientWidth] > nSize) {
			nPos = nSize - el[oKeys.clientWidth];
		}
		
		return nPos;
	},
	
	_getSize : function() {
		var aItems = this.getItems(),
			nSize = 0;
			
		for (var i = 0; i < aItems.length; i++) {
			nSize += this._offsetSize(aItems[i]);
		}
		
		return (this._nSize = nSize);
	},
	
	_move : function(n) {
		var el = this._el,
			oKeys = this._oKeys,
			aItems = this.getItems(),
			nPos = this._getPosition(n),
			nSize = this._getSize();

		var htParam = {
			element : el, // 어느 엘리먼트의 scrollLeft 가 바뀌는지
			nIndex : n, // 몇번째 항목으로 이동하는지
			nScroll : nPos
		};
		
		/**
			이동하기 전
			
			@event beforeMove
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} element scrollLeft또는 scrollTop이 바뀔 대상 엘리먼트
			@param {Number} nIndex 이동할 항목의 리스트내 순서
			@param {Number} nScroll 이동할 스크롤위치
			@param {Function} stop 수행시 이동하지 않음
			@example
				// 커스텀이벤트 핸들링 예제
				oRolling.attach("beforeMove", function(oCustomEvent) { ... });
		**/
		if (this.fireEvent('beforeMove', htParam) && el[oKeys.scrollLeft] != htParam.nScroll) {
			 
			var htDest = {};
			htDest[oKeys.scrollLeft] = this.option('fEffect')(htParam.nScroll);
			this._nMoveTo = n;
			
			this.getTransition().abort().start(this.option('nDuration'), htParam.element, htDest);
			return true;
		}
		return false;
	},
	
	/**
		n번째 아이템으로 이동한다.
		
		@method moveTo
		@param {Number} n TODO : 파라미터 설명달기
		@return {Boolean} 실제로 이동했는지 여부 
	**/
	moveTo : function(n) {
		n = Math.min(n, this.getItems().length - 1);
		n = Math.max(n, 0);
		return this._move(n);
	},

	/**
		뒤에서부터 n번째 아이템으로 이동한다.
		
		@method moveLastTo
		@param {Number} n TODO : 파라미터 설명달기
		@return {Boolean} 실제로 이동했는지 여부
	**/
	moveLastTo : function(n) {
		return this.moveTo(this.getItems().length - 1 - n);
	},

	/**
		현재 위치와 n만큼 떨어진 아이템으로 이동한다.
		
		@method moveBy
		@param {Number} n TODO : 파라미터 설명달기
		@return {Boolean} 실제로 이동했는지 여부
	**/
	moveBy : function(n) {
		return this.moveTo(this.getIndex() + n);
	},
	
	/**
		롤링이 진행중인지 여부를 가져온다.
		
		@method isMoving
		@return {Boolean}
	**/
	isMoving : function() {
		return this._oTransition.isPlaying();
	},
	
	/**
		리스트의 아이템들이 가려있는지 여부를 가져온다.
		
		@method isOverflowed
		@return {Boolean} 리스트의 아이템들이 가려있는지 여부
	**/
	isOverflowed : function() {
		return this._getSize() > this._el[this._oKeys.clientWidth];
	},
	
	/**
		롤링 영역 내에서 잘리지 않고 온전히 보여지는 아이템의 개수를 가져온다.
		
		@method getDisplayedItemCount
		@return {Number}
	**/
	getDisplayedItemCount : function() {
		var nDisplayed = 0,
			aItems = this.getItems(),
			nPos = 0;
		
		for (var i = 0; i < aItems.length; i++) {
			nPos += this._offsetSize(aItems[i]);
			if (nPos <= this._el[this._oKeys.clientWidth]) {
				nDisplayed++; 
			} else {
				break;
			}
		}
		
		return nDisplayed;
	}

}).extend(jindo.Component);
/**
	@fileOverview 탭이동을 구현한 컴포넌트
	@author hooriza, modified by senxation
	@version 1.1.0
**/
/**
	jindo.TabControl 컴포넌트는 여러 패널로 나뉘어진 구조를 탭으로 네비게이팅 가능하게 합니다.
	
	@class jindo.TabControl
	@extends jindo.UIComponent
	@keyword tabcontrol, 탭컨트롤
**/
jindo.TabControl = jindo.$Class({
	/** @lends jindo.TabControl.prototype */

	_bIsActivating : false, //컴포넌트의 활성화 여부

	_nCurrentIndex : null, //현재 선택된 탭의 인덱스
	_welSelectedTab : null,
	_welSelectedPanel : null,
	
	/**
		TabControl 컴포넌트를 생성한다.
		
		@constructor
		@param {HTMLElement} el TabControl을 적용한 기준 엘리먼트.
		@param {Object} [htOption] 옵션 객체
			@param {String} [htOption.sClassPrefix="tc-"] 클래스명 접두어
			@param {String} [htOption.sCheckEvent="click"] 탭에 적용될 이벤트
			<ul>
			<li>"mouseover"</li>
			<li>"mousedown"</li>
			<li>"click"</li>
			</ul>
			@param {Boolean} [htOption.bActivateOnload=true] 로드시 activate() 수행여부
		@example
			<!--
				기준 엘리먼트는 반드시 같은 수의 classPrefix+"tab", classPrefix+"panel" 쌍을 가져야하고 각 쌍은 특정 엘리먼트로 감싸져있어야한다.
				아래 예 참고.
			-->
			<div id="tab">
				<ul>
					<li class="tc-tab">첫번째</li> <!-- tab의 클래스명은 옵션의 classPrefix+"tab"으로 정해야한다. -->
					<li class="tc-tab tc-selected">두번째</li> <!-- default로 선택될 탭을 지정할 경우 tab의 클래스명은 옵션의 classPrefix+"selected"으로 정한다. (탭이 선택되었을 때 해당 탭과 매칭되는 패널은 classPrefix+"selected"의 클래스명을 갖게 된다.) -->
					<li class="tc-tab">세번째</li>
				</ul>
				<div>
					<div class="tc-panel">SUB SUB #1</li> <!-- tab이 선택되었을때 보여지는 panel의 클래스명은 옵션의 classPrefix+"panel"으로 정해야한다. -->
					<div class="tc-panel tc-selected">SUB SUB #2</li> <!-- default로 선택될 탭을 지정할 경우 panel의 클래스명은 옵션의 classPrefix+"selected"으로 정한다. -->
					<div class="tc-panel">SUB SUB #3</li>
				</div>
			</div>
		@example
			var oTab = new jindo.TabControl(jindo.$('tab'), { 
				sClassPrefix : "tc-" // (String) 클래스명 앞에 붙게되는 prefix 선언
				sCheckEvent : "click", //탭에 적용될 이벤트 ("mouseover", "mousedown", "click")
				bActivateOnload : true //로드시 컴포넌트 활성화여부
			}).attach({
				beforeSelect : function(oCustomEvent) {
					//탭이 선택되기 전에 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					// 	nIndex : (Number) 선택된 탭의 인덱스
					// 	elTab : (HTMLElement) 선택된 탭
					// 	elPanel : (HTMLElement) 선택된 패널
					//}
					//oCustomEvent.stop()시 해당 탭이 선택되지 않음.
				}
				select : function(oCustomEvent) {
					//탭이 선택되었을 때 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					// 	nIndex : (Number) 선택된 탭의 인덱스
					// 	elTab : (HTMLElement) 선택된 탭
					// 	elPanel : (HTMLElement) 선택된 패널
					//}
				}
			});
	**/
	$init : function(el, htOption) {
		
		//옵션 초기화
		var htDefaultOption = {
			sClassPrefix : 'tc-', //Default Class Prefix
			sCheckEvent : "click", //탭에 적용될 이벤트 ("mouseover", "mousedown", "click")
			bActivateOnload : true //로드시 컴포넌트 활성화여부
		};
		this.option(htDefaultOption);
		this.option(htOption || {});
		
		//Base 엘리먼트 설정
		this._el = jindo.$(el);
		
		this._wfEventTab = jindo.$Fn(this._onEventTab, this);

		//컴포넌트에서 사용되는 HTMLElement들을 선언하는 메소드
		this._assignHTMLElements();
		
		//활성화
		if(this.option("bActivateOnload")) {
			this._selectTab(this._elSelectedTab);
			this.activate(); //컴포넌트를 활성화한다.	
		}
	},
	
	/**
		컴포넌트에서 사용되는 HTMLElement들을 선언하는 메소드
	**/
	_assignHTMLElements : function() {
		var sPrefix = this.option('sClassPrefix'),
			el = this._el;
		
		this._aTab = jindo.$$('.' + sPrefix + 'tab', el);
		this._aPanel = jindo.$$('.' + sPrefix + 'panel', el);
		this._elSelectedTab = jindo.$$.getSingle('.' + sPrefix + 'tab.' + sPrefix + 'selected', el) || this.getTab(0);
		this._waTab = jindo.$A(this._aTab);
	},
	
	/**
		n번째 탭 엘리먼트를 구한다.
		
		@method getTab
		@param {Number} n TODO : 파라미터 설명달기
		@return {HTMLElement}
	**/
	getTab : function(n) {
		return this.getTabs()[n];
	},

	/**
		탭 엘리먼트 목록을 구한다.
		
		@method getTabs
		@return {Array}
	**/
	getTabs : function() {
		return this._aTab;
	},

	/**
		n번째 패널 엘리먼트를 구한다.
		
		@method getPanel
		@param {Number} n TODO : 파라미터 설명달기
		@return {HTMLElement}
	**/
	getPanel : function(n) {
		return this.getPanels()[n];
	},

	/**
		패널 엘리먼트 목록을 구한다.
		
		@method getPanels
		@return {Array}
	**/
	getPanels : function() {
		return this._aPanel;
	},

	/**
		n번째 Tab을 선택한다.
		
		@method selectTab
		@param {Number} n TODO : 파라미터 설명달기
		@param {Boolean} bFireEvent 선택시 사용자 이벤트를 발생할 지 여부
	**/
	selectTab : function(n, bFireEvent) {
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		
		this._selectTab(this.getTab(n), bFireEvent);
	},

	/**
		몇 번째 탭인지 구한다.
		
		@method getIndex
		@param {HTMLElement} elTab TODO : 파라미터 설명달기
		@return {Number}
	**/	
	getIndex : function(elTab) {
		return this._waTab.indexOf(elTab);
	},
	
	/**
		현재 몇번째 탭이 보여지고 있는지 구한다.
		
		@method getCurrentIndex
		@return {Number}
	**/
	getCurrentIndex : function() {
		return this._nCurrentIndex;
	},
	
	_selectTab : function(elTab, bFireEvent) {
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;	
		}
		
		var sPrefix = this.option('sClassPrefix'),
			nIndex = this.getIndex(elTab),
			elPanel = this.getPanel(nIndex);
		
		if (bFireEvent) {
			/**
				탭이 선택되기 전
				
				@event beforeSelect
				@param {String} sType 커스텀이벤트명
				@param {Number} nIndex 선택될 탭의 인덱스
				@param {HTMLElement} elTab 선택될 탭
				@param {HTMLElement} elPanel 선택될 패널
				@param {Function} stop 수행시 해당 탭이 선택되지 않음
				@example
					// 커스텀이벤트 핸들링 예제
					oTabControl.attach("beforeSelect", function(oCustomEvent) { ... });
			**/
			if (!this.fireEvent("beforeSelect", {
				nIndex : nIndex,
				elTab : elTab,
				elPanel : elPanel
			})) {
				return;
			}
		}
		
		var welTab = jindo.$Element(elTab);
		if (this._welSelectedTab) {
			this._welSelectedTab.removeClass(sPrefix + 'selected');
		}
		this._welSelectedTab = welTab;
		welTab.addClass(sPrefix + 'selected');
		
		var welPanel = jindo.$Element(elPanel);
		if (this._welSelectedPanel) {
			this._welSelectedPanel.removeClass(sPrefix + 'selected');
		}
		this._welSelectedPanel = welPanel;
		welPanel.addClass(sPrefix + 'selected');
		
		this._nCurrentIndex = nIndex;
		
		if (bFireEvent) {
			/**
				탭이 선택된 후
				
				@event select
				@param {String} sType 커스텀이벤트명
				@param {Number} nIndex 선택된 탭의 인덱스
				@param {HTMLElement} elTab 선택된 탭
				@param {HTMLElement} elPanel 선택된 패널
				@example
					// 커스텀이벤트 핸들링 예제
					oTabControl.attach("select", function(oCustomEvent) { ... });
			**/
			this.fireEvent("select", {
				nIndex : nIndex,
				elTab : elTab,
				elPanel : elPanel
			});
		}
	},
	
	/**
		컴포넌트의 베이스 엘리먼트를 가져온다.
		
		@method getBaseElement
		@return {HTMLElement}
	**/
	getBaseElement : function() {
		return this._el;
	},
	
	/**
		컴포넌트를 활성화한다.
		@return {this}
	**/
	_onActivate : function() {
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._el).preventTapHighlight(true);
		this._wfEventTab.attach(this._el, this.option("sCheckEvent"));
	},
	
	/**
		컴포넌트를 비활성화한다.
		@return {this}
	**/
	_onDeactivate : function() {
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this._el).preventTapHighlight(false);
		this._wfEventTab.detach(this._el, this.option("sCheckEvent"));
	},
	
	_onEventTab : function(we) {
		if (this.fireEvent(we.type, { weEvent : we })) {
			var sPrefix = this.option('sClassPrefix'),
				el = we.element,
				elTab = jindo.$$.test(el, '.' + sPrefix + 'tab') ? el : jindo.$$.getSingle('! .' + sPrefix + 'tab', el);
				
			if (elTab) {
				this._selectTab(elTab);	
			}
		}
	}
}).extend(jindo.UIComponent);
/**
	@fileOverview input[type=text] 또는 textarea와 같은 입력 컨트롤에 입력여부를 감지하는 컴포넌트
	@author senxation
	@version 1.1.0
**/
/**
	input[type=text] 또는 textarea와 같은 입력 컨트롤에 입력여부를 감지하는 컴포넌트
	jindo.WatchInput 컴포넌트는 Input Control의 입력값 변화를 감지합니다.
	IE에서는 "keyup" 이벤트를 감지하고, 그외의 브라우저에서는 focus되었을때 이전값에서의 변화를 비교하는 타이머가 시작되고 blur되었을때 타이머가 종료된다.
	
	@class jindo.WatchInput
	@extends jindo.UIComponent
	@requires jindo.Timer
	@keyword watchinput, watch, input, textarea, 왓치인풋
**/
jindo.WatchInput = jindo.$Class({

	/** @lends jindo.WatchInput.prototype */
	
	_bTimerRunning : false,
	_bFocused : false,
	_sPrevValue : "",
	

	/**
		WatchInput 컴포넌트를 생성한다.
		
		@constructor
		@param {String | HTMLElement} sInputId 적용할 입력 컨트롤의 id혹은 엘리먼트 자체
		@param {Object} [htOption] 옵션 객체
			@param {Number} [htOption.nInterval=100] 변화를 확인할 시간 간격 (IE에서는 타이머로 체크하지 않아 bUseTimerOnIE 옵션을 'true'로 설정하지 않는다면 이 옵션은 적용되지 않는다)
			@param {Boolean} [htOption.bUseTimerOnIE=false] IE에서도 타이머로 변화를 확인할지 여부. IE 에서 타이머로 체크할 경우 true, 그렇지 않다면 false로 설정한다.
			@param {String} [htOption.sKeyEvent="keyup"] IE에서 감지할 키보드이벤트명
			@param {Boolean} [htOption.bPermanent=false] focus와 blur 이벤트의 발생 여부와 상관없이 항상 타이머로 확인할지 여부
			@param {Boolean} [htOption.bActivateOnload=true] 로드시 활성화 여부. 이 옵션을 false로 설정하였을 경우, start 메소드를 이용해 활성화 시킬 수 있다.
		@example
			var oWatchInput = new jindo.WatchInput("input", {
				nInterval : 100, //Check할 간격 (IE제외)
				bUseTimerOnIE : false, //IE에서 키보드 이벤트를 사용해서 감지할 경우 false로 지정. 다른 브라우저처럼 타이머로 체크하고자하는 경우 true로 설정
				sKeyEvent : "keyup", //attach할 키보드 이벤트 (IE만 해당)
				bPermanent : false, //입력창의 focus/blur에 상관없이 항상 타이머가 동작할지 여부. 중단을 위해서 반드시 stop()이나 deactivate()메소드 호출 필요.(IE제외) 
				bActivateOnload : true //로드시 activate() 수행여부
			}).attach({
				start : function(oCustomEvent) {
					//감지를 시작했을 때 발생
				},
				stop : function(oCustomEvent) {
					//감지를 중단했을 때 발생
				},
				focus : function(oCustomEvent) {
					//입력 컨트롤에 focus되었을 때 발생
				},
				blur : function(oCustomEvent) {
					//입력 컨트롤에 blur(포커스 해제)되었을 때 발생
				},
				timerStart : function(oCustomEvent) {
					//IE를 제외한 브라우저에서는 한글입력시 KeyEvent이벤트가 발생하지 않으므로 timer를 이용해 감지한다
					//timer가 시작됬을 때 발생
				},
				change : function(oCustomEvent) {
					//입력 컨트롤 값이 변경 되었을 경우 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	elInput : (HTMLElement) 입력 컨트롤
					//	sText : (String) 변화된 input의 값
					//}
				},
				timerStop : function(oCustomEvent) {
					//IE를 제외한 브라우저에서는 한글입력시 KeyEvent이벤트가 발생하지 않으므로 timer를 이용해 감지한다
					//timer가 중지됬을 때 발생
				}
			});
			
	**/
	$init : function(sInputId, htOption) {
		var htDefaultOption = {
			nInterval : 100, //Check할 간격 (IE제외)
			bUseTimerOnIE : false, //IE에서 키보드 이벤트를 사용해서 감지할 경우 false로 지정. 다른 브라우저처럼 타이머로 체크하고자하는 경우 true로 설정
			sKeyEvent : "keyup", //attach할 키보드 이벤트 (IE만 해당)
			bPermanent : false, //입력창의 focus/blur에 상관없이 항상 타이머가 동작할지 여부. 중단을 위해서 반드시 stop()이나 deactivate()메소드 호출 필요.(IE제외) 
			bActivateOnload : true //로드시 activate() 수행여부
		};
		
		this.option(htDefaultOption);
		this.option(htOption || {});
		
		this._elInput = jindo.$(sInputId);
		this._oTimer = new jindo.Timer();
		
		this._bIE = jindo.$Agent().navigator().ie;
		this._wfFocus = jindo.$Fn(this._onFocus, this);
		this._wfBlur = jindo.$Fn(this._onBlur, this);
		this._wfKeyEvent = jindo.$Fn(this._onKeyEvent, this);
		this._wfStartTimer = jindo.$Fn(this._startTimer, this);
		this._wfStopTimer = jindo.$Fn(this._stopTimer, this);
		
		if (this.option("bActivateOnload")) {
			this.activate(true);
		}
	},
	
	/**
		WatchInput이 적용된 Input 엘리먼트를 가져온다.
		
		@method getInput
		@return {HTMLElement}
	**/
	getInput : function() {
		return this._elInput;
	},
	
	/**
		WatchInput이 적용된 Input 엘리먼트의 value를 설정한다.
		
		@method setInputValue
		@remark WatchInput이 적용된 Input 엘리먼트의 값을 키입력 외에 임의로 변경할 때에는 이 메소드를 사용하는 것을 권장한다.
		@return {this}
		@see setCompareValue
		@example
			//input값을 변경할 경우
			oWatchInput.setInputValue("테스트");
			
			//또는 아래와 같이 사용한다.
			oWatchInput.getInput().value = "테스트";
			oWatchInput.setCompareValue("테스트"); //input의 value와 같은 값으로 설정한다.
	**/
	setInputValue : function(s) {
		this.getInput().value = s;
		this.setCompareValue(s);
		return this;
	},	
	
	/**
		현재의 input value와 비교될 이전 Input의 value를 구한다.
		
		@method getCompareValue
		@return {String} 
	**/
	getCompareValue : function() {
		return this._sPrevValue;
	},
	
	/**
		현재의 input value와 비교할 값을 설정한다.
		
		@method setCompareValue
		@remark IE의 keydown이 발생하지 않거나 FF의 timer가 동작하지 않는 상황에서 input의 value를 변경하면 예기치 않은 change이벤트가 발생하기 때문에 변경된 값과 동일하게 비교할 값을 설정하여 예외처리한다.
		@param {String} s TODO : 파라미터 설명달기
		@return {this}
		@example
			oWatchInput.getInput().value = "테스트";
			oWatchInput.setCompareValue("테스트"); //input의 value와 같은 값으로 설정한다.
	**/
	setCompareValue : function(s) {
		this._sPrevValue = s;
		return this;
	},
	
	/**
		이전 값과의 비교없이 강제로 change 이벤트를 발생시킨다.
		
		@method fireChangeEvent
		@return {this}
	**/
	fireChangeEvent : function() {
		var elInput = this.getInput(),
			sValue = elInput.value;
		this.setCompareValue(sValue);
		/**
			입력 컨트롤의 값이 변경되었을 때 발생
			
			@event change
			@param {String} sType 커스텀이벤트명
			@param {HTMLElement} elInput Input Control
			@param {String} sText Input Control의 변경된 값
			@example
				// 커스텀이벤트 핸들링 예제
				oWatchInput.attach("change", function(oCustomEvent){
					alert('변경된 값은 : ' + oCustomEvent.sText + ' 입니다');
				});
		**/
		this.fireEvent("change", {
			elInput : elInput, 
			sText : sValue
		});
		return this;
	},
	
	/**
		감지를 시작한다.
		감지의 중단은 인터벌 시간 이후에 일어난다.
		IE에서는 KeyEvent 이벤트를 감지한다.
		그외의 브라우저에서는 input에 focus되면 Timer를 사용해 주기적인 비교가 시작되고 blur시 중단된다.
		
		@method start
		@param {Boolean} bCompareOnce TODO : 파라미터 설명달기
		@deprecated activate() 사용권장
	**/
	start : function(bCompareOnce) {
		return this.activate(bCompareOnce || false);
	},
	
	/**
		감지를 중단한다.
		
		@method stop
		@deprecated deactivate() 사용권장
	**/
	stop : function() {
		return this.deactivate();
	},
	
	/**
		컴포넌트를 활성화한다.
		@param {Boolean} bCompareOnce 초기화이후 IE의 키보드 이벤트와 그외 브라우저의 Focus이후 Timer동작과 상관없이 최초 1회 비교할지 여부
		@return {this}
	**/
	_onActivate : function(bCompareOnce) {
		this.setCompareValue("");
		var elInput = this.getInput();
		
		this._wfFocus.attach(elInput, "focus");
		if(this._bIE && !this.option("bUseTimerOnIE")) {
			/**
				컴포넌트가 활성화 되었을 때 (start 메서드를 실행하면 컴포넌트가 활성화된다)
				
				@event start
				@param {String} sType 커스텀이벤트명
				@example
					// 커스텀이벤트 핸들링 예제
					oWatchInput.attach("start", function(oCustomEvent){
						alert('컴포넌트 감지 시작');
					});
			**/
			this.fireEvent("start");
			this._wfKeyEvent.attach(elInput, this.option("sKeyEvent"));	
		} else {
			if (this._isTimerRunning()) {
				return;
			}
			
			this.fireEvent("start");
			if (this.option("bPermanent")) {
				this._startTimer();
			} else {
				this._wfStartTimer.attach(elInput, "focus");
				this._wfStopTimer.attach(elInput, "blur");
			}
		}
		
		this._wfBlur.attach(elInput, "blur");
		
		if (bCompareOnce || false) {
			this.compare();
		}
	},

	_onDeactivate : function() {
		var elInput = this.getInput();
		this._wfFocus.detach(elInput, "focus");
		this._wfKeyEvent.detach(elInput, this.option("sKeyEvent"));
		this._stopTimer();
		this._wfStartTimer.detach(elInput, "focus");
		this._wfStopTimer.detach(elInput, "blur");
		this._wfBlur.detach(elInput, "blur");
		/**
			컴포넌트가 비활성화 되었을 때 (stop 메서드를 실행하면 컴포넌트가 비활성화된다)
			
			@event stop
			@param {String} sType 커스텀이벤트명
			@example
				// 커스텀이벤트 핸들링 예제
				oWatchInput.attach("stop", function(oCustomEvent){
					alert('컴포넌트 감지 정지');
				});
		**/
		this.fireEvent("stop");
	},
	
	/**
		값을 비교할 시간 간격을 가져온다.
		
		@method getInterval
		@return {Number} ms 단위의 시간 
	**/
	getInterval : function() {
		return this.option("nInterval");
	},
	
	/**
		값을 비교할 시간 간격을 설정한다.
		
		@method setInterval
		@remark IE제외
		@param {Number} n TODO : 파라미터 설명달기
		@return {this}
	**/
	setInterval : function(n) {
		this.option("nInterval", n);
		return this;
	},
	
	_isTimerRunning : function() {
		return this._bTimerRunning;
	},
	
	_startTimer : function() {
		if(this._isTimerRunning()) {
			return;
		}
		
		this._bTimerRunning = true;
		/**
			타이머가 시작되었을 때 발생
			
			@event timerStart
			@param {String} sType 커스텀이벤트명
			@example
				// 커스텀이벤트 핸들링 예제
				oWatchInput.attach("timerStart", function(oCustomEvent) { ... });
		**/
		this.fireEvent("timerStart");
		this.compare();
		
		var self = this;
		this._oTimer.start(function(){
			self.compare();
			return true;
		}, this.getInterval());
	},
	
	_stopTimer : function() {
		if (this._isTimerRunning()) {
			this._oTimer.abort();
			this._bTimerRunning = false;
			this.compare(); //타이머를 중지하고 비교 1회수행
			/**
				타이머가 정지되었을 때 발생
				
				@event timerStop
				@param {String} sType 커스텀이벤트명
				@example
					// 커스텀이벤트 핸들링 예제
					oWatchInput.attach("timerStop", function(oCustomEvent) { ... });
			**/
			this.fireEvent("timerStop");
		}
	},
	
	_onKeyEvent : function() {
		this.compare();
	},	
	
	_onFocus : function() {
		this._bFocused = true;
		/**
			입력 컨트롤이 포커스 되었을 때 발생
			
			@event focus
			@param {String} sType 커스텀이벤트명
			@example
				// 커스텀이벤트 핸들링 예제
				oWatchInput.attach("focus", function(oCustomEvent) { ... });
		**/
		this.fireEvent("focus");
	},
	
	_onBlur : function() {
		this._bFocused = false;
		/**
			입력 컨트롤의 포커스가 해제되었을 때 발생
			
			@event blur
			@param {String} sType 커스텀이벤트명
			@example
				// 커스텀이벤트 핸들링 예제
				oWatchInput.attach("blur", function(oCustomEvent) { ... });
		**/
		this.fireEvent("blur");
	},
	
	/**
		이전의 비교값과 현재 설정된 값을 강제 비교한다.
		
		@method compare
		@remark IE에서의 key이벤트나, 기타 브라우저의 timer 동작과 관계없이 즉시 비교를 수행한다. (즉, Text Input에 focus될 필요가 없다.) 수행후 값이 바뀐경우 change 커스텀이벤트를 발생한다.
		@return {this}
	**/
	compare : function(){
		if (this.getInput().value != this.getCompareValue()) {
			this.fireChangeEvent();						
		}
		return this;
	}
}).extend(jindo.UIComponent);
/**
	@fileOverview 정해진 크기의 박스내의 내용에 따라 자동으로 스크롤바를 생성하는 스크롤박스 컴포넌트
	@author senxation
	@version 1.1.0
**/
/**
	정해진 크기의 박스내의 내용에 따라 자동으로 스크롤바를 생성하는 스크롤박스 컴포넌트
	ScrollBox 컴포넌트는 정해진 크기의 박스내의 내용을 스크롤바를 이용해 이동하여 볼 수 있게 한다.
	ScrollBar 컴포넌트와 다르게 박스내의 내용이 유동적으로 변할 때 스크롤이 나타나거나 사라지고 막대의 길이도 자동으로 구해진다.
	
	@class jindo.ScrollBox
	@extends jindo.ScrollBar
	@keyword scrollbox, 스크롤박스
**/
jindo.ScrollBox = new jindo.$Class({
	/** @lends jindo.ScrollBox.prototype */

	/**
		@constructor
		@param {HTMLElement} el
		@param {Object} [htOption] TODO : 파라미터 설명달기
			@param {String} [htOption.sClassPrefix="scrollbar-"] 클래스명 접두어
			@param {String} [htOption.sOverflowX="auto"] 가로스크롤을 보여주는 방법
			<ul>
			<li>"auto" : 자동</li>
			<li>"scroll" : 항상</li>
			<li>"hidden" : 보이지않음</li>
			</ul>
			@param {String} [htOption.sOverflowY="auto"] 세로스크롤을 보여주는 방법
			<ul>
			<li>"auto" : 자동</li>
			<li>"scroll" : 항상</li>
			<li>"hidden" : 보이지않음</li>
			</ul>
			@param {String} [htOption.sClassNameForRollover="rollover"] Rollover에 반응할 클래스명
			@param {Number} [htOption.nDelta=16] 스크롤 속도
			@param {Boolean} [htOption.bAdjustThumbSize=true] Thumb의 크기가 Content의 크기에따라 자동으로 변할지 여부
			@param {Number} [htOption.nMinThumbSize=50] bAdjustThumbSize가 true일경우 크기가 변해도 최소로 유지될 크기
			@param {Boolean} [htOption.bActivateOnload=true] 컴포넌트 로드시 activate() 수행여부
		@example
			var oScrollBox = new jindo.ScrollBox("scroll", {
				sClassPrefix : "scrollbar-", // (String) Class Prefix
				sOverflowX : "auto", // (String) 가로스크롤을 보여주는 방법 "auto"(자동) || "scroll" (항상)|| "hidden" (보이지않음) 
				sOverflowY : "auto", // (String) 세로스크롤을 보여주는 방법 "auto"(자동) || "scroll" (항상)|| "hidden" (보이지않음)
				bAdjustThumbSize : true, // (Boolean) Thumb의 크기가 Content의 크기에따라 자동으로 변할지 여부
				nMinThumbSize : 50, // (Number) bAdjustThumbSize가 true일경우 크기가 변해도 최소로 유지될 크기
				nDelta : 16 // (Number) 스크롤 속도
			});
	**/
	$init : function(el, htOption) {
		
		this.option({
			sClassPrefix : "scrollbar-",
			bActivateOnload : true,
			sOverflowX : "auto",
			sOverflowY : "auto",
				bAdjustThumbSize : true,
			nMinThumbSize : 50,
			nDelta : 16 //스크롤 속도
		});
		
		this.option(htOption || {});
		
		this._el = jindo.$(el);
		
		if (this.option("bActivateOnload")) {
			this.activate();
			this.reset();
		}
	},
	
	/**
		스크롤바의 보임/숨김 여부를 자동으로 설정한다.
		
		@method reset
	**/
	reset : function() {
		this._autoToggleScrollBar();
		
		//보정을 위한 상태설정		
		var oStatusH = this.hasScrollBarHorizontal();
		var oStatusV = this.hasScrollBarVertical();
		
		this._adjustBoxSize();
		this._adjustContentSize();
		
		//보정
		this._autoToggleScrollBar();
		if (oStatusH != this.hasScrollBarHorizontal() || oStatusV != this.hasScrollBarVertical()) {
			this._adjustBoxSize();
			this._adjustContentSize();
		}
		
		this._autoToggleAvailability();
		this._adjustTrackSize();
		this._adjustThumbSize();
		this.$super.reset();
	},

	/**
		컴포넌트를 활성화한다.
	**/
	_onActivate : function() {
		//활성화 로직 ex)event binding
		this.$super._onActivate();
		this.reset();
	},
	
	/**
		컴포넌트를 비활성화한다.
	**/
	_onDeactivate : function() {
		this.$super._onDeactivate();
		this._adjustBoxSize();
	},

	/**
		스크롤 박스의 크기를 설정한다.
		
		@method setSize
		@param {Number} [nWidth] TODO : 파라미터 설명달기
		@param {Number} [nHeight] TODO : 파라미터 설명달기
	**/
	setSize : function(nWidth, nHeight) {
		if (nWidth) {
			//jindo.$Element(this._el).width(nWidth);
			jindo.$Element(this._el).css("width", nWidth + "px");
		}
		if (nHeight) {
			//jindo.$Element(this._el).height(nHeight);
			jindo.$Element(this._el).css("height", nHeight + "px");
		}

		this.setBoxSize(nWidth, nHeight);

		this._oBoxSize = {
			nWidth : jindo.$Element(this._elBox).width(),
			nHeight : jindo.$Element(this._elBox).height()
		};
		this.reset(); 
	},

	/**
		컨텐트 엘리먼트의 크기를 구한다.
		
		@method getContentSize
		@return {Object}
		@example
			var oSize = {
				nWidth : (Number),
				nHeight : (Number)
			}
	**/
	getContentSize : function() {
		var welContent = jindo.$Element(this._elContent);
		
		return {
			nWidth : parseInt(welContent.width(), 10),
			nHeight : parseInt(welContent.height(), 10)
		};
	},

	/**
		컨텐트 엘리먼트의 크기를 설정한다.
		
		@method setContentSize
		@param {Number} nWidth TODO : 파라미터 설명달기
		@param {Number} nHeight TODO : 파라미터 설명달기
	**/	
	setContentSize : function(nWidth, nHeight) {
		var welContent = jindo.$Element(this._elContent);
		
		if (nWidth) {
			if (nWidth == Infinity) {
				welContent.css("width", "");
			}
			else {
				welContent.css("width", nWidth + "px");	
			}
			
		}

		if (nHeight) {
			if (nHeight == Infinity) {
				welContent.css("height", "auto");
			}
			else {
				welContent.css("height", nHeight + "px");	
			}
		}
		this.$super.reset();
	},
	
	/**
		박스 엘리먼트의 크기를 구한다.
		
		@method getBoxSize
		@example
			var oSize = {
				nWidth : (Number),
				nHeight : (Number)
			}
	**/
	getBoxSize : function() {
		var welBox = jindo.$Element(this._elBox);
		return {
			nWidth : parseInt(welBox.width(), 10),
			nHeight : parseInt(welBox.height(), 10)
		};
	},
	
	/**
		박스 엘리먼트의 크기를 설정한다.
		
		@method setBoxSize
		@param {Number} nWidth TODO : 파라미터 설명달기
		@param {Number} nHeight TODO : 파라미터 설명달기
	**/
	setBoxSize : function(nWidth, nHeight) {
		var welBox = jindo.$Element(this._elBox);
		if (nWidth) {
			//jindo.$Element(this._elBox).width(nWidth);
			welBox.css("width", nWidth + "px");
		}
		if (nHeight) {
			//jindo.$Element(this._elBox).height(nHeight);
			welBox.css("height", nHeight + "px");
		}
		this.$super.reset();
	},

	/**
		트랙 엘리먼트의 크기를 구한다.
		
		@method getTrackSize
		@param {Object} ht TODO : 파라미터 설명달기
		@return {Object}
		@example
			var oSize = {
				nWidth : (Number),
				nHeight : (Number)
			}
	**/
	getTrackSize : function(ht) {
		if (!ht.elScrollBar) {
			return {
				nWidth : 0,
				nHeight : 0
			};	
		}
		var welTrack = jindo.$Element(ht.elTrack);
		return {
			nWidth : parseInt(welTrack.width(), 10),
			nHeight : parseInt(welTrack.height(), 10)
		};
	},
	
	/**
		트랙 엘리먼트의 크기를 설정한다.
		
		@method setTrackSize
		@param {Number} nWidth TODO : 파라미터 설명달기
		@param {Number} nHeight TODO : 파라미터 설명달기
	**/
	setTrackSize : function(o, nWidth, nHeight) {
		var welTrack = jindo.$Element(o.elTrack);
		if (nWidth) {
			//jindo.$Element(o.elTrack).width(nWidth);
			welTrack.css("width", nWidth + "px");
		}
		if (nHeight) {
			//jindo.$Element(o.elTrack).height(nHeight);
			welTrack.css("height", nHeight + "px");
		}
	},
	
	/**
		가로스크롤이 생겨야하는 상황인지 판단한다.
		
		@method isNeededScrollBarHorizontal
		@return {Boolean}
	**/
	isNeededScrollBarHorizontal : function() {
		
		if(this.option("sOverflowX") == "scroll") {
			return true;
		}
		
		var oContentSize = this.getContentSize();
		var oBoxSize = this.getDefaultBoxSize();
		
		if (this.getScrollBarHorizontal().elScrollBar && this.option("sOverflowX") != "hidden") {
			if(this.hasScrollBarVertical()) {
				if(oContentSize.nWidth > oBoxSize.nWidth - jindo.$Element(this.getScrollBarVertical().elScrollBar).width()) {
					return true;	
				}
			}
			if (oContentSize.nWidth > oBoxSize.nWidth){
				return true;	
			}
		}
		return false;
	},
	
	/**
		세로스크롤이 생겨야하는 상황인지 판단한다.
		
		@method isNeededScrollBarVertical
		@return {Boolean}
	**/
	isNeededScrollBarVertical : function() {
		
		if(this.option("sOverflowY") == "scroll") {
			return true;
		}
		
		var oContentSize = this.getContentSize();
		var oBoxSize = this.getDefaultBoxSize();

		if (this.getScrollBarVertical().elScrollBar && this.option("sOverflowY") != "hidden") {
			if(this.hasScrollBarHorizontal()) {
				if(oContentSize.nHeight > oBoxSize.nHeight - jindo.$Element(this.getScrollBarHorizontal().elScrollBar).height()) {
					return true;	
				}
			}
			if(oContentSize.nHeight > oBoxSize.nHeight) {
				return true;	
			}
		}
		return false;
	},
	
	_autoToggleScrollBar : function() {
		
		if (!this.isActivating()) {
			return;
		}
		
		var sClassPrefix = this.option("sClassPrefix");
		
		var oH = this.getScrollBarHorizontal();
		var oV = this.getScrollBarVertical();
		var welScrollBar; 
		var bAjustThumbSize = this.option("bAdjustThumbSize");
		
		var bV = this.isNeededScrollBarVertical();
		if (oV.elScrollBar) {
			welScrollBar = jindo.$Element(oV.elScrollBar);
			if (bV) {
				welScrollBar.addClass(sClassPrefix + "show");
			} else {
				welScrollBar.removeClass(sClassPrefix + "show");
			}
			if (oV.elThumb && bAjustThumbSize) {
				jindo.$Element(oV.elThumb).css("height", "0px"); //ie6에서 문제때문에 스크롤바를 보여준 직후에 (trackSize를 조절해주기 이전) Thumb사이즈를 0로 만들어준다.
			}
		}
		var bH = this.isNeededScrollBarHorizontal();
		if (oH.elScrollBar) {
			welScrollBar = jindo.$Element(oH.elScrollBar);
			if (bH) {
				welScrollBar.addClass(sClassPrefix + "show");	
			} else {
				welScrollBar.removeClass(sClassPrefix + "show");
			}
			if (oH.elThumb && bAjustThumbSize) {
				jindo.$Element(oH.elThumb).css("width", "0px");
			}
		}

		//세로스크롤 안생기고, 가로스크롤생긴후에 세로스크롤이 필요해지는 경우!		
		if (oV.elScrollBar) {
			welScrollBar = jindo.$Element(oV.elScrollBar);
			if (this.isNeededScrollBarVertical()) {
				welScrollBar.addClass(sClassPrefix + "show"); 
			} else {
				welScrollBar.removeClass(sClassPrefix + "show");
			}
			if (oV.elThumb && bAjustThumbSize) {
				jindo.$Element(oV.elThumb).css("height", "0px");
			}	
		}
	},
	
	/**
		Track의 길이를 자동 조절한다.
	**/
	_adjustTrackSize : function() {
		if (!this.isActivating()) {
			return;
		}
		var oBoxSize = this.getDefaultBoxSize();
		
		var oH = this.getScrollBarHorizontal();
		var oV = this.getScrollBarVertical();
		
		var bH = this.isNeededScrollBarHorizontal();
		//가로 스크롤
		if (bH && oH.elScrollBar) {
			var nTrackWidth = oBoxSize.nWidth;

			var wel = jindo.$Element(oH.elScrollBar);
			wel.css("top", oBoxSize.nHeight - wel.height() + "px");
		
			//세로 스크롤도 있는경우
			var nVerticalWidth = 0;
			if (this.hasScrollBarVertical() && oV.elScrollBar) {
				nVerticalWidth = parseInt(jindo.$Element(oV.elScrollBar).width(), 10);
				nTrackWidth -= nVerticalWidth;
			}	
			wel.width(nTrackWidth); //가로스크롤의 크기 조절
			
			var nButtonLeftWidth = 0;
			if (oH.elButtonLeft) {
				nButtonLeftWidth = parseInt(jindo.$Element(oH.elButtonLeft).width(), 10);
				nTrackWidth -= nButtonLeftWidth;
			}
			if (oH.elButtonRight) {
				nTrackWidth -= parseInt(jindo.$Element(oH.elButtonRight).width(), 10);
			}

			jindo.$Element(oH.elTrack).css("left", nButtonLeftWidth + "px"); //가로스크롤의 위치 조절
			
			this.setTrackSize(oH, nTrackWidth, null);
		}

		var bV = this.isNeededScrollBarVertical();		
		//세로 스크롤
		if (bV && oV.elScrollBar) {
			var nTrackHeight = oBoxSize.nHeight;
			
			//가로 스크롤도 있는경우
			var nHorizontalHeight = 0;
			if (this.hasScrollBarHorizontal() && oH.elScrollBar) {
				nHorizontalHeight = parseInt(jindo.$Element(oH.elScrollBar).height(), 10);
				nTrackHeight -= nHorizontalHeight;
			}
			
			if (oV.elButtonUp) {
				nTrackHeight -= parseInt(jindo.$Element(oV.elButtonUp).height(), 10);
			}
			if (oV.elButtonDown) {
				nTrackHeight -= parseInt(jindo.$Element(oV.elButtonDown).height(), 10);
				//jindo.$Element(oV.elButtonDown).css("bottom", nHorizontalHeight +"px");
			}
			
			this.setTrackSize(oV, null, nTrackHeight);
		}
		
	},
	
	/**
		ScrollBar 가 생성되었을 경우의 Box 사이즈를 설정해준다.
	**/
	_adjustBoxSize : function() {
		var oBoxSize = this.getDefaultBoxSize();
		var oH = this.getScrollBarHorizontal();
		var oV = this.getScrollBarVertical();
		var bV = this.hasScrollBarVertical();
		var bH = this.hasScrollBarHorizontal();
		
		this.setBoxSize(oBoxSize.nWidth, oBoxSize.nHeight);
		
		if (this.isActivating()) {
			//가로 스크롤
			if (bH && oH.elScrollBar) {
				var nHeight = oBoxSize.nHeight;
				nHeight -= parseInt(jindo.$Element(oH.elScrollBar).height(), 10);
				this.setBoxSize(null, nHeight);
			}
			//세로 스크롤
			if (bV && oV.elScrollBar) {
				var nWidth = oBoxSize.nWidth;
				nWidth -= parseInt(jindo.$Element(oV.elScrollBar).width(), 10);
				this.setBoxSize(nWidth, null);
			}
	
			//가로, 세로스크롤 모두 없는 경우에 Box와 Content사이즈가 같게 설정
	//		//if (!bH && !bV) {
	//			//this.setBoxSize(oBoxSize.nWidth, oBoxSize.nHeight);
	//		//}
		}
	},
	
	_adjustContentSize : function() {
		if (!this.isActivating()) {
			return;
		}
		
		var oBoxSize = this.getBoxSize();
		var bV = this.option("sOverflowY") != "hidden";
		var bH = this.option("sOverflowX") != "hidden";	
		var nWidth, nHeight;
		//가로, 세로스크롤 중 하나만 존재하는 경우에는 Content사이즈를 조절해 줌
		//세로 스크롤
		if (bV && !bH) {
			nWidth = oBoxSize.nWidth;
		}
		//가로 스크롤
		if (bH && !bV) {
			nHeight = oBoxSize.nHeight;
		}
		
		this.setContentSize(nWidth || Infinity, nHeight || Infinity);
	},

	_adjustThumbSize : function() {
		if (!this.isActivating()) {
			return;
		}
		
		if (!this.option("bAdjustThumbSize")) {
			return;
		}
		
		var nMinThumbSize = this.option("nMinThumbSize");
		if(typeof nMinThumbSize == "undefined"){
			nMinThumbSize = 50;
		}
		var oContentSize = this.getContentSize();
		var oBoxSize = this.getBoxSize(); //현재 그려진 box 사이즈
		var nGap;

		var oH = this.getScrollBarHorizontal();
		var oV = this.getScrollBarVertical();
		if (oV.elScrollBar) {
					
			var oTrackSizeV = this.getTrackSize(oV);
			var nThumbHeight = Math.floor(parseInt(oTrackSizeV.nHeight * oBoxSize.nHeight / oContentSize.nHeight, 10));
			if(isNaN(nThumbHeight)){
				nThumbHeight = 0;
			}
			if (nThumbHeight < nMinThumbSize) {
				nThumbHeight = nMinThumbSize;
			}
			if (nThumbHeight >= oTrackSizeV.nHeight) {
				nThumbHeight = oTrackSizeV.nHeight;
			}
			jindo.$Element(oV.elThumb).height(nThumbHeight);
			
			///////thumb-body 크기 조절
			nGap = 0;
			if(oV.elThumbHead) {
				nGap += jindo.$Element(oV.elThumbHead).height();
			}
			if(oV.elThumbFoot) {
				nGap += jindo.$Element(oV.elThumbFoot).height();
			}
			if(oV.elThumbBody) {
				jindo.$Element(oV.elThumbBody).height(nThumbHeight - nGap);
			}
		}
		
		if (oH.elScrollBar) {
			var oTrackSizeH = this.getTrackSize(oH);
			var nThumbWidth = Math.floor(parseInt(oTrackSizeH.nWidth * oBoxSize.nWidth / oContentSize.nWidth, 10));
			if(isNaN(nThumbWidth)){
				nThumbWidth = 0;
			}
			if (nThumbWidth < nMinThumbSize) {
				nThumbWidth = nMinThumbSize;
			}
			//max값과 같은 경우
			if (nThumbWidth >= oTrackSizeH.nWidth) {
				nThumbWidth = oTrackSizeH.nWidth;
			}
			jindo.$Element(oH.elThumb).width(nThumbWidth);
			
			///////thumb-body 크기 조절
			nGap = 0;
			if(oH.elThumbHead) {
				nGap += jindo.$Element(oH.elThumbHead).width();
			}
			if(oH.elThumbFoot) {
				nGap += jindo.$Element(oH.elThumbFoot).width();
			}
			if(oH.elThumbBody) {
				jindo.$Element(oH.elThumbBody).width(nThumbWidth - nGap);	
			}
		}
	},
	
	_autoToggleAvailability : function(){
		var sClassPrefix = this.option("sClassPrefix");
		var oContentSize = this.getContentSize();
		var oBoxSize = this.getBoxSize(); //현재 그려진 box 사이즈
		var oH = this.getScrollBarHorizontal();
		var oV = this.getScrollBarVertical();
		
		if (oH.elScrollBar) {
			//deactivate
			if (this.option("sOverflowX") == "scroll" && oBoxSize.nWidth >= oContentSize.nWidth) {
				jindo.$Element(oH.elScrollBar).addClass(sClassPrefix + "disabled");
				this.$super._onDeactivate("horizontal");
				if (this.isActivating()) { //활성화일경우에만 scrollbar에서 삽입된 noscript 클래스명을 다시 제거
					jindo.$Element(this._el).removeClass(sClassPrefix + "noscript");
				}	
			} else {
				jindo.$Element(oH.elScrollBar).removeClass(sClassPrefix + "disabled");
				
				if (this.isActivating()) { //활성화일경우에만 scrollbar도 활성화
					this.$super._onActivate("horizontal");
				}
			}	
		}
		
		if (oV.elScrollBar) {
			if (this.option("sOverflowY") == "scroll" && oBoxSize.nHeight >= oContentSize.nHeight) {
				jindo.$Element(oV.elScrollBar).addClass(sClassPrefix + "disabled");
				this.$super._onDeactivate("vertical");
				if (this.isActivating()) { //활성화일경우에만 scrollbar에서 삽입된 noscript 클래스명을 다시 제거
					jindo.$Element(this._el).removeClass(sClassPrefix + "noscript");
				}
			} else {
				jindo.$Element(oV.elScrollBar).removeClass(sClassPrefix + "disabled");
				if (this.isActivating()) { //활성화일경우에만 scrollbar도 활성화
					this.$super._onActivate("vertical");
				}
			}
		}
	}
}).extend(jindo.ScrollBar);
/**
	@fileOverview 브라우저가 스크롤되어도 항상 레이어가 따라오도록 위치를 고정시키는 컴포넌트 
	@author hooriza, modified by senxation
	@version 1.1.0
**/
 
/**
	브라우저가 스크롤되어도 항상 레이어가 따라오도록 위치를 고정시키는 컴포넌트
	
	@class jindo.FloatingLayer
	@extends jindo.UIComponent
	@requires jindo.Effect
	@requires jindo.Timer
	@requires jindo.Transition
	
	@keyword floating, layer, fixed, 플로팅, 레이어, 고정
**/
jindo.FloatingLayer = jindo.$Class({
	/** @lends jindo.FloatingLayer.prototype */ 

	/**
		FloatingLayer 컴포넌트를 생성한다.
		@constructor
		@param {String | HTMLElement} el 고정시킬 레이어 엘리먼트 (또는 id)
		@param {Object} [htOption] 옵션 객체
			@param {Number} [htOption.nDelay=0] 스크롤시 nDelay(ms) 이후에 이동
			@param {Number} [htOption.nDuration=500] Transition이 수행될 시간(ms)
			@param {Function} [htOption.fEffect=jindo.Effect.easeOut] 레이어 이동에 적용될 jindo.Effect 함수
			@param {Boolean} [htOption.bActivateOnload=true] 로드와 동시에 activate 할지 여부
		@example
			new jindo.FloatingLayer(jindo.$('LU_layer'), {
				nDelay : 0, // (Number) 스크롤시 nDelay(ms) 이후에 이동
				nDuration : 500, // (Number) Transition이 수행될 시간
				sEffect : jindo.Effect.easeOut, // (Function) 레이어 이동에 적용될 jindo.Effect 함수
				bActivateOnload : true //(Boolean) 로드와 동시에 activate 할지 여부
			}).attach({
				beforeMove : function(oCustomEvent) {
					//레이어가 이동하기 전에 발생
					//oCustomEvent.nX : 레이어가 이동될 x좌표 (number)
					//oCustomEvent.nY : 레이어가 이동될 y좌표 (number)
					//oCustomEvent.stop() 수행시 이동하지 않음
				},
				move : function() {
					//레이어 이동후 발생
				}
			});
	**/
	$init : function(el, htOption) {
		this._el = jindo.$(el);
		this._wel = jindo.$Element(el);
		
		this.option({
			nDelay : 0,
			nDuration : 500,
			fEffect : jindo.Effect.easeOut,
			bActivateOnload : true
		});
		
		this.option(htOption || {});
		this._htPos = this._getPosition();
		this._oTransition = new jindo.Transition().fps(60);
		this._oTimer = new jindo.Timer();
		this._wfScroll = jindo.$Fn(this._onScroll, this);
		
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},
	
	/**
		사용된 jindo.Transition 컴포넌트의 인스턴스를 리턴한다.
		
		@method getTransition
		@return {jindo.Transition}
	**/
	getTransition : function() {
		return this._oTransition;
	},
	
	/**
		사용된 jindo.Timer 컴포넌트의 인스턴스를 리턴한다.
		
		@method getTimer
		@return {jindo.Timer}
	**/
	getTimer : function() {
		return this._oTimer;
	},
	
	_onActivate : function() {
		var self = this;
		setTimeout(function() { 
			self._onScroll(); 
		}, 0);
		
		this._wfScroll.attach(window, 'scroll').attach(window, 'resize');
	},
	
	_onDeactivate : function() {
		this._wfScroll.detach(window, 'scroll').detach(window, 'resize');
	},
	
	_getPosition : function() {
		var el = this._el,
			wel = this._wel,
			sLeft = el.style.left,
			sRight = el.style.right,
			sTop = el.style.top,
			sBottom = el.style.bottom,
			htPos = {
				sAlignX : sLeft ? 'left' : (sRight ? 'right' : null),
				sAlignY : sTop ? 'top' : (sBottom ? 'bottom' : null)
			},
			htOffset = wel.offset(),
			htClientSize = jindo.$Document().clientSize();
		
		switch (htPos.sAlignX) {
			case "left" :
				htPos.nX = htOffset.left;
			break;
			case "right" :
				htPos.nX = Math.max(htClientSize.width - htOffset.left - wel.width(), parseFloat(sRight));
			break;
		}

		switch (htPos.sAlignY) {
			case "top" :
				htPos.nY = htOffset.top;
			break;
			case "bottom" :
				htPos.nY = Math.max(htClientSize.height - htOffset.top - wel.height(), parseFloat(sBottom));
			break;
		}
		
		return htPos;
	},
	
	_onScroll : function() {
		var self = this;
		
		this._oTimer.start(function() {
			self._paint();
		}, this.option('nDelay'));
	},
	
	_paint : function() {
		var oDoc = document.documentElement || document,
			elBody = document.body,
			el = this._el,
			wel = this._wel,
			htPos = this._htPos,
			htScrollPos = {},
			htOffset = jindo.$Element(el).offset(), // 플로팅 객체의 위치
			nPosX, nPosY,
			htParam = { nX : null, nY : null };

		if (htPos.sAlignX) {
			switch (htPos.sAlignX) {
			case 'left':
				htScrollPos.x = oDoc.scrollLeft || elBody.scrollLeft;
				nPosX = htOffset.left - htScrollPos.x; // 스크롤 기준 선부터 얼마나 떨어져 있나
				break;
			
			case 'right':
				htScrollPos.x = (oDoc.scrollLeft || elBody.scrollLeft) + jindo.$Document().clientSize().width;
				nPosX = htScrollPos.x - (htOffset.left + wel.width());
				break;
			}
			
			htParam.nX = parseFloat(wel.css(htPos.sAlignX)) + (htPos.nX - nPosX);
		}
		
		if (htPos.sAlignY) {
			switch (htPos.sAlignY) {
			case 'top':
				htScrollPos.y = oDoc.scrollTop || elBody.scrollTop;
				nPosY = htOffset.top - htScrollPos.y; // 스크롤 기준 선부터 얼마나 떨어져 있나
				break;
			
			case 'bottom':
				htScrollPos.y = (oDoc.scrollTop || elBody.scrollTop) + jindo.$Document().clientSize().height;
				nPosY = htScrollPos.y - (htOffset.top + wel.height());
				break;
			}
			
			htParam.nY = parseFloat(wel.css(htPos.sAlignY)) + (htPos.nY - nPosY);
		}
		
		/**
			레이어가 이동하기 전
			
			@event beforeMove
			@param {String} sType 커스텀이벤트명
			@param {Number} nX 레이어가 이동될 x좌표
			@param {Number} nY 레이어가 이동될 y좌표
			@param {Function} stop 수행시 레이어가 이동되지 않음
			@example
				// 커스텀이벤트 핸들링 예제
				oFloatingLayer.attach("stop", function(oCustomEvent) { ... });
		**/
		if (this.fireEvent('beforeMove', htParam)) {
			var htTransition = {},
				fEffect = this.option("fEffect");
			
			if (htParam.nX !== null) {
				htTransition['@' + htPos.sAlignX] = fEffect(htParam.nX + 'px');
			}
			if (htParam.nY !== null) {
				htTransition['@' + htPos.sAlignY] = fEffect(htParam.nY + 'px');
			}
			
			var self = this;
			this._oTransition.abort().start(this.option('nDuration'), el, htTransition).start(function() {
				/**
					레이어 이동 후
					
					@event move
					@param {String} sType 커스텀이벤트명
					@example
						// 커스텀이벤트 핸들링 예제
						oFloatingLayer.attach("move", function(oCustomEvent) { ... });
				**/
				self.fireEvent('move');
			});
		}
	}
}).extend(jindo.UIComponent);

/**
	@fileOverview 리스트에 페이지 목록 매기고 페이지에 따른 네비게이션을 구현한 컴포넌트
	@author senxation
	@version 1.1.0
**/
/**
	리스트에 페이지 목록 매기고 페이지에 따른 네비게이션을 구현한 컴포넌트
	기본 목록은 마크업에 static하게 정의되어있고, 페이지 이동을위해 클릭시마다 보여줄 아이템 목록을 Ajax Call을 통해 받아온다.
	페이지 컴포넌트가 로드되면 .loaded 클래스명이 추가된다.
	
	@class jindo.Pagination
	@extends jindo.UIComponent
	@keyword pagination, page, 페이지, 목록
**/
jindo.Pagination = jindo.$Class({
	/** @lends jindo.Pagination.prototype */
	
	/**
		@constructor
		@param {String | HTMLElement} sId 페이지목록을 생성할 엘리먼트 id 혹은 엘리먼트 자체
		@param {Object} [htOption] 옵션 객체
			@param {Boolean} [htOption.bActivateOnload=true] Pagination 컴포넌트가 로딩될 때 활성화시킬지 여부. false로 설정하는 경우에는 oPagination.activate()를 호출하여 따로 활성화 시켜줘야 한다.
			@param {Number} [htOption.nItem=10] 리스트의 전체 아이템 개수
			@param {Number} [htOption.nItemPerPage=10] 한 페이지에 표시 될 아이템의 개수를 정의한다.
			@param {Number} [htOption.nPagePerPageList=10] 페이지 목록에 표시 될 페이지의 개수를 정의한다.
			@param {Number} [htOption.nPage=1] Pagination 컴포넌트가 로딩되었을 때 보여 주는 페이지이다. 디폴트 값으로는 1이 설정된다. 아래의 이미지에서는 12페이지를 선택한 경우이다.
			@param {String} [htOption.sMoveUnit="pagelist"] 이전/다음 버튼을 누르는 경우 한 페이지씩(page) 또는 페이지 목록(pagelist) 단위로 이동하게 해주는 설정값이다.
			<ul>
			<li>pagelist : nPagePerPageList로 설정한 값 기준으로 이동한다.(디폴트 값 기준으로 10페이지)</li>
			<li>page : 한 페이지 씩 이동한다.</li>
			</ul>
			@param {Boolean} [htOption.bAlignCenter=false] bAlignCenter 옵션 값은 현재 페이지가 항상 가운데에 오도록 정렬해주는 값이다. 이전 또는 다음 버튼을 눌러서 페이지를 이동하는 경우 이동 된 페이지가 중앙에 오게 된다.<br/>※ bAlignCenter를 사용할 때는 sMoveUnit이 항상 "page"로 설정되어야 한다.
			@param {String} [htOption.sInsertTextNode=""] 페이지 목록에서 페이지의 마크업들을 연결해주는 문자열이다. 설정 값에 따라서 각각의 페이지를 보여주는 노드 (예 <a href="#">11</a><a href="#">12</a>에서 a태그)를 " " 또는 " "등으로 설정해서 변경할 수 있다. (위의 예에서는 a태그 사이의 간격이 한 줄 또는 하나의 공백문자로 변경되게 된다.)<br/>※ 주의할 점은 이 옵션에 따라 렌더링이 달라질 수 있다는 점이다.
			@param {String} [htOption.sClassPrefix=""] 클래스명 접두어
			@param {String} [htOption.sClassFirst="first-child"] 페이지 목록에서 첫 번째 페이지 항목에 추가되는 클래스명
			@param {String} [htOption.sClassLast="last-child"] 페이지 목록에서 마지막 페이지 항목에 추가되는 클래스명
			@param {String} [htOption.sPageTemplate] 1, 2, 3, .. 과 같은 페이지를 보여주는 엘리먼트를 어떤 마크업으로 보여줄 지를 설정한다. {=page}가 페이지 번호로 교체된다. (jindo.$Template 참고)<br/>기본값 : `<a href='#'>{=page}</a>`
			@param {String} [htOption.sCurrentPageTemplate] 페이지 목록에서 보여주고 있는 현재 페이지를 어떻게 보여줄 지 설정하는 마크업 템플릿이다. {=page}가 현재 페이지 번호로 교체된다. (jindo.$Template 참고)<br/>기본값 : `<strong>{=page}</strong>`
			@param {HTMLElement} [htOption.elFirstPageLinkOn] 페이지 목록에서 페이지의 맨 처음으로 이동하는 버튼으로 사용되는 엘리먼트이다. 처음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 `pre_end` 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 `pre_end` 클래스 명을 가지고 있는 a 엘리먼트
			@param {HTMLElement} [htOption.elPrevPageLinkOn] 페이지 목록에서 이전 페이지 또는 이전 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 이전으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 a 엘리먼트
			@param {HTMLElement} [htOption.elNextPageLinkOn] 페이지 목록에서 다음 페이지 또는 다음 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 다음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 a 엘리먼트
			@param {HTMLElement} [htOption.elLastPageLinkOn] 페이지 목록에서 페이지의 맨 마지막으로 이동하는 버튼으로 사용되는 엘리먼트이다. 마지막으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 `next_end` 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 `next_end` 클래스 명을 가지고 있는 a 엘리먼트
			@param {HTMLElement} [htOption.elFirstPageLinkOff] elFirstPageLinkOn과는 반대로 처음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 `pre_end` 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 `pre_end` 클래스 명을 가지고 있는 span 엘리먼트
			@param {HTMLElement} [htOption.elPrevPageLinkOff] elPrevPageLinkOn과는 반대로 이전으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 span 엘리먼트
			@param {HTMLElement} [htOption.elNextPageLinkOff] elNextPageLinkOn과는 반대로 다음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 span 엘리먼트
			@param {HTMLElement} [htOption.elLastPageLinkOff] elLastPageLinkOn과는 반대로 마지막으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 `next_end` 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본값 : 페이지 목록 엘리먼트 아래의 `next_end` 클래스 명을 가지고 있는 span 엘리먼트
		@example 
			var oPagination = new jindo.Pagination("paginate", {
				nItem : 1000, //(Number) 전체 아이템 개수
				nItemPerPage : 10, //(Number) 한 페이지에 표시될 아이템 개수
				nPagePerPageList : 10, //(Number) 페이지목록에 표시될 페이지 개수
				nPage : 1, //(Number) 초기 페이지
				sMoveUnit : "pagelist", //(String) 페이지목록 이동시 이동 단위 "page" || "pagelist"
				bAlignCenter : false, //(Boolean) 현재페이지가 항상 가운데 위치하도록 정렬. sMoveUnit이 "page"일 때만 사용
				sInsertTextNode : "", //(String) 페이지리스트 생성시에 각각의 페이지 노드를 한줄로 붙여쓰지 않게 하기 위해서는 "\n" 또는 " "를 설정한다. 이 옵션에 따라 렌더링이 달라질 수 있다.
				sClassPrefix : "pagination-", //(String) 컴퍼넌트에서 사용되는 클래스의 Prefix 
				sClassFirst : "first-child", //(String) 첫번째 페이지리스트에 추가될 클래스명
				sClassLast : "last-child", //(String) 마지막 페이지리스트에 추가될 클래스명
				sPageTemplate : "<a href='#'>{=page}</a>", //(String) 페이지에 대한 템플릿. {=page}부분이 페이지 번호로 대치된다. 
				sCurrentPageTemplate : "<strong>{=page}</strong>", //(String) 현재페이지에 대한 템플릿. {=page}부분이 페이지 번호로 대치된다.
				elFirstPageLinkOn : (HTMLElement) '처음' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 pre_end 클래스명을 가지는 a 엘리먼트이다.
				elPrevPageLinkOn : (HTMLElement) '이전' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 pre 클래스명을 가지는 a 엘리먼트이다.
				elNextPageLinkOn : (HTMLElement) '다음' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 next 클래스명을 가지는 a 엘리먼트이다.
				elLastPageLinkOn : (HTMLElement) '마지막' 링크엘리먼트. 기본 값은 기준 엘리먼트 아래 next_end 클래스명을 가지는 a 엘리먼트이다.
				elFirstPageLinkOff : (HTMLElement) '처음' 엘리먼트. 기본 값은 기준 엘리먼트 아래 pre_end 클래스명을 가지는 span 엘리먼트이다.
				elPrevPageLinkOff : (HTMLElement) '이전' 엘리먼트. 기본 값은 기준 엘리먼트 아래 pre 클래스명을 가지는 span 엘리먼트이다.
				elNextPageLinkOff : (HTMLElement) '다음' 엘리먼트. 기본 값은 기준 엘리먼트 아래 next 클래스명을 가지는 span 엘리먼트이다.
				elLastPageLinkOff : (HTMLElement) '마지막' 엘리먼트. 기본 값은 기준 엘리먼트 아래 next_end 클래스명을 가지는 span 엘리먼트이다.
			}).attach({
				beforeMove : function(oCustomEvent) {
					//페이지 이동이 수행되기 직전에 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	nPage : (Number) 이동하려는 페이지
					//}
					//oCustomEvent.stop()을 수행하면 페이지 이동(move 이벤트)이 일어나지 않는다.
				},
				move : function(oCustomEvent) {
					//페이지 이동이 완료된 이후 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	nPage : (Number) 현재 페이지
					//}
				},
				click : function(oCustomEvent) {
					//페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생
					//전달되는 이벤트 객체 oCustomEvent = {
					//	nPage : (Number) 클릭해서 이동할 페이지
					//	weEvent : (jindo.$Event) click시 발생되는 jindo.$Event 객체
					//}
					//oCustomEvent.stop()을 수행하면 페이지 이동(beforeMove, move 이벤트)이 일어나지 않는다.
				}
			});
	**/
	$init : function(sId, htOption){
		this._elPageList = jindo.$(sId);
		this._welPageList = jindo.$Element(this._elPageList);
		this._waPage = jindo.$A([]);
		
		this._fClickPage = jindo.$Fn(this._onClickPageList, this);
		
		this.option({
			bActivateOnload : true,
			nItem : 10,
			nItemPerPage : 10,
			nPagePerPageList : 10,
			nPage : 1,
			sMoveUnit : "pagelist",
			bAlignCenter : false,
			sInsertTextNode : "",
			sClassPrefix : "",
			sClassFirst : "first-child",
			sClassLast : "last-child",
			sPageTemplate : "<a href='#'>{=page}</a>",
			sCurrentPageTemplate : "<strong>{=page}</strong>",
			elFirstPageLinkOn : jindo.$$.getSingle("a." + this._wrapPrefix("pre_end"), this._elPageList),
			elPrevPageLinkOn : jindo.$$.getSingle("a." + this._wrapPrefix("pre"), this._elPageList),
			elNextPageLinkOn : jindo.$$.getSingle("a." + this._wrapPrefix("next"), this._elPageList),
			elLastPageLinkOn : jindo.$$.getSingle("a." + this._wrapPrefix("next_end"), this._elPageList),
			elFirstPageLinkOff : jindo.$$.getSingle("span." + this._wrapPrefix("pre_end"), this._elPageList),
			elPrevPageLinkOff : jindo.$$.getSingle("span." + this._wrapPrefix("pre"), this._elPageList),
			elNextPageLinkOff : jindo.$$.getSingle("span." + this._wrapPrefix("next"), this._elPageList),
			elLastPageLinkOff : jindo.$$.getSingle("span." + this._wrapPrefix("next_end"), this._elPageList)
		});
		this.option(htOption || {});
		
		if (this.option("bActivateOnload")) {
			this.activate();
		}
	},
	
	option : function(sName, vValue) {
		var oThis = jindo.Component.prototype.option.apply(this, arguments);

		// setter 로써 쓰일때만
		if (typeof sName === 'object' || typeof vValue != 'undefined') {
			var sMoveUnit = this.option('sMoveUnit');
			var bAlignCenter = this.option('bAlignCenter');
			
			// 올바르지 않은 옵션 상태일때
			if (bAlignCenter && sMoveUnit === 'pageunit') {
				throw new Error('Invalid Option : sMoveUnit can\'t be set to "pageunit" when bAlignCenter is true.');
			}
		}
		
		return oThis;
	},
	
	/**
		클래스명에 Prefix 를 붙힘
		@param {String} sClassName
	**/
	_wrapPrefix : function(sClassName) {
		var sClassPrefix = this.option('sClassPrefix');
		return sClassPrefix ? sClassPrefix + sClassName.replace(/_/g, '-') : sClassName;
	},
	
	/**
		기준 엘리먼트를 구한다.
		
		@method getBaseElement
		@return {HTMLElement}
	**/
	getBaseElement : function() {
		return this._elPageList;
	},
	
	/**
		전체 아이템의 개수를 리턴한다.
		
		@method getItemCount
		@return {Number} 아이템 개수
	**/
	getItemCount : function() {
		return this.option("nItem");
	},
	
	/**
		전체 아이템의 개수를 설정한다.
		
		@method setItemCount
		@param {Number} n 아이템 개수
	**/
	setItemCount : function(n) {
		this.option({"nItem" : n});
	},
	
	/**
		한 페이지에 보여줄 아이템의 개수를 구한다.
		
		@method getItemPerPage
		@return {Number} 한 페이지에 보여줄 아이템의 개수
	**/
	getItemPerPage : function() {
		return this.option("nItemPerPage");
	},
	
	/**
		한 페이지에 보여줄 아이템의 개수를 설정한다.
		
		@method setItemPerPage
		@param {Object} n 아이템 개수
	**/
	setItemPerPage : function(n) {
		this.option("nItemPerPage", n);
	},
	
	/**
		현재 페이지를 리턴한다.
		
		@method getCurrentPage
		@return {Number} 현재 페이지
	**/
	getCurrentPage : function() {
		return this._nCurrentPage;
	},
	
	/**
		해당 페이지의 첫번째 아이템이 전체 중 몇 번째 아이템인지 구한다.
		
		@method getFirstItemOfPage
		@param {Number} n 페이지 번호
		@return {Number} 
	**/
	getFirstItemOfPage : function(n) {
		return this.getItemPerPage() * (n - 1) + 1;
	},
	
	/**
		아이템의 인덱스로부터 몇번째 페이지인지를 구한다.
		
		@method getPageOfItem
		@param {Object} n TODO : 파라미터 설명달기
		@return {Number} 
	**/
	getPageOfItem : function(n) {
		return Math.ceil(n / this.getItemPerPage());	
	},
	
	_getLastPage : function() {
		return Math.ceil(this.getItemCount() / this.getItemPerPage());
	},

	_getRelativePage : function(sRelative) {
		var nPage = null;
		var bMovePage = this.option("sMoveUnit") == "page";
		var nThisPageList = this._getPageList(this.getCurrentPage());
		
		switch (sRelative) {
		case "pre_end" :
			nPage = 1;
			break;
			
		case "next_end" :
			nPage = this._getLastPage();
			break;
			
		case "pre":
			nPage = bMovePage ? this.getCurrentPage() - 1 : (nThisPageList - 1) * this.option("nPagePerPageList");
			break;
			
		case "next":
			nPage = bMovePage ? this.getCurrentPage() + 1 : (nThisPageList) * this.option("nPagePerPageList") + 1;
			break;
		}
		
		return nPage;
	},
	
	/**
		몇번째 페이지 리스트인지 구함
		@param {Number} nThisPage
	**/
	_getPageList : function(nThisPage) {
		if (this.option("bAlignCenter")) {
			var nLeft = Math.floor(this.option("nPagePerPageList") / 2);
			var nPageList = nThisPage - nLeft;
			nPageList = Math.max(nPageList, 1);
			nPageList = Math.min(nPageList, this._getLastPage()); 
			return nPageList;
		}
		return Math.ceil(nThisPage / this.option("nPagePerPageList"));
	},
	
	_isIn : function(el, elParent) {
		if (!elParent) {
			return false;
		}
		return (el === elParent) ? true : jindo.$Element(el).isChildOf(elParent); 
	},
	
	_getPageElement : function(el) {
		for (var i = 0, nLength = this._waPage.$value().length; i < nLength; i++) {
			var elPage = this._waPage.get(i);
			if (this._isIn(el, elPage)) {
				return elPage;
			}
		}
		return null;
	},
	
	_onClickPageList : function(we) {
		we.stop(jindo.$Event.CANCEL_DEFAULT);
		
		var nPage = null,
			htOption = this.option(),
			el = we.element;
			
		if (this._isIn(el, htOption.elFirstPageLinkOn)) {
			nPage = this._getRelativePage("pre_end");
		} else if (this._isIn(el, htOption.elPrevPageLinkOn)) {
			nPage = this._getRelativePage("pre");
		} else if (this._isIn(el, htOption.elNextPageLinkOn)) {
			nPage = this._getRelativePage("next");
		} else if (this._isIn(el, htOption.elLastPageLinkOn)) {
			nPage = this._getRelativePage("next_end");				
		} else {
			var elPage = this._getPageElement(el);
			if (elPage) {
				nPage = parseInt(jindo.$Element(elPage).text(), 10);
			} else {
				return;
			}
		}	
		
		/**
			페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생
			
			@event click
			@param {String} sType 커스텀이벤트명
			@param {Number} nPage 클릭해서 이동할 페이지
			@param {jindo.$Event} weEvent 클릭 이벤트 객체
			@param {Function} stop 페이지 이동을 정지한다
			@example
				// 커스텀이벤트 핸들링 예제
				oPagination.attach("click", function(oCustomEvent) {
					// 클릭한 페이지 번호
					var nClickedPage = oCustomEvent.nPage;
					
					// 만약, 페이지를 이동하고 싶지 않다면
					// oCustomEvent.stop()을 호출하여 중지할 수 있다.
					if( nClickedPage === 0 ) {
						oCustomEvent.stop();
					}
				});
		**/
		if (!this.fireEvent("click", { nPage: nPage, weEvent : we })) {
			return;
		}
		
		this.movePageTo(nPage);
	},
	
	_convertToAvailPage : function(nPage) {
		var nLastPage = this._getLastPage();
		nPage = Math.max(nPage, 1);
		nPage = Math.min(nPage, nLastPage); 
		return nPage;
	},
	
	/**
		지정한 페이지로 이동하고 페이지 목록을 다시 그린다.
		이동하기전 beforeMove, 이동후에 move 커스텀이벤트를 발생한다.
		
		@method movePageTo
		@param {Number} nPage 이동할 페이지
		@param {Boolean} [bFireEvent] 커스텀이벤트의 발생 여부 (디폴트 true)
	**/
	movePageTo : function(nPage, bFireEvent){
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		
		nPage = this._convertToAvailPage(nPage);
		this._nCurrentPage = nPage;
		
		if (bFireEvent) {
			/**
				페이지 이동이 수행되기 직전에 발생
				
				@event beforeMove
				@param {String} sType 커스텀이벤트명
				@param {Number} nPage 이동하게 될 페이지
				@param {Function} stop 페이지 이동을 정지한다
				@example
					// 커스텀이벤트 핸들링 예제
					oPagination.attach("beforeMove", function(oCustomEvent) {
						// 이동하게 될 페이지
						var nDstPage = oCustomEvent.nPage;
						
						// 만약, 페이지를 이동하고 싶지 않다면
						// oCustomEvent.stop()을 호출하여 중지할 수 있다.
						if( nDstPage === 0 ) {
							oCustomEvent.stop();
						}
					});
			**/
			if (!this.fireEvent("beforeMove", {
				nPage: nPage
			})) {
				return;
			}
		}
		
		this._paginate(nPage);
		
		if (bFireEvent) {
			/**
				페이지 이동이 완료된 시점에서 발생
				
				@event move
				@param {String} sType 커스텀이벤트명
				@param {Number} nPage 사용자 클릭의 결과로 이동한 페이지
				@example
					// 커스텀이벤트 핸들링 예제
					oPagination.attach("move", function(oCustomEvent) {
						// 사용자  클릭의 결과로 이동한 페이지
						var nCurrentPage = oCustomEvent.nPage;
					});
			**/
			this.fireEvent("move", {
				nPage: nPage
			});
		}
	},
	
	/**
		페이징을 다시 그린다.
		
		@method reset
		@param {Number} nItemCount 아이템의 개수가 바뀌었을 경우 설정해준다.
	**/
	reset : function(nItemCount) {
		if (typeof nItemCount == "undefined") {
			nItemCount = this.option("nItem");
		}  
		
		this.setItemCount(nItemCount);
		this.movePageTo(1, false);
	},
	
	_onActivate : function() {
		jindo.$Element.prototype.preventTapHighlight && this._welPageList.preventTapHighlight(true);
		this._fClickPage.attach(this._elPageList, "click");
		this.setItemCount(this.option("nItem"));
		this.movePageTo(this.option("nPage"), false);
		this._welPageList.addClass(this._wrapPrefix("loaded"));	
	},
	
	_onDeactivate : function() {
		jindo.$Element.prototype.preventTapHighlight && this._welPageList.preventTapHighlight(false);
		this._fClickPage.detach(this._elPageList, "click");
		this._welPageList.removeClass(this._wrapPrefix("loaded"));	
	},
	
	_addTextNode : function() {
		var sTextNode = this.option("sInsertTextNode");
		this._elPageList.appendChild(document.createTextNode(sTextNode));		
	},
	
	_paginate : function(nPage){
		this._empty();
		this._addTextNode();
		
		var htOption = this.option(),
			elFirstPageLinkOn = htOption.elFirstPageLinkOn, 
			elPrevPageLinkOn = htOption.elPrevPageLinkOn,
			elNextPageLinkOn = htOption.elNextPageLinkOn,
			elLastPageLinkOn = htOption.elLastPageLinkOn,
			elFirstPageLinkOff = htOption.elFirstPageLinkOff,
			elPrevPageLinkOff = htOption.elPrevPageLinkOff, 
			elNextPageLinkOff = htOption.elNextPageLinkOff, 
			elLastPageLinkOff = htOption.elLastPageLinkOff,
			nLastPage = this._getLastPage(),
			nThisPageList = this._getPageList(nPage),
			nLastPageList = this._getPageList(nLastPage);
		
		if (nLastPage === 0) {
			this._welPageList.addClass(this._wrapPrefix("no-result"));
		} else if (nLastPage == 1) {
			this._welPageList.addClass(this._wrapPrefix("only-one")).removeClass(this._wrapPrefix("no-result"));
		} else {
			this._welPageList.removeClass(this._wrapPrefix("only-one")).removeClass(this._wrapPrefix("no-result"));
		}
		
		var nFirstPageOfThisPageList, nLastPageOfThisPageList;
		if (htOption.bAlignCenter) {
			var nLeft = Math.floor(htOption.nPagePerPageList / 2);
			nFirstPageOfThisPageList = nPage - nLeft;
			nFirstPageOfThisPageList = Math.max(nFirstPageOfThisPageList, 1);
			nLastPageOfThisPageList = nFirstPageOfThisPageList + htOption.nPagePerPageList - 1;
			if (nLastPageOfThisPageList > nLastPage) {
				nFirstPageOfThisPageList = nLastPage - htOption.nPagePerPageList + 1;
				nFirstPageOfThisPageList = Math.max(nFirstPageOfThisPageList, 1);
				nLastPageOfThisPageList = nLastPage;
			}
		} else {
			nFirstPageOfThisPageList = (nThisPageList - 1) * htOption.nPagePerPageList + 1;
			nLastPageOfThisPageList = (nThisPageList) * htOption.nPagePerPageList;
			nLastPageOfThisPageList = Math.min(nLastPageOfThisPageList, nLastPage);
		}
		
		if (htOption.sMoveUnit == "page") {
			nThisPageList = nPage;
			nLastPageList = nLastPage;
		}

		//first
		if (nPage > 1) {
			if (elFirstPageLinkOn) {
				this._welPageList.append(elFirstPageLinkOn);
				this._addTextNode();
			}
		} else {
			if (elFirstPageLinkOff) {
				this._welPageList.append(elFirstPageLinkOff);
				this._addTextNode();
			}
		}

		//prev
		if (nThisPageList > 1) {
			if (elPrevPageLinkOn) {
				this._welPageList.append(elPrevPageLinkOn);
				this._addTextNode();
			}
		} else {
			if (elPrevPageLinkOff) {
				this._welPageList.append(elPrevPageLinkOff);
				this._addTextNode();
			}	
		}		

		var el, wel;
		for (var i = nFirstPageOfThisPageList; i <= nLastPageOfThisPageList ; i++) {
			if (i == nPage) {
				el = jindo.$(jindo.$Template(htOption.sCurrentPageTemplate).process({ page : i.toString() }));
			} else {
				el = jindo.$(jindo.$Template(htOption.sPageTemplate).process({ page : i.toString() }));
				this._waPage.push(el);
			}
				
			wel = jindo.$Element(el);
			if (i == nFirstPageOfThisPageList) {
				wel.addClass(this._wrapPrefix(this.option("sClassFirst")));
			}
			if (i == nLastPageOfThisPageList) {
				wel.addClass(this._wrapPrefix(this.option("sClassLast")));
			}
			this._welPageList.append(el);
			
			this._addTextNode();
		}

		//next
		if (nThisPageList < nLastPageList) {
			if (elNextPageLinkOn) {
				this._welPageList.append(elNextPageLinkOn);
				this._addTextNode();
			}
		} else {
			if (elNextPageLinkOff) {
				this._welPageList.append(elNextPageLinkOff);
				this._addTextNode();
			}
		}
		
		//last
		if (nPage < nLastPage) {
			if (elLastPageLinkOn) {
				this._welPageList.append(elLastPageLinkOn);
				this._addTextNode();
			}
		} else {
			if (elLastPageLinkOff) {
				this._welPageList.append(elLastPageLinkOff);
				this._addTextNode();
			}
		}
	},
	
	_empty : function(){
		var htOption = this.option(),
			elFirstPageLinkOn = htOption.elFirstPageLinkOn, 
			elPrevPageLinkOn = htOption.elPrevPageLinkOn,
			elNextPageLinkOn = htOption.elNextPageLinkOn,
			elLastPageLinkOn = htOption.elLastPageLinkOn,
			elFirstPageLinkOff = htOption.elFirstPageLinkOff,
			elPrevPageLinkOff = htOption.elPrevPageLinkOff, 
			elNextPageLinkOff = htOption.elNextPageLinkOff, 
			elLastPageLinkOff = htOption.elLastPageLinkOff;
			
		htOption.elFirstPageLinkOn = this._clone(elFirstPageLinkOn);
		htOption.elPrevPageLinkOn = this._clone(elPrevPageLinkOn);
		htOption.elLastPageLinkOn = this._clone(elLastPageLinkOn);
		htOption.elNextPageLinkOn = this._clone(elNextPageLinkOn);
		htOption.elFirstPageLinkOff = this._clone(elFirstPageLinkOff);
		htOption.elPrevPageLinkOff = this._clone(elPrevPageLinkOff);
		htOption.elLastPageLinkOff = this._clone(elLastPageLinkOff);
		htOption.elNextPageLinkOff = this._clone(elNextPageLinkOff);
		this._waPage.empty();
		this._welPageList.empty();
	},
	
	_clone : function(el) {
		if (el && el.cloneNode) {
			return el.cloneNode(true);
		}
		return el;
	}
}).extend(jindo.UIComponent);

/**
	@fileOverview 셀렉트박스의 디자인을 대체하기 위한 HTML Component
	@version 1.1.0
**/
/**
	HTML Select 엘리먼트를 대체하여 디자인을 적용하는 컴포넌트
	
	@class jindo.SelectBox
	@extends jindo.HTMLComponent
	@requires jindo.Timer
	@requires jindo.LayerManager
	@requires jindo.LayerPosition
	@requires jindo.RolloverClick
	@keyword selectbox, 셀렉트박스
**/
jindo.SelectBox = jindo.$Class({
	/** @lends jindo.SelectBox.prototype */
	sTagName : 'select',
	
	_bDisabled : false, 
	_sPrevValue : null, //select의 이전 값
	_nSelectedIndex : 0, //선택된 index
	_bRealFocused : false, //탭키 이동으로 실제로 포커스되었는지의 여부
	
	/**
		SelectBox 컴포넌트를 초기화한다.
		
		@constructor
		@param {HTMLElement} el 기준엘리먼트
		@param {Object} [htOption] 옵션 객체
			@param {String} [htOption.sClassPrefix="selectbox-"] Default Class Prefix. 컴포넌트에 의해 처리되는 클래스명의 앞에 붙을 접두어.
			@param {Number} [htOption.nWidth=null] 가로 사이즈, null시 자동
			@param {Number} [htOption.nHeight=null] 목록의 최대 높이. 지정한 값보다 커지면 스크롤 생김, null시 자동
			@param {Boolean} [htOption.bUseLayerPosition=true] LayerPosition 컴포넌트로 위치 설정할지 여부. true지정시 layer엘리먼트가 document.body로 append된다.
			@param {Array} [htOption.aOptionHTML=[]] 목록에서 option 내부에 html을 적용하고 싶을 경우 option 엘리먼트의 개수에 맞게 값을 설정한다. 배열의 각 요소는 html 문자열형태이어야한다. null값 지정시 option 엘리먼트에 지정된 text명과 동일하게 표현된다.
			@param {Array} [htOption.aOptionLabel=[]] aOptionHTML이 설정된 option이 선택된 경우에 레이블영역에 보여질 html내용. 배열의 각 요소는 문자열형태이어야한다. null값 지정시 aOptionHTML과 동일하게 표현된다.
			@param {Object} [htOption.LayerPosition] 목록 레이어의 위치조절을 위한 LayerPosition 컴포넌트에 적용될 옵션
				@param {String} [htOption.LayerPosition.sPosition="outside-bottom"] TODO : 파라미터 설명달기
				@param {String} [htOption.LayerPosition.sAlign="left"] TODO : 파라미터 설명달기
				@param {Number} [htOption.LayerPosition.nTop=0] TODO : 파라미터 설명달기
				@param {Number} [htOption.LayerPosition.nLeft=0] TODO : 파라미터 설명달기
			@param {Object} [htOption.LayerManager] 목록 레이어의 노출조절을 위한 LayerManager 컴포넌트에 적용될 옵션
				@param {String} [htOption.LayerManager.sCheckEvent="mousedown"] TODO : 파라미터 설명달기
				@param {Number} [htOption.LayerManager.nShowDelay=20] TODO : 파라미터 설명달기
				@param {Number} [htOption.LayerManager.nHideDelay=0] TODO : 파라미터 설명달기
				@param {String} [htOption.LayerManager.sMethod="show"] TODO : 파라미터 설명달기
		@example
			var oSelectBox = new jindo.SelectBox(jindo.$("select"), {
			aOptionHTML : [
				null,
				"<div>a</div>",
				"<div><input type='text'></div>"
			]});
		@example
			var oSelectBox = new jindo.SelectBox(jindo.$("select"), {
			aOptionHTML : [
				null,
				"<div>a</div>",
				"<div><input type='text'></div>"
				],
			aOptionLabel : [
				null,
				null,
				"직접입력"
			]});
	**/
	$init : function(el, htOption) {
		this._aItemData = [];
		this._aListItem = [];
		this._aOptions = [];
		
		this.option({
			sClassPrefix : 'selectbox-', //Default Class Prefix
			nWidth : null,
			nHeight : null,
			bUseLayerPosition : true, //LayerPosition 컴포넌트로 위치 설정할지 여부
			aOptionHTML : [],
			aOptionLabel : [],
			LayerPosition : { //LayerPosition 컴포넌트에서 사용할 옵션
				sPosition : "outside-bottom", //목록의 위치. LayerPosition 컴포넌트에서 사용할 옵션
				sAlign : "left", //목록의 정렬. LayerPosition 컴포넌트에서 사용할 옵션
				nTop : 0, //선택박스와 목록의 상하 간격. LayerPosition 컴포넌트에서 사용할 옵션
				nLeft : 0 //선택박스와 목록의 좌우 간격. LayerPosition 컴포넌트에서 사용할 옵션
			},
			LayerManager : {
				sCheckEvent : "mousedown", // {String} 어떤 이벤트가 발생했을 때 레이어를 닫아야 하는지 설정
				nShowDelay : 20, //{Number} 보여주도록 명령을 한 뒤 얼마 이후에 실제로 보여질지 지연시간 지정 (ms)
				nHideDelay : 0 //{Number} 숨기도록 명령을 한 뒤 얼마 이후에 실제로 숨겨지게 할지 지연시간 지정 (ms)
			}
		});
		this.option(htOption || {});

		this._el = jindo.$(el);
		this._assignHTMLElements(); //컴포넌트에서 사용되는 HTMLElement들을 선언하는 메소드
		if(this.option("bUseLayerPosition")) {
			this._initLayerPosition();
		}
		this._initLayerManager();
		this._initRolloverClick();
		this._oTimer = new jindo.Timer();
		this._wfOnFocusSelect = jindo.$Fn(this._onFocusSelect, this);
		this._wfOnBlurSelect = jindo.$Fn(this._onBlurSelect, this);
		this._wfOnMouseDownBox = jindo.$Fn(this._onMouseDownBox, this);
		this._wfOnMouseDownList = jindo.$Fn(this._onMouseDownList, this);
		
		this._wfOnKeyDown = jindo.$Fn(this._onKeyDown, this);
		this._wfOnMouseWheel = jindo.$Fn(function(e){
			e.stop(jindo.$Event.CANCEL_DEFAULT);
			this._elLayer.scrollTop -= e.mouse().delta * 16;
		}, this); //ie6 에서 셀렉트박스에서 스크롤할 경우 선택값이 바뀌는 것을 방지하고 직접스크롤시키도록 수정
		
		this._wfOnMouseWheelOnBody = jindo.$Fn(this.close, this);
		
		this._oAgent = jindo.$Agent(); 
		this.activate(); //컴포넌트를 활성화한다.
	},

	/**
		컴포넌트에서 사용되는 HTMLElement들을 선언하는 메소드
	**/
	_assignHTMLElements : function() {
		var sPrefix = this.option("sClassPrefix"),
			el = this._el;
			
		this._wel = jindo.$Element(el);
		this._elSelect	= jindo.$$.getSingle('select.' + sPrefix + 'source', el);
		this._sSelectInnerHTML = this._elSelect.innerHTML; //초기의 innerHtml을 구함
		this._elOptionDefault = jindo.$$.getSingle('option.' + sPrefix + 'default', el);
		this._elSelectOptionGroup	= jindo.$$.getSingle('select.' + sPrefix + 'source-option-group', el);
		this._elBox		= jindo.$$.getSingle('.' + sPrefix + 'box', el);
		this._elLabel	= jindo.$$.getSingle('.' + sPrefix + 'label', el);
		this._elLayer	= jindo.$$.getSingle('.' + sPrefix + 'layer', el);
		this._elList	= jindo.$$.getSingle('.' + sPrefix + 'list', el);
		this._elList.innerHTML = "";
		this._elSelectList	= jindo.$('<ul>');
		this._elList.insertBefore(this._elSelectList, this._elList.firstChild);
	},
	
	/**
		select 엘리먼트를 가져온다.
		
		@method getSelectElement
		@return {HTMLElement} 
	**/
	getSelectElement : function() {
		return this._elSelect;
	},
	
	/**
		box 엘리먼트(클래스명 "box")를 가져온다.
		
		@method getBoxElement
		@return {HTMLElement} 
	**/
	getBoxElement : function() {
		return this._elBox;
	},
	
	/**
		label 엘리먼트(클래스명 "label")를 가져온다.
		
		@method getLabelElement
		@return {HTMLElement} 
	**/
	getLabelElement : function() {
		return this._elLabel;
	},
	
	/**
		layer 엘리먼트(클래스명 "layer")를 가져온다.
		
		@method getLayerElement
		@return {HTMLElement} 
	**/
	getLayerElement : function() {
		return this._elLayer;
	},
	
	/**
		list 엘리먼트(클래스명 "list")를 가져온다.
		
		@method getListElement
		@return {HTMLElement} 
	**/
	getListElement : function() {
		return this._elList;
	},
	
	/**
		list 엘리먼트 내부의 실제 목록 ul 엘리먼트를 가져온다.
		
		@method getSelectListElement
		@return {HTMLElement} 
	**/
	getSelectListElement : function() {
		return this._elSelectList;
	},
	
	_limitWidth : function() {
		var nWidth = this.option("nWidth");
		if (nWidth) {
			jindo.$Element(this.getBoxElement()).css({
				"width": nWidth + "px",
				"overflowX": "hidden"
			});
			jindo.$Element(this.getLayerElement()).css({
				"width": nWidth + "px",
				"overflowX": "hidden",
				"overflowY": "auto"
			});
		}
	},
	
	_limitHeight : function() {
		var nHeight = this.option("nHeight");
		if (nHeight) {
			var welLayer = jindo.$Element(this.getLayerElement()),
				elToMeasure = welLayer.$value().cloneNode(true),
				welToMeasure = jindo.$Element(elToMeasure),
				nLayerHeight;
				
			welToMeasure.opacity(0);
			welLayer.after(welToMeasure);
			welToMeasure.show();
			
			//layer size
			nLayerHeight = welToMeasure.height();
			welToMeasure.leave();
			
			if (nHeight < nLayerHeight) { //높이값 제한
				welLayer.css({
					"height": nHeight + "px",
					"overflowX": "hidden",
					"overflowY": "auto"
				});
			}
		}
	},
 	
	_initLayerManager : function() {
		var self = this,
			sPrefix = this.option("sClassPrefix"),
			elSelect = this.getSelectElement();
			
		this._oLayerManager = new jindo.LayerManager(this.getLayerElement(), this.option("LayerManager")).attach({
			beforeShow : function(oCustomEvent) {
				/**
					레이어가 열리기 직전 발생
					
					@event open
					@param {String} sType 커스텀이벤트명
					@param {Function} stop 레이어가 열리지 않게 하기위해 호출하는 메소드
					@example
						// open 커스텀이벤트 핸들링
						oSelectBox.attach("open", function(oCustomEvent) { ... });
					@example
						// 레이어가 열리지 않도록 처리
						oSelectBox.attach("open", function(oCustomEvent) {
							oCustomEvent.stop();
						});
				**/
				if(self.fireEvent("open")) {
					self._limitWidth();
					self._limitHeight();
					
					setTimeout(function(){ //focus때문에 delay
						try { elSelect.focus(); } catch(e) {}
					}, 10);
					self._wel.addClass(sPrefix + 'open');
					
					if (self.option("bUseLayerPosition")) {
						self.getLayerPosition().setPosition(); //레이어가 항상보이도록 포지셔닝을 LayerPosition에 위임
					}
				} else {
					oCustomEvent.stop();
				}
			},
			show : function(oCustomEvent) {
				self._paintSelected();
			},
			beforeHide : function(oCustomEvent) {
				/**
					레이어가 닫히기 직전 발생
					
					@event close
					@param {String} sType 커스텀이벤트명
					@param {Function} stop 레이어가 닫히지 않게 하기위해 호출하는 메소드
					@example
						// close 커스텀이벤트 핸들링
						oSelectBox.attach("close", function(oCustomEvent) { ... });
					@example
						// 레이어가 닫히지 않도록 처리
						oSelectBox.attach("open", function(oCustomEvent) {
							oCustomEvent.stop();
						});
				**/
				if(self.fireEvent("close")) {
					self._wel.removeClass(sPrefix + 'open').removeClass(sPrefix + 'focused');
					setTimeout(function(){ //focus때문에 delay
						try { self.getSelectElement().blur(); } catch(e) {}
					}, 10);
				} else {
					oCustomEvent.stop();
					setTimeout(function(){ //focus때문에 delay
						try { elSelect.focus(); } catch(e) {}
					}, 10);
				}
			}
		}).link(this.getBoxElement()).link(this.getLayerElement());
	},
	
	/**
		LayerManager 객체를 가져온다.
		
		@method getLayerManager
		@return {jindo.LayerManager}
	**/
	getLayerManager : function() {
		return this._oLayerManager;
	},
	
	_initRolloverClick : function() {
		var self = this,
			sPrefix = this.option("sClassPrefix");
		
		this._oRolloverClick = new jindo.RolloverClick(this.getSelectListElement(), {
			sCheckEvent : "mouseup",
			RolloverArea : {
				sClassName : sPrefix + "item",
				sClassPrefix : sPrefix + "item-"  
			}
		}).attach({
			over : function(oCustomEvent) {
				if (self._welOvered) {
					self._welOvered.removeClass(sPrefix + "item-over");	
				}
				var wel = jindo.$Element(oCustomEvent.element);
				wel.addClass(sPrefix + "item-over");
				self._welOvered = wel;
			},
			out : function(oCustomEvent) {
				oCustomEvent.stop();
			},
			click : function(oCustomEvent) {
				
				var nLastSelectedIndex = self._nSelectedIndex;
				var nSelectedIndex = -1;
				
				jindo.$A(self._aItemData).forEach(function(htData, nIndex){
					if (htData.elItem === oCustomEvent.element) {
						nSelectedIndex = nIndex;
						jindo.$A.Break();
					}
				});
				
				// click 이벤트 핸들러에서 stop 한경우 선택되지 않도록
				/**
					아이템을 클릭하면 발생
					
					@event click
					@param {String} sType 커스텀이벤트명
					@param {Number} nIndex 클릭한 옵션의 인덱스
					@param {jindo.$Event} weEvent click 이벤트 객체
					@param {Function} stop 아이템이 선택되지 않도록 하기위해 호출하는 메소드
					@example
						// click 커스텀이벤트 핸들링
						oSelectBox.attach("click", function(oCustomEvent) { ... });
					@example
						// 선택이 되지 않도록 처리
						oSelectBox.attach("click", function(oCustomEvent) {
							oCustomEvent.stop();
						});
				**/
				if (!self.fireEvent("click", {
					nIndex : nSelectedIndex,
					weEvent : oCustomEvent.weEvent
				})) {
					return;
				}
				
				if (nSelectedIndex !== -1) {
					self.setValue(self._aItemData[nSelectedIndex].sValue);
				}
				
				nSelectedIndex = self.getSelectedIndex();
				
				if (nSelectedIndex != nLastSelectedIndex) {
					jindo.$Element(self.getSelectElement()).fireEvent("change"); //이미 선언된 select의 onchange핸들러 수행을 위해 이벤트 트리거링
					self.fireEvent("change", { 
						nIndex : nSelectedIndex, 
						nLastIndex : nLastSelectedIndex 
					});	
				}
				
				if (!jindo.$Element(oCustomEvent.element).hasClass(sPrefix + "notclose")) {
					self.getLayerManager().hide(); //선택이 제대로 이뤄졌을 경우에 hide
				} 
			}
		});
	},
	
	/**
		RolloverClick 객체를 가져온다.
		
		@method getRolloverClick
		@return {jindo.RolloverClick}
	**/
	getRolloverClick : function() {
		return this._oRolloverClick;
	},
	
	_initLayerPosition : function() {
		this._oLayerPosition = new jindo.LayerPosition(this.getBoxElement(), this.getLayerElement(), this.option("LayerPosition"));
	},
	
	/**
		LayerPosition 객체를 가져온다.
		
		@method getLayerPosition
		@return {jindo.LayerPosition}
	**/
	getLayerPosition : function() {
		return this._oLayerPosition;
	},

	/**
		컴포넌트를 활성화한다.
	**/
	_onActivate : function() {
		var sPrefix = this.option("sClassPrefix"),
			elSelect = this.getSelectElement();
		
		this._limitWidth();	
		this._wel.removeClass(sPrefix + "noscript");
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this.getListElement()).preventTapHighlight(true);
		this._wfOnFocusSelect.attach(elSelect, "focus");
		this._wfOnBlurSelect.attach(elSelect, "blur");
		this._wfOnMouseDownBox.attach(this.getBoxElement(), "mousedown");
		this._wfOnMouseDownList.attach(this.getListElement(), "mousedown");
		this._wfOnKeyDown.attach(elSelect, "keydown");
		this._wfOnMouseWheel.attach(elSelect, "mousewheel");
		this._wfOnMouseWheelOnBody.attach(document, "mousewheel"); 
		
		this.paint();
		this._sPrevValue = this.getValue();
	},
	
	/**
		컴포넌트를 비활성화한다.
	**/
	_onDeactivate : function() {
		this.getLayerManager().hide();
		var sPrefix = this.option("sClassPrefix"),
			elSelect = this.getSelectElement();
			
		this._wel.addClass(sPrefix + "noscript");
		jindo.$Element.prototype.preventTapHighlight && jindo.$Element(this.getListElement()).preventTapHighlight(false);
		this._wfOnFocusSelect.detach(elSelect, "focus");
		this._wfOnBlurSelect.detach(elSelect, "blur");
		this._wfOnMouseDownBox.detach(this.getBoxElement(), "mousedown");
		this._wfOnMouseDownList.detach(this.getListElement(), "mousedown");
		this._wfOnKeyDown.detach(elSelect, "keydown");
		this._wfOnMouseWheel.detach(elSelect, "mousewheel");
		this._wfOnMouseWheelOnBody.detach(document, "mousewheel"); 
	},
	
	/**
		text값에 대한 option의 value를 가져온다.
		
		@method getValueOf
		@param {String} sText TODO : 파라미터 설명달기
		@return {String}
	**/
	getValueOf : function (sText) {
		for (var i = 0, oItemData; (oItemData = this._aItemData[i]); i++) {
			if (oItemData.sText == sText) {
				return oItemData.sValue;
			}
		}
		return null;
	},
	
	/**
		Select의 value를 가져온다.
		
		@method getValue
		@return {String}
	**/
	getValue : function() {
		return this.getSelectElement().value;
	},
	
	/**
		Select의 text를 가져온다.
		
		@method getText
		@return {String}
	**/
	getText : function() {
		var oData = this._aItemData[this._nSelectedIndex];
		return oData && oData.sText || '';
	},
	
	/**
		Select의 html를 가져온다.
		옵션의 aOptionHTML을 설정한 경우에 리턴값을 가진다.
		
		@method getHTML
		@return {String}
	**/
	getHTML : function() {
		return this.getLabelElement().innerHTML;
	},
	
	/**
		SelectBox의 value를 설정한다.
		
		@method setValue
		@param {String} sValue 
	**/
	setValue : function(sValue) {
		this.getSelectElement().value = sValue;
		this._sPrevValue = this.getValue();
		this._paint();
	},

	/**
		선택된 index를 가져온다.
		
		@method getSelectedIndex
		@return {Number}
	**/
	getSelectedIndex : function() {
		return this.getSelectElement().selectedIndex;
	},

	/**
		nIndex번째 옵션을 선택한다.
		disabled 된것에 대해 처리한다.
		
		@method setSelectedIndex
		@param {Object} nIndex TODO : 파라미터 설명달기
	**/
	setSelectedIndex : function(nIndex, bFireEvent) {
		if (typeof bFireEvent == "undefined") {
			bFireEvent = true;
		}
		
		if (this._isSelectable(nIndex)) {
			var nLastSelectedIndex = this.getSelectedIndex();
			this._setSelectedIndex(nIndex);
			this._paint();
			
			if (bFireEvent && nLastSelectedIndex != nIndex) {
				this.fireEvent("change", { nIndex : nIndex, nLastIndex : nLastSelectedIndex });	
			}
			return true;
		}
		return false;
	},
	
	_setSelectedIndex : function(nIndex) {
		this.getSelectElement().selectedIndex = nIndex; //선택된 index는 이메소드를 그릴때 정의
	},
	
	_isSelectable : function(nIndex) {
		var htItem = this._aItemData[nIndex];
		if (!htItem || htItem.bDisabled || htItem.bDefault) {
			return false;
		} else {
			return true;
		}
	},

	/**
		Select의 option 엘리먼트들을 가져온다.
		
		@method getOptions
		@return {Array}
	**/
	getOptions : function() {
		return this._aOptions;
	},
	
	/**
		List내의 아이템 엘리먼트(li)들을 가져온다.
		
		@method getListItems
		@return {Array}
	**/
	getListItems : function() {
		return this._aListItem;
	},
	
	/**
		셀렉트박스가 disabled 되었는지 여부를 가져온다.
		
		@method getDisabled
	**/
	getDisabled : function() {
		return this._bDisabled;
	},
	
	/**
		보여질 옵션 그룹을 설정한다.
		source 엘리먼트 내에 &lt;option class="selectbox-default"&gt; 엘리먼트가 선언되어있어야한다.
		옵션 그룹을 설정하기 위해 기본으로 설정된 source-option-group 셀렉트 엘리먼트가 선언되어있어야한다. 
		option 중 지정된 옵션 그룹명(option-group-그룹명)을 가진 엘리먼트만 보여진다.
		
		@method setOptionGroup
		@param {String} sName 옵션 그룹 명
		@return {Boolean} 설정 완료 여부
		@example
			<!-- 수행 전 구조 -->
			<div>
				<select class="selectbox-source">
			   		<option value="0" class="selectbox-default">팀을 선택하세요</option>
			   	</select>
				<select class="selectbox-source-option-group"> <!--옵션 그룹을 설정하기 위한 보이지 않는 select-->
			   		<option value="1" class="selectbox-option-group-1">Ajax UI1팀</option>
			   		<option value="2" class="selectbox-option-group-1">Ajax UI2팀</option>
					<option value="3" class="selectbox-option-group-1">Ajax UI3팀</option>
					<option value="4" class="selectbox-option-group-1">Ajax UI4팀</option>
					<option disabled="disabled" class="selectbox-option-group-1">----------------------</option>
					<option value="5" class="selectbox-option-group-1">SPSUI TF</option>
					<option value="6" class="selectbox-option-group-2">플래시UI1팀</option>	
			   		<option value="7" class="selectbox-option-group-2">플래시UI2팀</option>
					<option disabled="disabled" class="selectbox-option-group-2">----------------------</option>
					<option value="8" class="selectbox-option-group-2">RIA기술팀</option>
					<option value="9" class="selectbox-option-group-3">UI기술기획팀</option>
					<option value="10" class="selectbox-option-group-3">웹표준화팀</option>
					<option value="11" class="selectbox-option-group-3">오픈UI기술팀</option>
					<option value="12" class="selectbox-option-group-3">인터널서비스</option>
			   	</select>
				<div class="selectbox-box">
					<div class="selectbox-label">팀을 선택하세요</div>
				</div>
				<div class="selectbox-layer">
					<div class="selectbox-list"><ul style="height: auto;"/></div>
				</div>
			</div>
			
			setOptionGroup("1")
			
			<!-- 수행 후 구조 -->
			<div>
				<select class="selectbox-source">
			   		<option value="0" class="selectbox-default">팀을 선택하세요</option>
			   		<option value="1" class="selectbox-option-group-1">Ajax UI1팀</option>
			   		<option value="2" class="selectbox-option-group-1">Ajax UI2팀</option>
					<option value="3" class="selectbox-option-group-1">Ajax UI3팀</option>
					<option value="4" class="selectbox-option-group-1">Ajax UI4팀</option>
					<option disabled="disabled" class="selectbox-option-group-1">----------------------</option>
					<option value="5" class="selectbox-option-group-1">SPSUI TF</option>
				</select>
				<select class="selectbox-source-option-group"> <!--옵션 그룹을 설정하기 위한 보이지 않는 select-->
			   		<option value="1" class="selectbox-option-group-1">Ajax UI1팀</option>
			   		<option value="2" class="selectbox-option-group-1">Ajax UI2팀</option>
					<option value="3" class="selectbox-option-group-1">Ajax UI3팀</option>
					<option value="4" class="selectbox-option-group-1">Ajax UI4팀</option>
					<option disabled="disabled" class="selectbox-option-group-1">----------------------</option>
					<option value="5" class="selectbox-option-group-1">SPSUI TF</option>
					<option value="6" class="selectbox-option-group-2">플래시UI1팀</option>	
			   		<option value="7" class="selectbox-option-group-2">플래시UI2팀</option>
					<option disabled="disabled" class="selectbox-option-group-2">----------------------</option>
					<option value="8" class="selectbox-option-group-2">RIA기술팀</option>
					<option value="9" class="selectbox-option-group-3">UI기술기획팀</option>
					<option value="10" class="selectbox-option-group-3">웹표준화팀</option>
					<option value="11" class="selectbox-option-group-3">오픈UI기술팀</option>
					<option value="12" class="selectbox-option-group-3">인터널서비스</option>
			   	</select>
				<div class="selectbox-box">
					<div class="selectbox-label">팀을 선택하세요</div>
				</div>
				<div class="selectbox-layer">
					<div class="selectbox-list">
						<ul>
							<li class="selectbox-item">Ajax UI1팀</li>
							<li class="selectbox-item">Ajax UI2팀</li>
							<li class="selectbox-item">Ajax UI3팀</li>
							<li class="selectbox-item">Ajax UI4팀</li>
							<li class="selectbox-item-disabled">----------------------</li>
							<li class="selectbox-item">SPSUI TF</li>
						</ul>
					</div>
				</div>
			</div>
	**/
	setOptionGroup : function(sName) {
		if (!this._elSelectOptionGroup || !this._elOptionDefault) {
			return false;
		}
		
		var elSelect = this.getSelectElement(),
			sPrefix = this.option('sClassPrefix'),
			aGroupOption = jindo.$$("." + sPrefix + "option-group-" + sName, this._elSelectOptionGroup),
			elOptionDefault = this._elOptionDefault = this._elOptionDefault.cloneNode(true);
		
		elSelect.innerHTML = "";
		elSelect.appendChild(elOptionDefault);
		this._nSelectedIndex = 0; 
		for (var i = 0; i < aGroupOption.length; i++) {
			elSelect.appendChild(aGroupOption[i].cloneNode(true));
		}
		this._sPrevValue = this.getValue();
		
		this.paint();
		return true;
	},
	
	/**
		선택된 값이 있는지 여부를 가져온다.
		Default 옵션이 선택된 경우에 false를 리턴한다.
		
		@method isSelected
	**/
	isSelected : function() {
		return !this._aItemData[this.getSelectedIndex()].bDefault;
	},
	
	/**
		선택된 값을 초기화하여 default값으로 되돌린다.
		
		@method setDefault
	**/
	setDefault : function() {
		var nDefaultOption = -1;
			
		jindo.$A(this._aItemData).forEach(function(o, i) {
			if (o.bDefault || o.bSelected) {
				nDefaultOption = i;	
			}
		});
		
		if (nDefaultOption < 0) { //default나 selected="selected" 된거 없으면 첫번째 옵션이 default 
			nDefaultOption = 0;
		} 
		
		this._nSelectedIndex = nDefaultOption;
		this._setSelectedIndex(nDefaultOption);
		this._sPrevValue = this.getValue();
		
		this._paint();
	},
	
	/**
		셀렉트박스를 다시 그린다.
		
		@method paint
	**/
	paint : function() {
		this._paintList();
		this._paintSelected();
		this._paintLabel();
		this.getLayerManager().setLayer(this.getLayerElement());
	},
	
	/**
		타이머로 체크하여 계속 다시 그림
		@ignore
	**/
	_paint : function() {
		this._paintSelected();
		this._paintLabel();
	},
	
	/**
		현재 설정된 값을 box의 label에 그린다.
		@ignore
	**/
	_paintLabel : function() {
		var welLabel = jindo.$Element(this.getLabelElement()),
			sHTML = this.option("aOptionHTML")[this._nSelectedIndex] || "",
			sLabel = this.option("aOptionLabel")[this._nSelectedIndex] || "",
			sText = this.getText();
			
		if (sHTML) {
			if (sLabel) {
				welLabel.html(sLabel);
			} else {
				welLabel.html(sHTML);
			}
		} else {
			welLabel.text(sText);
		}
		welLabel.attr("unselectable", "on");
	},
	
	/**
		현재 설정된 값을 list에 그린다.
		@ignore
	**/
	_paintList : function() {
		var sPrefix = this.option('sClassPrefix');
		this._aOptions = jindo.$$('option', this.getSelectElement());
		var aOptions = this._aOptions;
		this._aItemData = [];
		this._aListItem = [];
		
		this._nSelectedIndex = 0; 
		var elList = this.getSelectListElement();
		elList.innerHTML = "";
		if (this.option("nHeight")) { /* 높이값 되돌리기 */
			jindo.$Element(this.getLayerElement()).css("height", "auto");
		}
		
		for (var i = 0, elOption; (elOption = aOptions[i]); i++) {
			var welOption = jindo.$Element(elOption),
				bDefault = welOption.hasClass(sPrefix + 'default'),
				bSelected = welOption.attr("selected") == "selected",
				bDisabled = bDefault || elOption.disabled,
				sHTML = this.option("aOptionHTML")[i] || "",
				sText = welOption.text() || "",
				sValue = welOption.attr("value");
				
			if (!sValue) {
				welOption.attr("value", sText);
				sValue = sText;
			}
			
			this._aItemData[i] = {
				elOption : elOption,
				elItem : null,
				sHTML : sHTML,
				sText : sText,
				sValue : sValue,
				
				bDisabled : bDisabled,
				bSelected : bSelected,
				bDefault : bDefault
			};
			
			// <li> 태그 만들기
			var elItem = null,
				htItem = this._aItemData[i];
				
			if (!htItem.bDefault) {
				elItem = jindo.$('<li>');
				// <option> 에 적용된 스타일 그대로 적용하기
				elItem.style.cssText = htItem.elOption.style.cssText;
				elItem.className = htItem.elOption.className;
				var welItem = jindo.$Element(elItem);
				if (htItem.sHTML) {
					welItem.html(htItem.sHTML);
				} else {
					welItem.text(htItem.sText);
				}
				welItem.attr("unselectable", "on");
				
				if (htItem.bDisabled) {
					welItem.addClass(sPrefix + 'item-disabled');
				}
				else {
					welItem.addClass(sPrefix + 'item'); //구분선이 아닐경우만
				}
				
				elList.appendChild(elItem);
				this._aListItem.push(elItem);
				this._aItemData[i].elItem = elItem;
			}
			
		}

		if (jindo.$Element(this.getLayerElement()).visible()) {
			this._limitWidth();
			this._limitHeight();
		}

		if (this._elSelect.disabled) {
			this.disable();
			return;
		}
		this.enable();
	},
	
	/**
		레이어가 열리면, 현재 선택된 아이템을 하이라이팅하고 scrollTop을 보정
		@ignore
	**/
	_paintSelected : function() {
		var sPrefix = this.option('sClassPrefix'),
			n = this.getSelectedIndex(),
			htItem,
			nPrevSelectedIndex = this._nSelectedIndex;
			
		if (this._welSelected) {
			this._welSelected.removeClass(sPrefix + "item-selected");
			this._welSelected = null;
		}
		if (this._welOvered) {
			this._welOvered.removeClass(sPrefix + "item-over");
			this._welOvered = null;
		}
		
		n = Math.min(n, this._aItemData.length - 1);
		this._nSelectedIndex = n; //선택된 index는 이메소드를 그릴때 정의
		
		htItem = this._aItemData[n];
		if (htItem && htItem.elItem) {
			var elSelected = htItem.elItem,
				welSelected = jindo.$Element(elSelected);
				
			this._welSelected = this._welOvered = welSelected;
			welSelected.addClass(sPrefix + "item-selected").addClass(sPrefix + "item-over");	
			
			if (this.isLayerOpened()) {
				var elLayerElement = this.getLayerElement();
				var nHeight = parseInt(jindo.$Element(elLayerElement).css("height"), 10),
					nOffsetTop = elSelected.offsetTop,
					nOffsetHeight = elSelected.offsetHeight,
					nScrollTop = elLayerElement.scrollTop,
					bDown;
				
				if (nPrevSelectedIndex < n) {
					bDown = true;
				} else {
					bDown = false;
				}
				if (nOffsetTop < nScrollTop || nOffsetTop > nScrollTop + nHeight) {
					elLayerElement.scrollTop = nOffsetTop;
				}
				if (bDown) {
					if (nOffsetTop + nOffsetHeight > nHeight + nScrollTop) {
						elLayerElement.scrollTop = (nOffsetTop + nOffsetHeight - nHeight);
					}
				} else {
					if (nOffsetTop < nScrollTop) {
						elLayerElement.scrollTop = nOffsetTop;
					}
				}
			}
		}
	},
	
	/**
		Select 레이어가 열려있는지 여부를 가져온다.
		
		@method isLayerOpened
		@return {Boolean}
	**/
	isLayerOpened : function() {
		return this.getLayerManager().getVisible();	
	},
	
	/**
		SelectBox를 disable 시킨다.
		마우스로 클릭하더라도 목록 레이어가 펼쳐지지 않는다.
		
		@method disable
	**/
	disable : function() {
		this.getLayerManager().hide();
		var sPrefix = this.option("sClassPrefix");
		this._wel.addClass(sPrefix + 'disabled');
		this.getSelectElement().disabled = true;
		this._bDisabled = true;
	},
	
	/**
		SelectBox를 enable 시킨다.
		
		@method enable
	**/
	enable : function() {
		var sPrefix = this.option("sClassPrefix");
		this._wel.removeClass(sPrefix + 'disabled');
		this.getSelectElement().disabled = false;
		this._bDisabled = false;
	},
	
	/**
		레이어를 연다.
		
		@method open
		@return {this}
	**/
	open : function() {
		if (!this._bDisabled) {
			this.getLayerManager().show();
		}
		return this;
	},
	
	/**
		레이어를 닫는다.
		
		@method close
		@return {this}
	**/
	close : function() {
		this.getLayerManager().hide();
		return this;
	},
	
	_onMouseDownBox : function(we){
		we.stop(jindo.$Event.CANCEL_DEFAULT);
		if (!this._bDisabled) {
			this.getLayerManager().toggle();
		}
	},
	
	_onMouseDownList : function(we){
		if (!jindo.$$.getSingle("! ." + this.option("sClassPrefix") + "notclose", we.element)) {
			we.stop(jindo.$Event.CANCEL_DEFAULT);
		}
	},
	
	/**
		현재 index로부터 선택가능한 다음 index를 구한다.
		@param {Number} nIndex
		@param {Number} nTarget
		@ignore
	**/
	_getSelectableIndex : function(nIndex, nDirection, nTargetIndex) {
		var nFirst = -1,
			nLast = this._aItemData.length - 1,
			i;
		
		for (i = 0; i < this._aItemData.length; i++) {
			if (this._isSelectable(i)) {
				if (nFirst < 0) {
					nFirst = i;	
				}
				else {
					nLast = i;
				}
			}
		}
		
		switch (nDirection) {
			case -1 :
				if (nIndex == nFirst) {
					return nIndex;
				}
				for (i = nIndex - 1; i > nFirst; i--) {
					if (this._isSelectable(i)) {
						return i;
					}					
				}
				return nFirst;
			
			case 1 :
				if (nIndex == nLast) {
					return nIndex;
				}
				for (i = nIndex + 1; i < nLast; i++) {
					if (this._isSelectable(i)) {
						return i;
					}					
				}
				return nLast;
			
			case Infinity :
				return nLast;
			
			case -Infinity :
				return nFirst;
		}
	},
	
	_onKeyDown : function(we){
		var htKey = we.key();
		
		if ((this._oAgent.os().mac && this._oAgent.navigator().safari) || (this._oAgent.navigator().ie && this._oAgent.navigator().version == 6)) {
			var nKeyCode = htKey.keyCode;
			if (nKeyCode != 9) {
				//mac용 사파리에서는 select에서의 keydown을 중단. tab 제외
				we.stop(jindo.$Event.CANCEL_DEFAULT);
			}
			var nSelectedIndex = this.getSelectedIndex(),
				nTargetIndex = nSelectedIndex;
				
			// 콤보박스에서 발생한 이벤트도 처리하는 경우
			switch (nKeyCode) {
				case 37: // LEFT:
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, -1);
					break;
					
				case 38: // UP:
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, -1);
					break;
				
				case 39: // RIGHT
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, 1);
					break;
					
				case 40: // DOWN
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, 1);
					break;
					
				case 33: // PGUP
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, -Infinity);
					break;
					
				case 34: // PGDN
					nTargetIndex = this._getSelectableIndex(nSelectedIndex, Infinity);
					break;
				case 13: // ENTER
					this.getLayerManager().hide();
					break;
				case 9 : // TAB
					this.getLayerManager().hide();
					break;	
			}
			
			var oParam = {
				nIndex: nTargetIndex,
				nLastIndex: parseInt(this._nSelectedIndex, 10)
			};
			
			this._setSelectedIndex(nTargetIndex);
			this._paint();
			if (oParam.nIndex != oParam.nLastIndex) {
				this.fireEvent("change", oParam);	
			}
		} else {
			if(this.isLayerOpened() && (htKey.enter || htKey.keyCode == 9)) {
				this.getLayerManager().hide();
			}
		}
	},
	
	_onFocusSelect : function(we){
		var sPrefix = this.option('sClassPrefix'),
			wel = this._wel;
			 
		if(!this.isLayerOpened()) {
			/**
				셀렉트박스가 포커스를 얻으면 발생
				
				@event focus
				@param {String} sType 커스텀이벤트명
				@param {Function} stop 포커스 되지않게 하기위해 호출하는 메소드
				@example
					// focus 커스텀이벤트 핸들링
					oSelectBox.attach("focus", function(oCustomEvent) { ... });
				@example
					// 키보드 탭키로 포커스 되지 않도록 처리. select 엘리먼트의 blur()가 실행된다.
					oSelectBox.attach("focus", function(oCustomEvent) {
						oCustomEvent.stop();
					});
			**/
			if (this.fireEvent("focus")) {
				this._bRealFocused = true;	
			} else {
				this.getSelectElement().blur();
				return;
			}
		}
		wel.addClass(sPrefix + 'focused');	
		
		//mac용 사파리에서는 타이머 돌지 않음
		if (!(this._oAgent.os().mac && this._oAgent.navigator().safari)) {
			var self = this;
			this._oTimer.start(function(){
			
				var sValue = self.getValue();
				if (!!self._sPrevValue && self._sPrevValue != sValue) {
					var nSelectedIndex = self.getSelectElement().selectedIndex;
					//Disable default는 다시 선택되지 않도록. ie는 선택이되네..
					if (!self._isSelectable(nSelectedIndex)) {
						var nDiff = -(self._nSelectedIndex - nSelectedIndex);
						nDiff = (nDiff > 0) ? 1 : -1;
						self._setSelectedIndex(self._getSelectableIndex(self._nSelectedIndex, nDiff, nSelectedIndex));
						return true;
					}
					
					var oParam = {
						nIndex: nSelectedIndex,
						nLastIndex: parseInt(self._nSelectedIndex, 10)
					};
					
					self._paint();
					
					/**
						선택한 아이템이 바뀌었을때 발생
						
						@event change
						@param {String} sType 커스텀이벤트명
						@param {Number} nIndex 선택된 옵션의 인덱스
						@param {Number} nLastIndex 선택되기 전의 옵션의 인덱스
						@example
							oSelectBox.attach("change", function(oCustomEvent) { ... });
					**/
					if (oParam.nIndex != oParam.nLastIndex) {
						self.fireEvent("change", oParam);	
					}
					
					self._sPrevValue = sValue;
				}
				
				return true;
			}, 10);
		}
	},
	
	_onBlurSelect : function(we){
		var self = this,
			sPrefix = this.option('sClassPrefix');
			
		if (this._bRealFocused) { //레이어가 오픈되지 않고 focus되었던 경우에만 blur 발생
			/**
				셀렉트박스가 포커스를 잃으면 발생
				
				@event blur
				@param {String} sType 커스텀이벤트명
				@example
					// blur 커스텀이벤트 핸들링
					oSelectBox.attach("blur", function(oCustomEvent) { ... });
			**/
			this.fireEvent("blur");
			this._wel.removeClass(sPrefix + 'focused');
			this._bRealFocused = false;
		}
		setTimeout(function(){
			self._oTimer.abort();	
		}, 10); //마우스로 선택된것도 체크되도록
	}
}).extend(jindo.HTMLComponent);