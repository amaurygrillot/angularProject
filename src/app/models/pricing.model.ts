export interface IPricing {
    id?: string;
    providerId?: string;
    date: string;
    startHour: number;
    endHour: number;
    price: number;
    hourlyPrice: number;
}

export class Pricing implements IPricing {
    id?: string;
    providerId?: string;
    date: string;
    startHour: number;
    endHour: number;
    price: number;
    hourlyPrice: number;

    constructor(id: string, providerId: string, date: string, startHour: number, endHour: number, price: number, hourlyPrice: number) {
        this.id = id;
        this.providerId = providerId;
        this.date = date;
        this.startHour = startHour;
        this.endHour = endHour;
        this.price = price;
        this.hourlyPrice = hourlyPrice;
    }
}
