export interface IDiploma {
    id?: string;
    providerId?: string;
    filename?: string;
    filePath?: string;
}

export class Diploma implements IDiploma {
    id?: string;
    providerId?: string;
    filename?: string;
    filePath?: string;

    constructor(id: string, providerId: string, filename: string, filePath?: string) {
        this.id = id;
        this.providerId = providerId;
        this.filename = filename;
        this.filePath = filePath;
    }
}
