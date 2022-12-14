import { Request, Response } from 'express';
import { RequestTicket } from './factory';
import { Actions } from './interfaces';
import Service from './service';

const service = new Service();

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

  async deaddrop(request: RequestTicket): Promise<void> {
    try {
      console.log('request from controller: ', request);
      // Review Actions enum in interface file.
      switch (Number(Actions[request.action])) {
        case 1: // new message
          console.log('message');
          break;
        case 2: // change password
          console.log('password');
          break;
        case 3: // change title
          console.log('new title');
          break;
        case 4: // read previous message
          console.log('read only');
          break;
        case 5: // create an entirely new dead drop
          console.log('new dead drop');
          break;
        default:
          console.log('malformed request');
      }
    } catch (error) {
      console.log('DeadDrop: Objective Error.');
      console.error(error);
    }
  }

  // TODO: Remove this paragraph prior to deployment.
  async drop(): Promise<void> {
    try {
      await service.drop();
    } catch (error) {
      console.log('DeadDrop: Migration Error.');
      console.error(error);
    }
  }
}
