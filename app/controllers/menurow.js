var args = arguments[0] || {};
$.icon.image = args.image;
$.title.text = args.title || '';
$.row.customView = args.customView || '';
$.row.customTitle = $.title;
$.rightIcon.text = args.rightIcon || null; 

if($.rightIcon.text !== null) {
	$.rightIcon.setBackgroundColor("blue");
	$.rightIcon.setColor('#FFF');
	$.rightIcon.setTextAlign('center');
	$.rightIcon.setBorderRadius(8);
	$.rightIcon.setFont({
		fontSize : 12,
		fontWeight : 'normal',
		fontFamily : 'Impact',
	});
}
