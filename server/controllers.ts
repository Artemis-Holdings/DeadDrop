/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { RequestTicket } from './factory';
import { Actions } from './interfaces';
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

  async deaddrop(requestTicket: RequestTicket, res: Response): Promise<void> {
    try {
      // Review Actions enum in interface file.
      switch (Number(Actions[requestTicket.action])) {
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
          const password = requestTicket.password;

          requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(async () => {
            const deadDrop = await Service.readDeadDrop(requestTicket, password);
            console.log('-dev deaddrop on controller: ', deadDrop);
            res.status(200).json(deadDrop).end(deadDrop);
          });
          break;
        case 5: // create an entirely new dead drop
          requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(() => {
            Service.newDeadDrop(requestTicket);
          });
          break;
        case 6: // create an entirely new dead drop
          console.log('delete dead drop');
          break;
        default:
          console.log('malformed request');
      }
    } catch (error: any) {
      console.log('DeadDrop: Objective Error.');
      console.error(error);
      res.status(501).json({
        message: 'Server cannot accept the client request.',
        error: error.message,
        stack: error.stack,
      });
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
