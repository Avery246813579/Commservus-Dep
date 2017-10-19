var prototype = module.exports;

var errors = {};

prototype.findError = function (code) {
    if (typeof errors[code] == "undefined") {
        return {
            CODE: -1,
            DESCRIPTION: "Error description not found"
        }
    }

    return errors[code];
};

errors['BODY_JSON_INVALID'] = prototype.BODY_JSON_INVALID = {
    CODE: -1,
    DESCRIPTION: "JSON in body is invalid"
};

errors['BODY_ARGUMENT_MISSING'] = prototype.BODY_ARGUMENT_MISSING = {
    CODE: 0,
    DESCRIPTION: "Argument in body is missing"
};

errors['VARIABLE_LENGTH_MISSMATCH'] = prototype.VARIABLE_LENGTH_MISSMATCH = {
    CODE: 1,
    DESCRIPTION: "Variable length is not what is expected"
};

errors['VARIABLE_LENGTH_SHORT'] = prototype.VARIABLE_LENGTH_SHORT = {
    CODE: 2,
    DESCRIPTION: "Variable length is shorten then expected"
};

errors['VARIABLE_LENGTH_LONGER'] = prototype.VARIABLE_LENGTH_LONGER = {
    CODE: 3,
    DESCRIPTION: "Variable length is longer then expected"
};

errors['VARIABLE_TYPE_MISSMATCH'] = prototype.VARIABLE_TYPE_MISSMATCH = {
    CODE: 4,
    DESCRIPTION: "Variable type is not what's expected"
};

errors['INTERNAL_ERROR'] = prototype.INTERNAL_ERROR = {
    CODE: 5,
    DESCRIPTION: "Something broke internally. Submit the error in a ticket!"
};

errors['ELEMENT_ALREADY_CREATED'] = prototype.ELEMENT_ALREADY_CREATED = {
    CODE: 6,
    DESCRIPTION: "Element was already created or already exists."
};

errors['TOKEN_INVALID'] = prototype.TOKEN_INVALID = {
    CODE: 7,
    DESCRIPTION: "Account token is invalid"
};

errors['COOKIE_NOT_FOUND'] = prototype.COOKIE_NOT_FOUND = {
    CODE: 8,
    DESCRIPTION: "Could not find cookie"
};

errors['CLIENT_INVALID'] = prototype.CLIENT_INVALID = {
    CODE: 9,
    DESCRIPTION: "Client not found or has been moved"
};

errors['SESSION_INVALID'] = prototype.SESSION_INVALID = {
    CODE: 10,
    DESCRIPTION: "Session not found, invalid, or forcefully closed."
};

errors['SESSION_EXPIRED'] = prototype.SESSION_EXPIRED = {
    CODE: 11,
    DESCRIPTION: "Session has expired"
};

errors['SETTING_INVALID'] = prototype.SETTING_INVALID = {
    CODE: 12,
    DESCRIPTION: "Couldn't find setting"
};

errors['EMAIL_AUTHENTICATING'] = prototype.EMAIL_AUTHENTICATING = {
    CODE: 13,
    DESCRIPTION: "Email is being authenticated. Is an account already created?"
};

errors['EMAIL_QUERY_EXPIRED'] = prototype.EMAIL_QUERY_EXPIRED = {
    CODE: 14,
    DESCRIPTION: "Email query has expired"
};

errors['EMAIL_TOKEN_INVALID'] = prototype.EMAIL_TOKEN_INVALID = {
    CODE: 15,
    DESCRIPTION: "Email token is invalid"
};

errors['LOGIN_INVALID'] = prototype.LOGIN_INVALID = {
    CODE: 16,
    DESCRIPTION: "Login invalid"
};

errors['SESSION_ALREADY'] = prototype.SESSION_ALREADY = {
    CODE: 17,
    DESCRIPTION: "Login invalid, you are already logged in"
};

errors['CREDENTIALS_INVALID'] = prototype.CREDENTIALS_INVALID = {
    CODE: 18,
    DESCRIPTION: "Credentials are invalid. Please check information again"
};

errors['EMAIL_RESET_ALREADY_SENT'] = prototype.EMAIL_RESET_ALREADY_SENT = {
    CODE: 19,
    DESCRIPTION: "Email reset already sent"
};

errors['ACCOUNT_NOT_FOUND'] = prototype.ACCOUNT_NOT_FOUND = {
    CODE: 20,
    DESCRIPTION: "Account not found with credentials"
};

