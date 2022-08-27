import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-ctr';
  private readonly IV_LENGTH = 16;
  private readonly ENCRYPTION_KEY: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.ENCRYPTION_KEY = crypto.scryptSync(
      configService.get('ENCRYPTION_SECRET'),
      'salt',
      32,
    );
  }

  encrypt(text: string) {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.ENCRYPTION_KEY,
      iv,
    );
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(text: string) {
    const [ivPart, encryptedPart] = text.split(':');
    if (!ivPart || !encryptedPart) throw new Error('Invalid text.');

    const iv = Buffer.from(ivPart, 'hex');
    const encryptedText = Buffer.from(encryptedPart, 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.ENCRYPTION_KEY,
      iv,
    );
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);
    return decrypted.toString();
  }
}
