var args = arguments[0] || {};
$.icon.image = args.image;
$.title.text = args.title || '';
$.row.customView = args.customView || '';
$.row.method = args.method || '';
$.row.customTitle = $.title;
$.rightIcon.text = args.rightIcon || null; 

if($.rightIcon.text !== null) {
	$.rightIcon.setBackgroundColor(Alloy.Globals.themeColor());
	$.rightIcon.setColor('#FFF');
	$.rightIcon.setTextAlign('center');
	$.rightIcon.setBorderRadius(8);
	$.rightIcon.setFont(Alloy.Globals.getFontCustom(12, "Regular"));
}
