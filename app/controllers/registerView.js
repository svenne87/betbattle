var RegisterWindow = Ti.UI.createWindow({
	backgroundColor: 'white',
	width: 300,
	height: 400,
	opacity: 0.8,
	borderRadius: 20
});

var email = Titanium.UI.createTextField({
    color:'#336699',
    top:80,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.emailTxt,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(email);

var username = Titanium.UI.createTextField({
    color:'#336699',
    top:130,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.usernameTxt,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(username);
 
var password = Titanium.UI.createTextField({
    color:'#336699',
    top:180,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.passwordTxt,
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(password);

var passwordAgain = Titanium.UI.createTextField({
    color:'#336699',
    top:230,
    left:25,
    width:250,
    height:40,
    hintText: Alloy.Globals.PHRASES.passwordTxt,
    passwordMask:true,
    keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
    returnKeyType:Titanium.UI.RETURNKEY_DEFAULT,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
});
RegisterWindow.add(passwordAgain);
 
var signUpBtn = Titanium.UI.createButton({
    top: 290,
	height: '10%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.regTxt
});
RegisterWindow.add(signUpBtn);

var cancelRegBtn = Titanium.UI.createButton({
    top: 340,
	height: '10%',
	width: '68.5%',
	left: '15%',
	backgroundColor: '#000',
	color: '#fff',
	borderRadius: 3,
	title: Alloy.Globals.PHRASES.abortBtnTxt
});
RegisterWindow.add(cancelRegBtn);

//handle buttons in login modal
cancelRegBtn.addEventListener('click', function(e)
{
	
	RegisterWindow.close();
});

signUpBtn.addEventListener('click', function(e)
{
	alert("Username and Password are required");
});