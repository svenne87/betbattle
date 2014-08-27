var args = arguments[0] || {};

var fontawesome = require('lib/IconicFont').IconicFont({
	font : 'lib/FontAwesome'
});

var font = 'FontAwesome';

if (OS_ANDROID) {
	font = 'fontawesome-webfont';
}

var mainView = Ti.UI.createScrollView({
	class : "topView",
	height : "100%",
	width : "100%",
	top : 0,
	backgroundColor : "transparent",
	layout : "vertical"
});

var searchLabel = Ti.UI.createLabel({
	text : Alloy.Globals.PHRASES.addFriendsTxt,
	textAlign : "center",
	top : 10,
	font : {
		fontSize : 22,
		fontFamily : "Impact"
	},
	color : "#FFF"
});
mainView.add(searchLabel);


var searchBar=Ti.UI.createSearchBar({
		showCancel:true,
		hintText:'type to search'
});
searchBar.addEventListener('cancel',function(e){
	searchBar.value="";
});





var url = Alloy.Globals.BETKAMPENURL + '/api/get_users_search.php';

var respone = null;

var client = Ti.Network.createHTTPClient({
	// function called when the response data is available
	onload : function(e) {
		Ti.API.info("Received text: " + this.responseText);
		response = JSON.parse(this.responseText);
		var tabel= Ti.UI.createTableView({
	search:searchBar,
	filterCaseInsensitive:false,
	filterAttribute: 'name'
});
//alert(response.data.length);

var rows=[];
for(var item in response.data)
{
	var row=Ti.UI.createTableViewRow({
		name:response.data[item].name.toLowerCase()
	});
	var img=Ti.UI.createImageView({
		image:"/images/no_pic.png",
		height:25,
		width:25,
		left:5
	});
	row.add(img);
	var label= Ti.UI.createLabel({
		text:" "+response.data[item].name,
		left:40,
	});
	row.add(label);
	
	rows.push(row);
}

tabel.setData(rows);

mainView.add(tabel);

	},
	// function called when an error occurs, including a timeout
	onerror : function(e) {
		Ti.API.debug(e.error);
		//alert('error');
	},
	timeout : Alloy.Globals.TIMEOUT // in milliseconds
});
// Prepare the connection.
client.open("GET", url);
// Send the request.
client.send();



$.friendSearch.add(mainView);
