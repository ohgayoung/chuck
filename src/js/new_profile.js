
/* .thumbnail 부분 IE7,8에서는 .thumbnail 안에 아래 background-image와 똑같은 경로의 이미지 삽입 (아래 스크립트는 마크업 테스트용 - 개발 시 삭제바랍니다.) */

$(function(){
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
        $('.profile_animate').find('.thumbnail').attr('style', '').append('<img src="http://view.ui.naver.com/m.kin/KINSUS-24621/images/test/absolute_00big.png" alt="hwangsunsoo 님의 프로필" />');

    }else{
        console.log('최신 브라우저');

        var profile_target = $('.profile_animate');

        if (profile_target.length > 0){
            var num = Math.ceil(Math.random(1) * 14);
            var list = ["profile", "master", "hero", "best", "superman", "plant", "wind", "water", "moon", "star", "solar", "galaxy", "space", "angel", "absolute"];

            var url = "http://view.ui.naver.com/m.kin/KINSUS-24621/images/test/";
            var total = url + list[num] + '_' + profile_target.attr('data-size') + '.png';

            profile_target.find('> .thumbnail').css({'background-image' : 'url(' + total + ')'});

            console.log(num);

            // console.log(url + list[num] + '_' + profile_target.attr('data-size') + '.png');

        };
    };
});
