import {MailerService} from '@nestjs-modules/mailer';
import {Injectable} from '@nestjs/common';
import {
  MailForgotPassword,
  MailLoginByGoogle,
  MailSystemOtp,
  MailSystemUser,
} from './interface';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMailForgotPassword(email: string, body: MailForgotPassword) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Forgot Password',
      template: './forgot-password',
      context: body,
    });
  }

  async sendMailRegisterSuccess(email: string, body: MailForgotPassword) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'OTP Verification',
      template: './register-successfully',
      context: body,
    });
  }

  async sendMailLoginByGoogle(email: string, body: MailLoginByGoogle) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Login Google',
      template: './login-by-google',
      context: body,
    });
  }

  async sendMailSystemUserRegister(email: string, body: MailSystemUser) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Register Successfully',
      template: './system-user-register',
      context: body,
    });
  }

  async sendMailSystemUserForgotPassword(email: string, body: MailSystemUser) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Forgot Password',
      template: './system-user-forgot-password',
      context: body,
    });
  }

  async sendMailSystemAdminApproveWithdrawRequest(email: string, body: MailSystemUser) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Register Successfully',
      template: './system-user-register',
      context: body,
    });
  }

  async sendMailSystemOtp(email: string, body: MailSystemOtp) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Active account by confirm OTP',
      template: './send-otp',
      context: body,
    });
  }
}
