/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestTicket, DeadDrop } from './factory';
import { Actions, IRepository } from './interfaces';
import Service from './service';

// const service = new Service();

// Controlers manage data and logic.
export class Controller {
  static async asyncValidation(): Promise<string> {
    let timeoutId;
    try {
      const result: string | PromiseLike<string> = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(
            `DeadDrop server is available. \n To make a request submit a PUT request with the following headers: title, payload, password, action.`,
          );
        }, 1);
      });

      return await result;
    } catch (error) {
      timeoutId && clearTimeout(timeoutId);
      console.log('DeadDrop: Error with async request.');
      console.error(error);
      return 'Error';
    }
  }

  static async deaddrop(requestTicket: RequestTicket): Promise<DeadDrop> {
    const repoBlank: IRepository = {
      id_dd: '',
      pass_hash: '',
      payload: '',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const placeholder = new DeadDrop(requestTicket, repoBlank);

    try {
      const password = requestTicket.password;
      // Review Actions enum in interface file.
      switch (Number(Actions[requestTicket.action])) {
        case 0: // edit dead drop
          return await requestTicket
            .encryptTicket(requestTicket.payload, requestTicket.password)
            .then(async (status: boolean) => {
              if (status) {
                const currentDeadDrop = await Service.readDeadDrop(requestTicket, password);
                if (currentDeadDrop.isEncrypted) {
                  console.log(`DeadDrop: Request ${requestTicket.id} is invalid. Check the password again .`);
                  return placeholder;
                } else {
                  return await Service.editDeadDrop(requestTicket, password);
                }
              } else {
                console.log(`DeadDrop: Unable to encrypt ticket request ${requestTicket.id}. Try requesting again.`);
                return placeholder;
              }
            });
        case 1: // change password
          console.log('password');
          return placeholder;
          break;
        case 2: // change title
          console.log('new title');
          return placeholder;
        case 3: // read previous message
          return await requestTicket
            .encryptTicket(requestTicket.payload, requestTicket.password)
            .then(async (status: boolean) => {
              if (status) {
                return await Service.readDeadDrop(requestTicket, password);
              } else {
                return placeholder;
              }
            });
        case 4: // create an entirely new dead drop
          return await requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(async () => {
            return await Service.newDeadDrop(requestTicket).then(async () => {
              return await Service.readDeadDrop(requestTicket, password);
            });
          });
          break;
        case 5: // delete dead drop
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
}
