var sCurrent = 0;
$(document).ready(function(){
	$(".search_auto").click(function(){
		$(".auto_complete_box").toggleClass("on");
		$(".icon_arrow").toggleClass("on");
		return false;
	});

    $('.qual_nation').find('.close').click(function(){
    	$(this).parents('.qual_nation').css({'display' : 'none'});
    });

    $('.qual_list').find('a').click(function(){
    	if ($(this).siblings('.qual_nation').length > 0){
    		$(this).siblings('.qual_nation').css({'display' : 'block'});
    	}

    	return false;
    });
	$('.folder_module__collapse .category_list').find('a').click(function(){
		if ($('.category_list').siblings('.qual_nation').length > 0){
			$('.category_list').siblings('.qual_nation').css({'display' : 'block'});
		}
		return false;
	});

	$(".nav_list li").on('focusin mouseenter', function(){
		$(this).addClass('on');
		var navSubList = $(this).find('.nav_sub_list');
		navSubList.show();
		// 서브리스트가 메뉴텍스트의 가운데 오게 하기 위해 아래와 같이 연산
		var navSubListWidth = navSubList.width();
		navSubList.css("margin-left",(navSubListWidth / 2) * -1);
	});
	$(".nav_list li").on('focusout mouseleave', function(){
		$(this).removeClass('on');
		$(this).find('.nav_sub_list').hide();
	});
	$(".answer_box").on('focusin mouseenter', function(){
		$(this).addClass('on');
	});
	$(".answer_box").on('focusout mouseleave', function(){
		$(this).removeClass('on');
	});
	$('.best').on('focusin mouseenter', function(){
		$(this).addClass('on');
	});
	$(".best").on('focusout mouseleave', function(){
		$(this).removeClass('on');
	});

	/* 전체 카테고리 */
	$('.view_all_category').on('click',function(){
		$(this).toggleClass('on');
		$(this).parent().parent().next().toggleClass('on');
		return false;
	});
	/* 정렬옵션 */
	$('.sort_list li').on('click',function(){
		$('.sort_list li').removeClass('on');
		if ($(this).hasClass("on")){
			$(this).removeClass('on');
		}else{
			$(this).addClass('on');
		}
		return false;
	});
	$('.btn_select').on('click',function(){
		$(this).next().next().toggleClass('on');
	});
	$('.select_list').on('click',function(){
		$(this).toggleClass('on');
	});
	$('.select_list li').on('mouseover',function(){
		$('.select_list li').removeClass('on');
		if ($(this).hasClass("on")){
			$(this).removeClass('on');
		}else{
			$(this).addClass('on');
		}
		return false;
	});

	/* aside 높이 지정*/
	$(window).resize(function(){
		var outerHeight = $('.section_answer').outerHeight();
		var answerHeight= $('.section_answer .answer_wrap').outerHeight();
		var asideHeight = $('.section_answer .aside').outerHeight();
		var articleHeight = $('.section_answer .article_recommand').outerHeight();
		if(outerHeight > asideHeight){
			$('.section_answer .aside').css('height',outerHeight-2);
		}else{
			$('.section_answer .aside').css('height',answerHeight+articleHeight+10);
		}
	}).trigger('resize');

	/* sub aside 높이 지정*/
	// function subAside(){
	// 	var rightHeight = $('.sub_container .rightwidth').outerHeight();
	// 	var asideHeight = $('.sub_container .aside.left').outerHeight();
	// 	if(rightHeight > asideHeight){
	// 		$('.sub_container .aside.left').css('height',rightHeight-2);
	// 	}
	// };
	// subAside();

	$(".talk_write_text").click(function(){
            $(this).parents('.talk_write_wrap').addClass('focus');
    });
    $(".upload_photo").click(function(){
            $(this).parents('.talk_write_wrap').addClass('photo');
            $(this).addClass('upload_photo_on');
    });
    $(".talk_write_file .del_file").click(function(){
            $(this).parents('.talk_write_wrap').removeClass('photo');
            $('.upload_photo').removeClass('disable');
    });
    $(".secret_tag").click(function(){
            $(this).addClass('secret_tag_on');
    });
    // 옵션 버튼 열기
    $(".talk_view_list .info_sub .btn_open").click(function(){
            $(this).parents('.work_sub').toggleClass('work_sub_on');
    });
    // 옵션 버튼 열기(삭제팝업)
    $(".talk_view_list .in_delete").click(function(){
        $(".layer_base").css("display", "block");
    });
    //좋아요 활성화
    $(".btn_recomm").click(function(){
        $(this).toggleClass('btn_recomm_on');
    });
	$(".btn_unrecomm").click(function(){
        $(this).toggleClass('btn_unrecomm_on');
    });

	/* login */
	$(".mykin_tab").on("click", "a", function(e){
		e.preventDefault();

        var $this = $(this),
        	$mykin_wrap = $this.closest(".mykin_wrap"),
        	$tabs = $mykin_wrap.find(".tab"), 
        	$panels = $mykin_wrap.find(".mykin_tab_content"),
        	$currentTab = $(this).parent(),
        	index = $currentTab.index();
		
		$currentTab.addClass("on").siblings().removeClass("on");
        $panels.eq(index).addClass("tc-selected").siblings().removeClass("tc-selected");
	});
	$(".interest_menu").on("click", "a", function(e){
		e.preventDefault();

		$(this).parent().addClass("on").siblings().removeClass("on");
	});

	$(".newkin_slide_wrap .nav_area > a").click(function(){

		if($(this).index() == 0){
			if(sCurrent > 0){
				sCurrent--;
				$(".newkin_slide_wrap .nav_area > a").addClass('on');
			}else{
				sCurrent = 0;
				$('.prev').removeClass('on');
			};

		}else{
			if(sCurrent < 3){
				sCurrent++;
				$(".newkin_slide_wrap .nav_area > a").addClass('on');
			}else{
				sCurrent = 3;
				$('.next').removeClass('on');
			};
		};

		mSet();

		return false;
	});
	$(".newkin_slide_wrap .btn_close").click(function(){
		$('.section_layer').hide();
	});
	$(".newkin_slide_wrap .paging a").click(function(){
		sCurrent = $(this).index();
		mSet();
		return false;
	});

	$('.option_box').click(function(){
		$(this).toggleClass('on');
	});
	$('#family').change(function(e) {
		execSimulation();
	});
	$('.set_box .ico_help').click(function(){
		$(this).next().toggle();
		return false;
	});
	$('.tooltip .btn_close').click(function(){
		$(this).parent().parent().hide();
		return false;
	});
});
function mSet(){
	$(".newkin_slide_wrap .slide_container").animate({left:-($('.slide').outerWidth()) * sCurrent}, 500);
	$(".newkin_slide_wrap .paging a").each(function(i, value){
		if(i == sCurrent){
			$(value).addClass("on");
		}else{
			$(value).removeClass("on");
		};
	});
}
function execSimulation() {
	var fontFamily = $('select[name=family]').val();
	var $result = $('body');
	$result.css('font-family', fontFamily);
}
/* .thumbnail 부분 IE7,8에서는 .thumbnail 안에 아래 background-image와 똑같은 경로의 이미지 삽입 (아래 스크립트는 마크업 테스트용 - 개발 시 삭제바랍니다.) */

