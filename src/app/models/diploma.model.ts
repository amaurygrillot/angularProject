export interface IDiploma {
    id?: string;
    providerId?: string;
    filename?: string;
    fileImage?: string;
}

export class Diploma implements IDiploma {
    id?: string;
    providerId?: string;
    filename?: string;
    fileImage?: string;

    constructor(id: string, providerId: string, filename: string, fileImage?: string) {
        this.id = id;
        this.providerId = providerId;
        this.filename = filename;
        this.fileImage = fileImage;
    }
}
