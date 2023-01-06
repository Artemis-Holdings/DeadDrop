/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestTicket, DeadDrop } from './factory';
import { Actions, IRepository } from './interfaces';
import Service from './service';

// Controlers manage data and logic.
export class Controller {

  static emptyDeadDrop: DeadDrop = new DeadDrop(new RequestTicket(Actions.READ, '', '', ''), {} as IRepository);

  static async asyncValidation(): Promise<string> {
    let timeoutId;
    try {
      const result: string | PromiseLike<string> = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(
            `☠️ DeadDrop server is available. ☠️ To make a request submit a PUT request with the following headers: title, payload, password, action.`,
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

  static async deaddrop(requestTicket: RequestTicket): Promise<DeadDrop | string> {
    // const emptyDeadDrop = new DeadDrop(requestTicket, repoBlank);
    
    const password = requestTicket.password;

    try {
      switch (Number(Actions[requestTicket.action])) {
        case 0: {
          console.log(`DeadDrop :: ${requestTicket.id} :: Update Payload Initiated.`)
          return await this.updateDeadDrop(requestTicket, password);

        }
        case 1: // change password
          console.warn('DeadDrop :: Change Password is unavailable at this time.');
          return this.emptyDeadDrop;

        case 2: {
          // UPDATE TITLE
          console.warn('DeadDrop :: Update Title is unavailable at this time.');
          return this.emptyDeadDrop;

        }

        case 3: {
          // READ DEAD DROP
          console.log(`DeadDrop :: ${requestTicket.id} :: Read DeadDrop Initiated.`);
          return await this.readDeadDrop(requestTicket, password);
        }
        case 4: {
          // CREATE DEAD DROP
          console.log(`DeadDrop :: ${requestTicket.id} :: Create DeadDrop Initiated.`);
          return await this.createDeadDrop(requestTicket, password);
        }
        case 5: {
          // DELETE DEAD DROP
          console.log(`DeadDrop :: ${requestTicket.id} :: Delete DeadDrop Initiated.`);
          return await requestTicket
            .encryptTicket(requestTicket.payload, requestTicket.password)
            .then(async (status: boolean) => {
              if (status) {
                const currentDeadDrop = await Service.readDeadDrop(requestTicket, password);
                if (currentDeadDrop.isEncrypted) {
                  console.warn(`DeadDrop :: ${requestTicket.id} :: Unable to delete DeadDrop. Check the password.`);
                  return Controller.emptyDeadDrop;
                } else {
                  return await Service.deleteDeadDrop(requestTicket);
                }
              } else {
                console.warn(`DeadDrop :: ${requestTicket.id} :: Unable to encrypt ticket.`);
                return Controller.emptyDeadDrop;
              }
            });
        }
        default:
          console.log(`DeadDrop :: ${requestTicket.id} :: Invalid action. Potentially malformed request`);
          return Controller.emptyDeadDrop;
      }
    } catch (error: any) {
      console.log(`DeadDrop :: ${requestTicket.id} :: Error with request.`);
      console.error(error);
      return Controller.emptyDeadDrop;
    }
  }


  private static async updateDeadDrop(requestTicket: RequestTicket, password: string ): Promise<DeadDrop> {
    return await requestTicket
    .encryptTicket(requestTicket.payload, requestTicket.password)
    .then(async (status: boolean) => {
      if (status) {
        const currentDeadDrop = await Service.readDeadDrop(requestTicket, password);
        if (currentDeadDrop.isEncrypted) {
          console.warn(`DeadDrop :: ${requestTicket.id} :: Unable to update payload. Check the password.`);
          return Controller.emptyDeadDrop;
        } else {
          console.log(`DeadDrop :: ${requestTicket.id} :: Update Payload Complete.`)
          return await Service.editPayloadDeadDrop(requestTicket, password);
        }
      } else {
        console.warn(`DeadDrop :: ${requestTicket.id} :: Unable to update encrypt. Check the password.`);
        return Controller.emptyDeadDrop;
      }
    });
  }


  private static async createDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
  return await requestTicket.encryptTicket(requestTicket.payload, requestTicket.password).then(async () => {
    return await Service.newDeadDrop(requestTicket, password).then(async () => {
      console.log(`DeadDrop :: ${requestTicket.id} :: Create DeadDrop Complete.`)
      return await Service.readDeadDrop(requestTicket, password);
    });
  }).catch((error: any) => {
      console.log(`DeadDrop :: ${requestTicket.id} :: Error with request.`);
      console.error(error);
      return Controller.emptyDeadDrop;
    }
  );
}

  private static async readDeadDrop(requestTicket: RequestTicket, password: string): Promise<DeadDrop> {
    return await requestTicket
    .encryptTicket(requestTicket.payload, requestTicket.password)
    .then(async (status: boolean) => {
      if (status) {
        console.log(`DeadDrop :: ${requestTicket.id} :: Read DeadDrop Complete.`);
        return await Service.readDeadDrop(requestTicket, password);
      } else {
        console.warn(`DeadDrop :: ${requestTicket.id} :: Unable to encrypt ticket.`);
        return Controller.emptyDeadDrop;
      }
    }).catch(
      (error: any) => {
        console.log(`DeadDrop :: ${requestTicket.id} :: Error with request.`);
        console.error(error);
        return Controller.emptyDeadDrop;
      }
    );
  }

}






