export interface IPricing {
  id?: string;
  name?: string;
  description?: string;
  type ?: string;
}

export class Pricing implements IPricing {
  id?: string;
  name?: string;
  description?: string;
  type ?: string;

  constructor(id: string, name: string, description: string, type: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.type = type;
  }
}