$(function(){
	for (var kk = 0; kk < $('.layer_balloon.layer_base').length; kk++){
		$('.layer_p').append('<button>' + kk + '</button>');
	};

	$('.hello').each(function(){
		$('.ttt').append("<span style='margin: 0 0 0 10px;'>" + $(this).outerWidth() + "</span>");
	});

    $('.layer_p button').click(function(){
    	var index = $(this).index();
    	var num = $.trim($(this).text());

    	if ($(this).hasClass('show') || $(this).hasClass('hide')){
	        $('.layer_balloon.layer_base').each(function(){
	        	console.log(index);
	        	if (index == 0 || index == 1){
	        		$(this).css({'display' : 'block'});
	        	}else{
	        		$(this).css({'display' : 'none'});
	        	};
	        });
    	}else{
    		$('.layer_balloon').css({'display' : 'none'});
    		$('.layer_on').removeClass('layer_on');
    		$('.layer_balloon.layer_base').eq(parseInt(num)).parents('.my_main').addClass('layer_on');
    		$('.layer_balloon.layer_base').eq(parseInt(num)).css({'display' : 'block'});
    	};
    });

    if ($('.qual_list').find('.layer_base.layer_balloon').length > 0){
        /*$('.qual_list > ul > li').hover(function(){
        	var index = $(this).index();
        	$(this).addClass('on');

        	$(this).parents('.qual_list').find('.layer_balloon').css({'display' : 'none'});
        	$(this).find('.layer_balloon').css({'display' : 'block'});
        }, function(){
        	$(this).parents('.qual_list').find('.on').removeClass('on');
        	$(this).find('.layer_balloon').css({'display' : 'none'});
        });*/
    };

    var check;
    function get_version_of_IE () { 

     var word; 
     var version = "N/A"; 

     var agent = navigator.userAgent.toLowerCase(); 
     var name = navigator.appName; 

     // IE old version ( IE 10 or Lower ) 
     if ( name == "Microsoft Internet Explorer" ) word = "msie "; 

     else { 
         // IE 11 
         if ( agent.search("trident") > -1 ) word = "trident/.*rv:"; 

         // Microsoft Edge  
         else if ( agent.search("edge/") > -1 ) word = "edge/"; 
     } 

     var reg = new RegExp( word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})" ); 

     if (  reg.exec( agent ) != null  ) version = RegExp.$1 + RegExp.$2; 

     return check = version;
    } 

    get_version_of_IE();


    if (check == '7.0' || check == '8.0'){
    	if ($('.profile_animate').hasClass('.static_image')){
        	$('.profile_animate').find('.thumbnail').attr('style', '').append('<img src="http://view.ui.naver.com/m.kin/KINSUS-24621/images/test/absolute_00big.png" style="height: auto;" alt="hwangsunsoo 님의 프로필" />');
    	}else{
       	 $('.profile_animate').addClass('static_image').find('.thumbnail').attr('style', '').append('<img src="http://view.ui.naver.com/m.kin/KINSUS-24621/images/test/absolute_00big.png" style="height: auto;" alt="hwangsunsoo 님의 프로필" />');
    	};
    }else{
        console.log('최신 브라우저');

        var profile_target = $('.profile_animate');
        var regExp = /[0-9]/g;

        var url = 'https://ssl.pstatic.net/static/kin/09renewal/avatar/seq/';
        // randomRange(6,19);

        var total = {
            big : '170x170',
            mid : '100x100',
            small : '80x80'
        };

        var size;

        if ($('.profile_btn_area').length > 0){
            $('.profile_btn_area').find('button').click(function(){
                var index = $(this).index();
                size = $(this).parents('.profile_btn_area').parent().find('.profile_group .profile_animate').attr('data-size');
                size = size.replace(regExp, '');
                console.log(size);

                $(this).parents('.profile_btn_area').find('button').removeClass('on');
                $(this).parents('.profile_btn_area').find('button:eq(' + index + ')').addClass('on');

                $(this).parents('.profile_btn_area').next('.profile_group').find(profile_target).css({'display' : 'none'});

                console.log(index);

                $(this).parents('.profile_btn_area').next('.profile_group').find(profile_target).eq(index).css({'display' : 'block'});

                if ($.trim($(this).text()) == '닫기'){
                	$(this).parents('.profile_btn_area').fadeOut(300);
                	$(this).parents('.profile_btn_area').next('.profile_group').find(profile_target).eq(2).css({'display' : 'block'});
                }else if ($.trim($(this).text()) == '아바타'){
                	$(this).parents('.profile_btn_area').next('.profile_group').find(profile_target).eq(index).find('.thumbnail').css({'background-image' : 'url(' + url + total.big + '/' + randomRange(6,19) + '.png' + ')'});
                }else{
                };

                /*if ($.trim($(this).text()) == '닫기'){
                    $('.profile_btn_area').fadeOut(300);
                }else if ($.trim($(this).text()) == '일반(모션)'){
                    profile_target.addClass('static_image star_animate').removeClass('animate_active').find('.thumbnail').attr('style', '').html('<img src="https://ssl.pstatic.net/static/kin/09renewal/avatar/200x200_m_gray/7.png" alt="테오비타민 님의 프로필" /><span class="star_blink" style="background-image: url(' + url + (eval("total" + '.' + size) + '/profile_star') + '.png' + ')"></span>');
                }else if ($.trim($(this).text()) == '아바타'){
                    profile_target.removeClass('static_image').addClass('animate_active').find('.thumbnail').css({'background-image' : 'url(' + url + total.big + '/' + randomRange(6,19) + '.png' + ')'}).find('img').remove();
                }else if ($.trim($(this).text()) == '노이미지'){
                	alert('HTML 코드 중 .profile_animate.profile_default 으로 검색하시면 코드 확인 가능합니다.');
                };*/
            });
        };

        if (profile_target.length > 0){
            var num;
            // 지정된 범위의 정수 1개를 랜덤하게 반환하는 함수
            // n1 은 "하한값", n2 는 "상한값"
            function randomRange(num1, num2) {
              return num = Math.floor( (Math.random() * (num2 - num1 + 1)) + num1 );
            };

            // var list = ["profile", "master", "hero", "best", "superman", "plant", "wind", "water", "moon", "star", "solar", "galaxy", "space", "angel", "absolute"];

            // $.trim(profile_target.attr('data-size')).slice(2, profile_target.attr('data-size').length)

            profile_target.each(function(){
            	if (! $(this).attr('data-size')) return;
                if (! $(this).hasClass('static_image')){
                    if ($(this).attr('data-size').indexOf('big') != -1){
                        $(this).find('> .thumbnail').css({'background-image' : 'url(' + url + total.big + '/' + randomRange(6,19) + '.png' + ')'});
                    }else if ($(this).attr('data-size').indexOf('mid') != -1){
                        $(this).find('> .thumbnail').css({'background-image' : 'url(' + url + total.mid + '/' + randomRange(6,19) + '.png' + ')'});
                    }else if ($(this).attr('data-size').indexOf('small') != -1){
                        $(this).find('> .thumbnail').css({'background-image' : 'url(' + url + total.small + '/' + randomRange(6,19) + '.png' + ')'});
                    }else{
                        return false;
                    };
                }else{
                    var pSize = $(this).attr('data-size');
                    console.log(pSize);
                    pSize = pSize.replace(regExp, '');
                    if ($(this).find('.star_blink').length > 0 ){
                        $(this).find('.star_blink').css({'background-image' : 'url(' + url + (eval("total" + '.' + pSize) + '/profile_star') + '.png' + ')'});
                    };
                };
            });

        };
    };
});
$(function(){
	if ($('.Ugc_login').length > 0){
		$('.btn_toggle button').click(function(){
			if ($.trim($(this).text()) == '1배율'){
				$('.Ugc_login').find('.login_common').addClass('login_x1');
			}else{
				$('.Ugc_login').find('.login_common').removeClass('login_x1');
			};
		});
	};
	
	// aside 탭
	$('.tc-tab').click(function(e){
	    var $n = $(this).index();
	    var $tabs = $(this).parent();
	    var $tab = $tabs.find('.tc-tab');
	    var $panels = $tabs.next();
	    var $panel = $panels.find('.tc-panel');

	    $tab.removeClass('tc-selected').eq($n).addClass('tc-selected');
	    $panel.removeClass('tc-selected').eq($n).addClass('tc-selected');

	    e.preventDefault();
	});

	$('.search_doctor > li > strong > a').click(function(e){
	    $(this).parent().next().toggle();
	    e.preventDefault();
	});

	// 레이어 닫기
	$('.layer_base .close, .layer_base .close2').click(function(e){
	    $(this).closest('.layer_base').hide();
	    e.preventDefault();
	});

	$('.aside_tab_module__item').click(function(e){
		e.preventDefault();
		var $this = $(this),
			index = $this.parent().index();
		$this.addClass('is_active').attr('aria-selected', true).parent().siblings().children().removeClass('is_active').attr('aria-selected', false);
		$this.closest('.aside_component1, .aside_type1').find('.tc-panel').eq(index).show().siblings().hide();
	});

	$('.kinpartner_navigation a').click(function(e){
		e.preventDefault();
		$(this).addClass('is_active').attr('aria-selected', true).siblings().removeClass('is_active').attr('aria-selected', false);
	});
});

