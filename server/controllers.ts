/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { RequestTicket, DeadDrop } from './factory';
import { Actions, IRepository } from './interfaces';
import Service from './service';

// const service = new Service();

// Controlers manage data and logic.
export class Controllers {
  async asyncValidation(): Promise<string> {
    let timeoutId;
    try {
      const result: string | PromiseLike<string> = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve('Dead Drop Oneline');
        }, 10);
      });

      return await result;
    } catch (error) {
      timeoutId && clearTimeout(timeoutId);
      console.log('DeadDrop: Error with async request.');
      console.error(error);
      return 'Error';
    }
  }

  async deaddrop(requestTicket: RequestTicket): Promise<DeadDrop> {
 const repoBlank: IRepository = {
    id_dd: '', 
    pass_hash: '',
    payload: '',
    created_at: new Date(), 
    updated_at: new Date()
    };

      var placeholder = new DeadDrop(requestTicket, repoBlank);


    try {
      var password = requestTicket.password;
           // Review Actions enum in interface file.
      switch (Number(Actions[requestTicket.action])) {
        case 1: // new message
          console.log('message');
          return placeholder;
          break;
        case 2: // change password
          console.log('password');
          return placeholder;
          break;
        case 3: // change title
          console.log('new title');
          return placeholder;
          break;
        case 4: // read previous message
          return await requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(async () => {
           return await Service.readDeadDrop(requestTicket, password);
          });
          break;
        case 5: // create an entirely new dead drop
         return await requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(async () => {
            return await Service.newDeadDrop(requestTicket).then(async () => {
                return await Service.readDeadDrop(requestTicket, password);
            });
          });
          break;
        case 6: // create an entirely new dead drop
          console.log('delete dead drop');
          return placeholder;
          break;
        default:
          console.log('malformed request');
          return placeholder;
          break;
      }
    } catch (error: any) {
      console.log('DeadDrop: Objective Error.');
      console.error(error);
      return placeholder;
  }
 }
  // TODO: Remove this paragraph prior to deployment.
  async drop(): Promise<void> {
    try {
      await Service.drop();
    } catch (error) {
      console.log('DeadDrop: Migration Error.');
      console.error(error);
    }
  }
}
