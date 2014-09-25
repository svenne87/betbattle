module.exports = [{"isClass":true,"priority":10000.9003,"key":"navLogo","style":{image:"/images/lakers_header.png",left:99,width:130,height:40,}},{"isClass":true,"priority":10000.9005,"key":"challengesSection","style":{height:60,backgroundColor:"#000000",opacity:0.6,layout:"vertical",}},{"isId":true,"priority":100000.9001,"key":"betbattleLogo","style":{}},{"isId":true,"priority":100000.90019999999,"key":"facebookBtn","style":{top:"65%",height:"9%",width:"80%",backgroundColor:"#336699",borderRadius:3,}},{"isId":true,"priority":100101.9004,"key":"nav","style":{translucent:false,statusBarStyle:Titanium.UI.iPhone.StatusBar.LIGHT_CONTENT,backgroundImage:"none",backgroundColor:"none",backgroundGradient:"none",}}];function WPATH(s) {
	var index = s.lastIndexOf('/');
	var path = index === -1 ?
		'danielhanold.pickerWidget/' + s :
		s.substring(0,index) + '/danielhanold.pickerWidget/' + s.substring(index+1);

	// TODO: http://jira.appcelerator.org/browse/ALOY-296
	return OS_ANDROID && path.indexOf('/') !== 0 ? '/' + path : path;
}