export interface MailForgotPassword {
    code: string;
    path: string;
}

export interface MailLoginByGoogle {
    name: string;
    password: string;
}

export interface MailSystemUser {
  path: string;
  link: string;
}

export interface MailSystemOtp {

    otp: string;
    email: string;
}

