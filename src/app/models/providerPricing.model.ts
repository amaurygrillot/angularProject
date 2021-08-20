export interface IProviderPricing {
    id?: string;
    pricingId?: string;
    providerId?: string;
    hourlyPrice: number;
    minimumTime: number;
    maximumTime: number;
}

export class ProviderPricing implements IProviderPricing {
    id?: string;
    pricingId?: string;
    providerId?: string;
    hourlyPrice: number;
    minimumTime: number;
    maximumTime: number;

    constructor(id: string, pricingId: string, providerId: string, hourlyPrice: number, minimumTime: number, maximumTime: number) {
        this.id = id;
        this.pricingId = pricingId;
        this.providerId = providerId;
        this.hourlyPrice = hourlyPrice;
        this.minimumTime = minimumTime;
        this.maximumTime = maximumTime;
    }
}
