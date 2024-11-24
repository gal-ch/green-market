import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Account } from 'account/entities/account.entity';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendOrderConfirmation({
    account,
    email,
    subject,
    template,
    context,
    html,
    attachments
  }: {
    account: Account;
    email: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
    html?: any,
    attachments?: any
  }) {    
    const templatePath = path.resolve(__dirname, 'templates', template);
    const response = await this.mailService.sendMail({
      from: `<${account.email}>`,
      to: email,
      subject: subject,
      html, 
      attachments: attachments ? [{ filename: 'report.xlsx', content: attachments, encoding: 'base64' }] : [], // Attach the file if provided
      context, 
    });    
    return response
  }
}
