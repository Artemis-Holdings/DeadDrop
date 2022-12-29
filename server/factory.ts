import crypto from 'crypto';
import { Buffer } from 'buffer';
import bcrypt from 'bcryptjs';
import { IUserRequest, IDeadDrop, Actions, IRepository } from './interfaces';
import md5 from 'md5';
import { resolve } from 'path';
import { create } from 'domain';

const inputEncoding = 'utf8';
const storageEncoding = 'hex';
const initVector = Buffer.alloc(16, 0);
const salt = 'salt';
const algorithm = 'aes-256-cbc';
const saltRounds = 12;
const keyLength = 32;

class Cryptogropher {
  // TODO: once we validate that encryption works, try to use the bcrypt salt generator.
  //inputEncodingS = 'utf-8';
  //inputEncoding = 'utf8';
  //storageEncoding = 'hex';

  async encrypter(payload: string, password: string): Promise<string> {
    const output = new Promise<string>((resolve) => {
      crypto.scrypt(password, salt, keyLength, (error: Error | null, key: Buffer) => {
        const cipher = crypto.createCipheriv(algorithm, key, initVector);

        let encrypted = cipher.update(payload, inputEncoding, storageEncoding);
        encrypted += cipher.final(storageEncoding);
        resolve(encrypted);
      });
    });
    return await output;
  }

  async decrypter(payload: string, password: string): Promise<string> {
    const output = new Promise<string>((resolve) => {
      crypto.scrypt(password, salt, keyLength, (error: Error | null, key: Buffer) => {
        const cipher = crypto.createDecipheriv(algorithm, key, initVector);

        let decrypted = cipher.update(payload, storageEncoding, inputEncoding);
        decrypted += cipher.final(inputEncoding);
        resolve(decrypted);
      });
    });
    return await output;
  }

  async hasher(input: string): Promise<string> {
    const hash = new Promise<string>((resolve) => {
      bcrypt.hash(input, saltRounds, (error: Error | null, hash: string) => {
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

export class DeadDrop extends Cryptogropher implements IDeadDrop {
  id: Promise<string> | string;
  title: string;
  payload: string;
  isEncrypted: boolean;
  createdAt: Date | undefined;
  updatedAt: Date;
  ticketPassword: string;
  repositoryHash: string;

  constructor(requestTicket: RequestTicket, repository: IRepository) {
    super();

    this.id = repository.id_dd;
    this.title = requestTicket.title;
    this.payload = repository.payload;
    this.isEncrypted = true;
    this.ticketPassword = requestTicket.password;
    this.repositoryHash = repository.pass_hash;
    this.createdAt = repository.created_at;
    this.updatedAt = repository.updated_at;
  }

  // Completely empties the dead drop object.
  strip(): void {
    this.id = '';
    this.title = '';
    this.payload = '';
    this.repositoryHash = '';
    this.ticketPassword = '';
    this.createdAt = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
    this.updatedAt = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
  }

  // Removes potentiall sensitive data from the object.
  clean(): void {
    this.id = 'redacted';
    this.repositoryHash = 'redacted';
    this.ticketPassword = 'redacted';
  }

  async decryptDeadDrop(password: string): Promise<void> {
    const isPasswordMatching = await this.validater(password, this.repositoryHash);
    const deadDropEncryptionState: boolean[] = [this.isEncrypted, isPasswordMatching];

    if (!deadDropEncryptionState.includes(false)) {
      this.payload = await this.decrypter(this.payload, password);
      this.isEncrypted = false;
    } else {
      console.log('DeadDrop: contents decrypted');
    }
  }
}

export class RequestTicket extends Cryptogropher implements IUserRequest {
  action!: Actions;
  title!: string;
  password!: string;
  payload!: string;
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

  async encryptTicket(payload: string, password: string): Promise<boolean> {
    try {
      return new Promise<boolean>((resolve) => {
        try {
          this.encrypter(payload, password).then((encryptedPayload) => {
            this.payload = encryptedPayload;

            this.hasher(password).then((hashedPassword) => {
              this.password = hashedPassword;
              resolve(true);
            });
          });
        } catch (error) {
          console.log(error);
          resolve(false);
        }
      });
    } catch (error) {
      return new Promise<boolean>(() => {
        return false;
      });
    }
  }
}