errors['BODY_ARGUMENTS_MISSING'] = prototype.BODY_ARGUMENTS_MISSING = {
    CODE: 21,
    DESCRIPTION: "Could not find any body arguments"
};

errors['EMAIL_CHANGE_ALREADY_SENT'] = prototype.EMAIL_CHANGE_ALREADY_SENT = {
    CODE: 22,
    DESCRIPTION: "Email change already sent"
};

errors['EMAIL_ALREADY_AUTHENTICATED'] = prototype.EMAIL_ALREADY_AUTHENTICATED = {
    CODE: 23,
    DESCRIPTION: "Email was already authenticated"
};

errors['ICON_INVALID'] = prototype.ICON_INVALID = {
    CODE: 24,
    DESCRIPTION: "Icon is invalid or was not found"
};

errors['EMAIL_BLACKLISTED'] = prototype.EMAIL_BLACKLISTED = {
    CODE: 25,
    DESCRIPTION: "Email invalid. That domain is blacklisted"
};

errors['ORGANIZATION_ACCOUNT_DUPLICATE'] = prototype.ORGANIZATION_ACCOUNT_DUPLICATE = {
    CODE: 26,
    DESCRIPTION: "Account already has an organization"
};

errors['ORGANIZATION_DUPLICATE'] = prototype.ORGANIZATION_DUPLICATE = {
    CODE: 27,
    DESCRIPTION: "Organization already created"
};

errors['ORGANIZATION_INVALID'] = prototype.ORGANIZATION_INVALID = {
    CODE: 28,
    DESCRIPTION: "Organization invalid"
};

errors['ORGANIZATION_INSUFFICIENT_PERMISSIONS'] = prototype.ORGANIZATION_INSUFFICIENT_PERMISSIONS = {
    CODE: 29,
    DESCRIPTION: "Account has insufficient permission to access organization"
};

errors['ORGANIZATION_MEMBER_DUPLICATE'] = prototype.ORGANIZATION_MEMBER_DUPLICATE = {
    CODE: 30,
    DESCRIPTION: "Account is already member of organization"
};

errors['ORGANIZATION_PASSWORD_INVALID'] = prototype.ORGANIZATION_PASSWORD_INVALID = {
    CODE: 31,
    DESCRIPTION: "Password for organization is invalid"
};

errors['ORGANIZATION_GROUP_INVALID'] = prototype.ORGANIZATION_GROUP_INVALID = {
    CODE: 32,
    DESCRIPTION: "Organization group is invalid"
};

errors['EVENT_INSUFFICIENT_PERMISSIONS'] = prototype.EVENT_INSUFFICIENT_PERMISSIONS = {
    CODE: 33,
    DESCRIPTION: "Account has insufficient permission to access event"
};

errors['EVENT_INVALID'] = prototype.EVENT_INVALID = {
    CODE: 34,
    DESCRIPTION: "Event is invalid or not found"
};

errors['EVENT_APPLICATION_DUPLICATE'] = prototype.EVENT_APPLICATION_DUPLICATE = {
    CODE: 35,
    DESCRIPTION: "Application for event already sent"
};

errors['EVENT_APPLICATION_INVALID'] = prototype.EVENT_APPLICATION_INVALID = {
    CODE: 36,
    DESCRIPTION: "Application not found or is invalid"
};

errors['ORGANIZATION_ACCOUNT_INVALID'] = prototype.ORGANIZATION_ACCOUNT_INVALID = {
    CODE: 37,
    DESCRIPTION: "Organization account is invalid"
};

errors['EMAIL_NOT_WHITELISTED'] = prototype.EMAIL_NOT_WHITELISTED = {
    CODE: 38,
    DESCRIPTION: "Email is not whitelisted"
};

errors['INSUFFICIENT_PERMISSIONS'] = prototype.INSUFFICIENT_PERMISSIONS = {
    CODE: 39,
    DESCRIPTION: "Account has insufficient permission to access this feature"
};

errors['WHITELIST_INVALID'] = prototype.WHITELIST_INVALID = {
    CODE: 40,
    DESCRIPTION: "Whitelist not found"
};

errors['DATA_PARSE_ERROR'] = prototype.DATA_PARSE_ERROR = {
    CODE: 41,
    DESCRIPTION: "Data parsing error"
};