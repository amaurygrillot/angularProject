import { Diploma } from './diploma.model';
import { Experience } from './experience.model';
import { Pricing } from './pricing.model';

export interface IProvider {
    id?: string;
    userId?: string;
    description?: string;
    verified?: boolean | null;
    updateAt?: Date;
    createdAt?: Date;
    diploma?: Diploma[];
    experience?: Experience[];
    pricing?: Pricing[];
}

export class Provider implements IProvider {
    id?: string;
    userId?: string;
    description?: string;
    verified?: boolean | null;

    updateAt?: Date;
    createdAt?: Date;

    diploma?: Diploma[];
    experience?: Experience[];
    pricing?: Pricing[];

    constructor(provider: Provider, diploma?: Diploma[], experience?: Experience[], pricing?: Pricing[]) {
            this.id = provider.id;
            this.userId = provider.userId;
            this.description = provider.description;
            this.verified = provider.verified;
            this.diploma = diploma;
            this.experience = experience;
            this.pricing = pricing;
            this.updateAt = provider.updateAt;
            this.createdAt = new Date();
    }
}