//SNB 사람들 탭
function snb_innerHTML(category){
	var innerHTML;
	switch(category){
		case 'people' :
			innerHTML = '<div class="snb snb_bordered">'+
						'<h2 class="snb_title">지식iN 사람들</h2>'+
						'<ul class="snb_list">'+
						'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
						'<li class="is_active"><a href="">분야별 지식인 <i class="ing">투표중</i></a></li>'+
						'<li><a href="">전문가 답변</a></li>'+
						'<li><a href="">지식파트너</a></li>'+
						'<li><a href="">취득자격</a></li>'+
						'<li><a href="">지식카페</a></li>'+
						'<li><a href="">지식iN 랭킹</a></li>'+
						'<li><a href="">등급업 가이드</a></li>'+
						'</ul>'+
						'<div class="snb_banner_list">'+
						'<a href="" target="_blank" class="snb_banner_item"><span class="font_point">지식iN</span> 공식 블로그</a>'+
						'</div>'+
						'<div class="snb_old">'+
						'<h3 class="snb_old_title">'+
						'Good bye '+
						'<a href="" class="btn_help"><i class="sp_common ico_help">도움말</i></a>'+
						'<div class="help_wrap">'+
						'<div class="tooltip">'+
						'<span class="sp_common arrow"></span>'+
						'<div class="inner">'+
						'<p>오랜시간동안 여러분과 함께했던 <br>'+
						'명예 &amp; 파워지식iN과 디렉토리에디터 제도가 <br>'+
						'분야별 지식인이라는 제도로 통합되어 운영됩니다.</p>'+
						'<p>이전 제도에 대한 안내페이지는 <br>'+
						'분야별 지식인과 동시 운영되다가 적절한 시점에 <br>'+
						'폐지될 예정입니다.</p>'+
						'<a href="" class="info">분야별 지식인이란?</a>'+
						'<a href="" class="sp_common btn_close">닫기</a>'+
						'</div>'+
						'</div>'+
						'</div>'+
						'</h3>'+
						'<ul class="snb_old_list">'+
						'<li><a href="">명예지식iN</a></li>'+
						'<li><a href="">파워지식iN</a></li>'+
						'<li><a href="">디렉토리에디터</a></li>'+
						'</ul>'+
						'</div>'+
						'</div>';
			break;

		case 'best' :
			innerHTML = '<div class="snb snb_bordered">'+
						'<h2 class="snb_title">지식iN 베스트</h2>'+
						'<ul class="snb_list">'+
						'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
						'<li class="is_active"><a href="">아하! 그렇구나</a></li>'+
						'</ul>'+
						'<div class="snb_banner_list">'+
						'<a href="" target="_blank" class="snb_banner_item"><span class="font_point">지식iN</span> 공식 블로그</a>'+
						'</div>'+
						'</div>';
			break;

		case 'edu' :
			innerHTML = '<div class="snb snb_default">'+
						'<h2 class="snb_title">지식기부</h2>'+
						'<h3 class="snb_subtitle">교육기부</h3>'+
						'<ul class="snb_list">'+
						'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
						'<li><a href="#none">답변</a></li>'+
						'<li><a href="#none">나의활동</a></li>'+
						'<li><a href="#none">인증내역</a></li>'+
						'<li><a href="#none">중단신청</a></li>'+
						'<li><a href="#none">FAQ</a></li>'+
						'<li><a href="#none">기부나무</a></li>'+
						'</ul>'+
						'<h3 class="snb_subtitle">장학기부</h3>'+
						'<ul class="snb_list">'+
						'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
						'<li class="is_active"><a href="scholarship.html">장학금 기부자</a></li>'+
						'<li><a href="scholarship_system.html">장학기부 소개</a></li>'+
						'</ul>'+
						'</div>';
			break;

		case 'partner' :
				innerHTML = '<div class="snb snb_default">'+
							'<h2 class="snb_title">파트너센터</h2>'+
							'<h3 class="snb_subtitle">지식파트너</h3>'+
							'<ul class="snb_list">'+
							'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
							'<li class="is_active"><a href="partner.html">지식파트너 소개</a></li>'+
							'<li><a href="partner_application.html">지식파트너 신청</a></li>'+
							'<li><a href="#none">지식파트너 관리</a></li>'+
							'</ul>'+
							/*'<h3 class="snb_subtitle">FAQ 연동</h3>'+
							'<ul class="snb_list">'+
							'<li><a href="#none">지식파트너 소개</a></li>'+
							'<li><a href="#none">FAQ 연동 소개</a></li>'+
							'<li><a href="#none">FAQ 연동 신청</a></li>'+
							'</ul>'+*/
							'<div class="snb_banner_list snb_banner_list__type2">'+
							'<a href="#none" target="_blank" class="snb_banner_item">지식파트너<br>약관 및 운영원칙<i class="ico_partner"></i></a>'+
							'</div>'+
							'</div>';
				break;

		case 'myinfo' :
			innerHTML = '<div class="snb snb_bordered snb_mykin">'+
						'<h2 class="snb_title blind">마이지식</h2>'+
						'<ul class="snb_list">'+
						'<!-- [D] 활성화메뉴 li 에 .is_active 추가 -->'+
						'<li class="is_active"><a href="">나의 답변 <span class="num">(123)</span></a></li>'+
						'<li><a href="">나의 질문 <span class="num">(45)</span></a></li>'+
						'<li><a href="">나의 친구</a></li>'+
						'<li><a href="">나의 오픈사전 <span class="num">(67)</span></a></li>'+
						'<li><a href="">해피빈 기부함</a>'+
						'<li><a href="">1:1 질문</a>'+
						'<ul class="sub">'+
						'<li><a href="">받은 질문 <span class="num">(8)</span></a></li>'+
						'<li><a href="">보낸 질문 <span class="num">(9)</span></a></li>'+
						'</ul>'+
						'</li>'+
						'<li><a href="">나의 표정/궁금/보관함</a></li>'+
						'<li><a href="">나의 관심질문</a></li>'+
						'<li><a href="">나의 삭제 지식 <span class="num">(1)</span></a></li>'+
						'<li>관리'+
						'<ul class="sub">'+
						'<li><a href="">기본정보</a></li>'+
						'<li><a href="">임시저장 <span class="num">(2)</span></a></li>'+
						'<li><a href="">내공</a></li>'+
						'</ul>'+
						'</li>'+
						'</ul>'+
						'</div>';
			break;
	}

	$('.snb_wrap').append(innerHTML);

	$('.snb_old_title .btn_help').click(function(e){
		e.preventDefault();
		$(this).next('.help_wrap').find('.tooltip').toggle();
	});
}

