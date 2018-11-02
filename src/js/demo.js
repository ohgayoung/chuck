// GNB sticky
function onScrollSticky() {
    var sticky = document.querySelector('.top_sticky');

    if(sticky) {
        var sticky_gnb = document.querySelector('.top_sticky .gnb'),
            sticky_lnb = document.querySelector('.top_sticky .lnb'),
            sticky_epick = document.querySelector('.editors_pick .section_body'),
            origOffsetY_gnb = sticky_gnb.offsetTop,
            origOffsetY_lnb = sticky_lnb ? sticky_lnb.offsetTop : null,
            origOffsetY_epick = sticky_epick ? sticky_epick.offsetTop : null;

        function onScrollSticky(e) {
            if(window.scrollY >= (origOffsetY_gnb+1)) {
                sticky_gnb.classList.add('sticky');
            } else {
                sticky_gnb.classList.remove('sticky');
            }
            if(origOffsetY_lnb) {
                if(window.scrollY >= (origOffsetY_lnb-45)) {
                    sticky_gnb.classList.add('invert');
                    sticky_lnb.classList.add('sticky','invert');
                } else {
                    sticky_gnb.classList.remove('invert');
                    sticky_lnb.classList.remove('sticky','invert');
                }
            }
            if(origOffsetY_epick) {
                if(window.scrollY >= (origOffsetY_epick-10)) {
                    sticky_epick.classList.add('invert');
                } else {
                    sticky_epick.classList.remove('invert');
                }
            }
        }
        document.addEventListener('scroll', onScrollSticky);
    }
}
onScrollSticky();

// head에 스크립트 추가
function loadScript(url, callback, id, delay) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.id = id || '';
    head.appendChild(script);
    script.onload = callback;

    //addEventListener 미지원
    if (!window.addEventListener) {
        var scriptReady = setInterval(function () {
            if (script.readyState == 'loaded') {
                callback();
                clearInterval(scriptReady);
            }

        }, delay); //
    }
};

// jquery 파일 호출
loadScript('../../doc/js/jquery-1.11.2.min.js', demoInit, 'demo_js', 100);

// 콘솔 저작권 표시
console.log('\n' + '%cMarkup Event Trigger v0.6 - by KimYongWon', 'padding:5px 10px;border-radius:20px;background:#222;color:#fff');
console.log('\n');

// demo 셋팅
function demoInit() {
    var svn_domain = 'http://dev.ui.naver.com/svnview/'; // svn 서버도메인
    var uri_href = location.pathname.split('/'); // 경로이름 (도메인 제외)
    var uri_filename = uri_href[uri_href.length-1]; // 파일명
    var uri_search = location.search.split('='); // 검색 쿼리

    console.log('location.pathname: '+uri_filename);
    console.log('location.search: '+uri_search);

    //인풋 값 삭제 포커스 이벤트
    var input_clear = $('.input_wrap');
    $(input_clear).find('input').on('focus', function() {
        $('.btn_clear_input').show();
        $('.suggest,.recent').show();
        $('.autocomplete,.recent_nodata,.recent_disabled').hide();
        $(input_clear).find('input').on('keyup', function() {
            if($(input_clear).find('input').prop('value') == '엑소') {
                $('.suggest,.autocomplete').show();
                $('.recent').hide();
            } else {
                $('.suggest,.recent').show();
                $('.autocomplete').hide();
            }
        });
    });
    $(input_clear).find('.btn_clear_input').on('click', function() {
        $(input_clear).find('input').prop('value','');
        $('.btn_clear_input').hide();
    });

    $('.suggest, .no_keyword, .campaign').hide();

    $('.btn_extend').on('click', function () {

        if($('.btn_extend span').text() == '펼치기') {
            $('.wrap').removeClass('extend');
            $(this).html("<span class='blind'>접기</span>");
        } else {
            $('.wrap').addClass('extend');
            $(this).html("<span class='blind'>펼치기</span>");
        }
    });

    //home
    if(uri_filename == 'home.html') {
        $('.section_offcafe, .section_joincafe .no_result').hide();
        if(uri_search[1] == 'no_result') {
            $('.section_joincafe .mflick_wrap, .section_joincafe .page_nav').hide();
            $('.section_joincafe .no_result').show();
        }
        if(uri_search[1] == 'logout') {
            $('.section_joincafe,.section_faviboard').hide();
            $('.section_offcafe').show();
        }
    }

    //가입카페
    if(uri_filename == 'mycafe_joined.html') {
        $('.no_result, .section_footer').hide();
        if(uri_search[1] == 'no_result') {
            $('.section_mycafe_joined .list,.loader').hide();
            $('.no_result, .section_recomm1').show();
        } else {
            $('.section_recomm1').remove();
        }
    }

    //즐겨찾는 게시판
    if(uri_filename == 'mycafe_faviboard.html') {
        $('.no_result').hide();
        if(uri_search[1] == 'no_result') {
            $('.section_faviboard_more .list,.loader').hide();
            $('.no_result').show();
        }
    }

    //운영카페
    if(uri_filename == 'mycafe_manage.html') {
        $('.no_result, .section_footer').hide();
        if(uri_search[1] == 'no_result') {
            $('.section_mycafe_manage .list,.loader').hide();
            $('.no_result').show();
        }
    }


    //내소식
    if(uri_filename == 'mynews.html') {
        $('.no_result').hide();
        if(uri_search[1] == 'no_result') {
            $('.section_mynews .list,.loader, .section_footer').hide();
            $('.no_result').show();
        }
    }

    //자동저장 OFF
    if(uri_search[1] == '1') {
        $('#cafe_search').prop('value','');
        $('.suggest').show();
        $('.btn_autosave_off').text('자동저장 켜기');
        $('.btn_all_del_wrap').hide();
        $('.recent .suggest_body, .recent_nodata,.autocomplete').hide();
    }

    //자동저장 ON
    if(uri_search[1] == '2') {
        $('#cafe_search').prop('value','');
        $('.suggest').show();
        $('.recent_disabled,.recent_nodata,.autocomplete').hide();
    }

    //자동저장 결과없음
    if(uri_search[1] == '3') {
        $('#cafe_search').prop('value','');
        $('.suggest,.recent_nodata').show();
        $('.btn_all_del_wrap').hide();
        $('.recent_disabled,.recent .suggest_body,.autocomplete').hide();
    }

    //자동완성 OFF
    if(uri_search[1] == '4') {
        $('#cafe_search').prop('value','엑소');
        $('.suggest,.suggest_foot').show();
        $('.btn_autocomplete_off').text('자동완성 켜기');
        $('.autocomplete .suggest_body,.related_keys,.recent').hide();
        $('.area_sa').remove();
    }

    //자동완성 ON
    if(uri_search[1] == '5') {
        $('#cafe_search').prop('value','엑소');
        $('.suggest').show();
        $('.related_keys,.area_sa,.recent').hide();
        $('.area_sa').remove();
    }

    //입력 키워드 없이 접근
    if(uri_search[1] == '6') {
        $('#cafe_search').prop('value','');
        $('.no_keyword').show();
        $('.section_search_result,.related_keys,.area_sa,.recent_nodata,.recent_disabled,.autocomplete').hide();
    }
    if(uri_search[1] == 'campaign') {
        $('.campaign').show();
    }

    // 테마카페 배경컬러
    if(uri_filename == 'more_theme.html') {
        console.log(uri_search[1]);
        $('.gnb').css('background-color','#'+uri_search[1]);
    }
}
