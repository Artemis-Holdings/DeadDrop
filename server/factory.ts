import crypto from 'crypto';
import { Buffer } from 'buffer';
import bcrypt from 'bcryptjs';
import { IUserRequest, IDeadDrop, Actions } from './interfaces';
import md5 from 'md5';

const inputEncoding = 'utf-8';
const storageEncoding = 'hex';

class Cryptogropher {
  algorithm = 'aes-192.cbc';
  buffer = Buffer.alloc(16, 0);
  salt = 'salt';
  keyLength = 24;
  inputEncodingS = 'utf-8';
  saltRounds = 12;
  inputEncoding = 'utf-8';
  storageEncoding = 'hex';

  async encrypter(payload: string, password: string): Promise<string> {
    return new Promise<string>((resolve) => {
      crypto.scrypt(password, this.salt, this.keyLength, (error: Error | null, key: Buffer) => {
        if (error) {
          console.log('DeadDrop: Encryption Error');
          console.error(error);
          resolve('corupted payload');
        } else {
          const cipher = crypto.createCipheriv(this.algorithm, key, this.buffer);

          const encrypted = cipher.update(payload, inputEncoding, storageEncoding) + cipher.final(storageEncoding);
          resolve(encrypted);
        }
      });
    });
  }

  async decrypter(payload: string, password: string): Promise<string> {
    return new Promise<string>((resolve) => {
      crypto.scrypt(password, this.salt, this.keyLength, (error: Error | null, key: Buffer) => {
        if (error) {
          console.log('DeadDrop: Decryption Error');
          console.error(error);
          resolve('corupted payload');
        } else {
          const cipher = crypto.createDecipheriv(this.algorithm, key, this.buffer);
          const decrypted = cipher.update(payload, storageEncoding, inputEncoding) + cipher.final(storageEncoding);
          resolve(decrypted);
        }
      });
    });
  }

  async hasher(input: string): Promise<string> {
    const hash = new Promise<string>((resolve) => {
      bcrypt.hash(input, this.saltRounds, (error: Error | null, hash: string) => {
        if (error) {
          console.log('DeadDrop: Hashing Error');
          console.error(error);
        } else {
          resolve(hash);
        }
      });
    });
    return hash;
  }

  async validater(stringA: string, stringB: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      bcrypt.compare(stringA, stringB, (error: Error, response: boolean) => {
        if (error) {
          console.log('DeadDrop: Hashing Error');
          console.error(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

export class RequestTicket extends Cryptogropher implements IUserRequest {
  action: Actions;
  title: string;
  password: string;
  payload: string;
  id: Promise<string> | string;

  constructor(action: Actions, title: string, password: string, payload: string) {
    super();
    this.action = action;
    this.title = title;
    this.password = password;
    this.payload = payload;
    this.id = this.idGenerator(title);
  }
  private idGenerator(title: string): string {
    return md5(title);
  }
}