// 핫토픽키워드 영역
$(function(){
    $('.btn_ie8').click(function(){
        $('.hottopic_keyword_area').addClass('no_stats_ranking_area');
        $(this).addClass('is_active');
        $('.btn_normal').removeClass('is_active');
        $('.stats_ranking_area').hide();
    });

    $('.btn_normal').click(function(){
        $('.hottopic_keyword_area').removeClass('no_stats_ranking_area');
        $(this).addClass('is_active');
        $('.btn_ie8').removeClass('is_active');
        $('.stats_ranking_area').show();
    });

    $('._btn_hottopic_keyword .btn_keyword').click(function () {
        $(this).addClass('is_active');
        $('.btn_ie8').removeClass('is_active');
        $('.btn_normal').removeClass('is_active');
        $('.hottopic_keyword_list .link:even').html('#키워드');
    });

    $('._btn_hottopic_keyword .btn_close').click(function () {
        $('._btn_hottopic_keyword').hide();
    });

});

// 질문분야 영역
$(function(){
    var expandedSt;
    var btnOption = $('.select_option .btn_option');
    var qKeyword = $('.category_list .item');

    $(btnOption).click(function (e){
        expandedSt =  btnOption.attr('aria-expanded');

        if(expandedSt == 'true'){
            $(this).attr({"aria-expanded":"false","aria-pressed":"false"});
            $('.option_area').toggle();
        } else {
            $(this).attr({"aria-expanded":"true","aria-pressed":"true"});
            $('.option_area').toggle();
        }
        $(this).toggleClass('is_active');
        e.preventDefault();
    });

    $('.detail_list .option_area a').click(function(e){
        e.preventDefault();
    });

    $('.select_option .btn_close').click(function(e){
        e.preventDefault();
        $('.option_area').hide();
        btnOption.attr({"aria-expanded":"false","aria-pressed":"false"});
    });

    qKeyword.click(function(e){
        e.preventDefault();
        $(this).attr('aria-pressed','true');
        qKeyword.not($(this)).attr('aria-pressed','false');
        $(this).addClass('is_active');
        qKeyword.not($(this)).removeClass('is_active');
    });
});