export interface IExperience {
    id?: string;
    providerId?: string;
    startYear: number;
    endYear: number;
    title: string;
    description: string;
}

export class Experience implements IExperience {
    id?: string;
    providerId?: string;
    startYear: number;
    endYear: number;
    title: string;
    description: string;

    constructor(id: string, providerId: string, startYear: number, endYear: number, title: string, description: string) {
        this.id = id;
        this.providerId = providerId;
        this.startYear = startYear;
        this.endYear = endYear;
        this.title = title;
        this.description = description;
    }
}
