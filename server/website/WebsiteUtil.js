var prototype = module.exports;
var Organizations = require('../tables/organization/Organizations');

prototype.getNavigationBar = function (loggedIn, toAdd, URL) {
    var toReturn = '<div id="_nav">';

    //Ho
    toReturn += '<a href="' + toAdd + '../"><i class="fa fa-home"></i><div class="name"> Home</div><span class="tooltiptext" style="left: 0">Home</span></a>';

    if (loggedIn) {
        toReturn += '<a href="' + toAdd + 'events"><i class="fa fa-calendar-o"></i><div class="name"> Events</div><span class="tooltiptext" style="left: 28px">Events</span></a>';
        toReturn += '<a href="' + toAdd + 'organizations"><i class="fa fa-users"></i><div class="name"> Organizations</div><span class="tooltiptext" style="left: 43px">Organizations</span></a>';
    }

    toReturn += '<div class="_right">';
    toReturn += '<div class="search"><input class="_search" type="text" placeholder="Search..." id="_search"><div class="_search-content" id="_search-content"> </div> </div>';

    if (loggedIn) {
        toReturn += '<a href="' + toAdd + 'logout"> <i class="fa fa-sign-out"></i> <div class="name"> Logout</div> <span class="tooltiptext" style="right: 0px">Logout</span></a>';
    } else {
        toReturn += '<a href="' + toAdd + 'login?redirect=' + URL + '"> <i class="fa fa-user"></i> <div class="name"> Login/Signup</div> <span class="tooltiptext" style="right: 0px">Login/Signup</span></a>';
    }

    toReturn += '</div></div>';

    return toReturn;
};

prototype.getAdminNavigationBar = function (toAdd, URL) {
    var toReturn = '<div id="_nav">';

    //Home
    toReturn += '<a href="' + toAdd + '../"><i class="fa fa-home"></i><div class="name"> Home</div><span class="tooltiptext" style="left: 0">Home</span></a>';
    toReturn += '<a href="' + toAdd + 'admin/whitelist"><i class="fa fa-calendar-o"></i><div class="name"> Whitelist</div><span class="tooltiptext" style="left: 28px">Events</span></a>';

    toReturn += '<div class="_right">';
    toReturn += '<div class="search"><input class="_search" type="text" placeholder="Search..." id="_search"><div class="_search-content" id="_search-content"> </div> </div>';

    toReturn += '<a href="' + toAdd + 'logout"> <i class="fa fa-sign-out"></i> <div class="name"> Logout</div> <span class="tooltiptext" style="right: 0px">Logout</span></a>';
    toReturn += '</div></div>';

    return toReturn;
};

prototype.getMobileNavigationBar = function (toAdd){
    var toReturn = '';

    toReturn += '<div id="nav"> <!--<img src="assets/favicon.png" width="20" height="20" style="float: left; padding-right: 5px">--> <a href="' + toAdd + '"><div class="element">Commservus</div></a> <div class="nMenu" onclick="toggleMenu()"><i class="fa fa-bars"></i></div> <div class="search" onclick="openSearch()"><i class="fa fa-search"></i></div> </div>';

    return toReturn;
};

// Lets move this to ids so we can find stuff
prototype.getMobileNavigationBarAssets = function (toAdd){
    var toReturn = '';

    // Search Bar
    toReturn += '<div id="search-bar"> <i class="fa fa-chevron-left sb-back" onclick="closeSearch()"></i> <input type="search" id="searchBarTop" placeholder="Search"> </div>';

    // Menu
    toReturn += '<div id="menu" class="menu"> <a href="#" onclick="openLogin()" class="nLog"> <div class="item"> <i class="fa fa-user icon"></i> <div class="content"> Login / Signup </div> </div> </a> <a href="' + toAdd + 'settings/account" class="log"> <div class="item"> <i class="fa fa-user icon"></i> <div class="content"> Account </div> </div> </a> <a href="' + toAdd + 'logout" class="log"> <div class="item">'


    toReturn += '<i class="fa fa-sign-out icon"></i> <div class="content"> Signout </div> </div> </a> </div>';

    // Bleed
    toReturn += '<div id="bleed"> </div>';

    // Login Modal
    toReturn += '<div id="loginModal" class="modal"> <i class="fa fa-times close"></i> <div class="icon"> <img src="assets/favicon.png" width="50" height="50"> </div> <form id="loginForm"> <div class="title"> Login to Commservus </div> <div class="status"> </div> <input type="text" placeholder="Username or Email" name="id"> <input class="removeTop" type="password" placeholder="Password" name="password"><br> <!--<input type="checkbox" id="box-1"><label for="box-1">Remember me</label>--> <input type="button" value="LOGIN" onclick="loginAction()"> <input type="submit" style="display: none"> </form> <div class="texts"> <a href="#" onclick="openForgot()"> <div class="text"> Forgot Password?</div> </a> <a href="#" onclick="openSignup()"> <div class="text"> Don\'t have an account?</div> </a> </div> </div>';

    // Signup Modal
    toReturn += '<div id="signupModal" class="modal"> <i class="fa fa-times close"></i> <div class="icon"> <img src="assets/favicon.png" width="50" height="50"> </div> <form id="signupForm"> <div class="title"> Signup for Commservus </div> <div class="status"> </div> <input type="text" placeholder="Display Name" name="display"> <input class="removeTop" type="text" placeholder="Username" name="username"> <input class="removeTop" type="text" placeholder="Email" name="email"> <input class="removeTop" type="password" placeholder="Password" name="password"> <input class="removeTop" type="password" placeholder="Confirm Password" name="confirm"> <input type="button" value="SIGNUP" onclick="signupAction()"> <input type="submit" style="display: none"> </form> <div class="texts"> <a href="#" onclick="openLogin()"> <div class="text"> Already have an account?</div> </a> </div> </div>';

    // Forgot Modal
    toReturn += '<div id="forgotModal" class="modal"> <i class="fa fa-times close"></i> <div class="icon"> <img src="assets/favicon.png" width="50" height="50"> </div> <form id="forgotForm"> <div class="title"> Forgot Password </div> <div class="status"> </div> <input type="text" placeholder="Username or Email" name="id"> <input type="button" value="FORGOT" onclick="forgotAction()"> <input type="submit" style="display: none"> </form> <div class="texts"> <a href="#" onclick="openLogin()"> <div class="text"> Remember your info?</div> </a> </div> </div>';

    // Alpha Modal
    toReturn += '<div id="alphaModal" class="modal"> <i class="fa fa-times close"></i> <div class="icon"> <img src="assets/favicon.png" width="50" height="50"> </div> <form> <div class="title"> Commservus Closed Alpha </div> <div class="description"> Commservus is currently in closed alpha. This means that only certain people can signup. If you feel like you should be able to signup, contact avery@frostbyte.co </div> </form> </div>';

    // Search Result
    toReturn += '<div id="searchResult" class="menu"></div>';

    return toReturn;
};

prototype.getMobileFooter = function(toAdd){
    var toReturn = '';

    toReturn += '<div id="footer"> <div class="element"> Terms of Service </div> <div class="break"> - </div> <div class="element"> Support </div> <div class="break"> - </div> <div class="element"> Support </div> <div class="break"> - </div> <div class="element"> Support </div> <div class="break"> - </div> <div class="element"> Support </div> <div class="break"> - </div> <div class="element"> Suppsort </div> </div>';

    return toReturn;
}