import { Request, Response } from "express";


// Controlers manage data and logic.
export class Controllers {

    static availabilityTest(req: Request, res: Response): string{
        console.log("availablity requested.");
        return "Dead-Drop Available";
    }



}