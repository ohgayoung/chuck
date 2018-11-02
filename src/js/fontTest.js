$(document).ready(function(){
	var fontTestStyle = document.createElement('style');
	fontTestStyle.id = 'fontTestStyle';
	fontTestStyle.innerHTML = "body,input,textarea,select,button,table{font-family:'맑은 고딕', 'Malgun Gothic', '돋움', Dotum, sans-serif}";

	var fontTestStyle2 = document.createElement('style');
	fontTestStyle2.id = 'fontTestStyle2';
	fontTestStyle2.innerHTML = "body,input,textarea,select,button,table{font-family:'돋움', Dotum, sans-serif}";

	$('body').append('<div style="position:absolute;top:20px;left:20px;z-index:20000"><button class="fontTest" style="border:1px solid #000; padding: 10px;">폰트 전환 <span>(맑은 고딕)</span></button></div>');
	$('.fontTest').click(function() {
		if($('head #fontTestStyle').length > 0) {
			$('head #fontTestStyle')[0].remove();
			$('head').append(fontTestStyle2);
			$(this).find('span').html('(돋움)');
		} else if($('head #fontTestStyle2').length > 0) {
			$('head #fontTestStyle2')[0].remove();
			$(this).find('span').html('(맑은 고딕)');
		} else {
			$('head').append(fontTestStyle);
			$(this).find('span').html('(나눔고딕)');
		}
	});
});