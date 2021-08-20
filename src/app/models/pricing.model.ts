export interface IPricing {
  id?: string;
  name?: string;
  description?: string;
}

export class Pricing implements IPricing {
  id?: string;
  name?: string;
  description?: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}
