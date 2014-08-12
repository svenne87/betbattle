var RegisterWindow = Ti.UI.createWindow({
	backgroundColor: 'white',
	width: 300,
	height: 300,
	opacity: 0.8,
	borderRadius: 20
});

var regist = Titanium.UI.TextView({
	title: 'Register to join BetBattle',
});
 
var username = Titanium.UI.createTextField({
    color:'#336699',
    top:40,
    left:25,
    width:250,
    height:40,
    hintText:'Username',
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(username);
 
var password = Titanium.UI.createTextField({
    color:'#336699',
    top:90,
    left:25,
    width:250,
    height:40,
    hintText:'Password',
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(password);

var passwordAgain = Titanium.UI.createTextField({
    color:'#336699',
    top:90,
    left:25,
    width:250,
    height:40,
    hintText:'Password again',
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(passwordAgain);
 
var signInBtn = Titanium.UI.createButton({
    top: '50%',
	height: '17%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: 'Sign in'
});
RegisterWindow.add(signInBtn);

var cancelBtn = Titanium.UI.createButton({
    top: '70%',
	height: '17%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: 'Cancel'
});
RegisterWindow.add(cancelBtn);