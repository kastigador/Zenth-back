import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { decryptPayloadEnvelope, isEncryptedPayloadEnvelope } from './payload-crypto';

@Injectable()
export class DecryptPayloadPipe implements PipeTransform {
  constructor(private readonly secret: string) {}

  transform(value: unknown, metadata: { type?: string }) {
    if (metadata.type !== 'body') {
      return value;
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    if (!isEncryptedPayloadEnvelope(value)) {
      return value;
    }

    if (!this.secret) {
      throw new BadRequestException('Missing PAYLOAD_ENCRYPTION_SECRET');
    }

    try {
      return decryptPayloadEnvelope(value, this.secret);
    } catch {
      throw new BadRequestException('Invalid encrypted payload');
    }
  }
}
