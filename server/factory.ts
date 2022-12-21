import crypto from 'crypto';
import { Buffer } from 'buffer';
import bcrypt from 'bcryptjs';
import { IUserRequest, IDeadDrop, Actions, IRepository } from './interfaces';
import md5 from 'md5';
import { resolve } from 'path';

const inputEncoding = 'utf-8';
const storageEncoding = 'hex';

class Cryptogropher {
  algorithm = 'aes-192-cbc';
  buffer = Buffer.alloc(16, 0);
  // TODO: once we validate that encryption works, try to use the bcrypt salt generator.
  salt = 'salt';
  keyLength = 24;
  //inputEncodingS = 'utf-8';
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
          // TODO: Error is here. Block length missmatch. I think it has to do with the encoding. Look at the archived encryption methods and try to match them.
          const decrypted = cipher.update(payload, storageEncoding, inputEncoding) + cipher.final(inputEncoding);
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
      console.log('-dev validater arguments: ', stringA, stringB);
    return new Promise<boolean>((resolve) => {
      bcrypt.compare(stringA, stringB, (error: Error, response: boolean) => {
        if (error) {
          console.log('DeadDrop: Hashing Error');
          console.error(error);
        } else {
            console.log('-dev validater response: ', response);
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
  createdAt: Date;
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

  async decryptDeadDrop(password: string): Promise<void> {
    const isPasswordMatching = await this.validater(password, this.repositoryHash);
    const deadDropEncryptionState: boolean[] = [this.isEncrypted, isPasswordMatching];
    
    if (deadDropEncryptionState.includes(false)) {
        console.log('DeadDrop-Dev nothing to do');
    } else {
      this.payload = await this.decrypter(this.payload, password);
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
    // try {
    return new Promise<boolean>((resolve) => {
      try {
        this.encrypter(payload, password).then((encryptedPayload) => {
          this.payload = encryptedPayload;

          this.hasher(password).then((hashedPassword) => {
            this.password = hashedPassword;
            // console.log('DeadDrop-Dev: Ticket Encrypted');
            resolve(true);
          });
        });
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
    // } catch(error) {
    // throw error;
    // }
  }
}
