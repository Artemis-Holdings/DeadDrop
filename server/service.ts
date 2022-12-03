export class Service {
  static async migrate(): Promise<PromiseLike<string>> {
    let timeoutId;

    const result: string | PromiseLike<string> = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve('Dead Drop Service Achieved');
      }, 10);
    });

    return await result;
  }
}
