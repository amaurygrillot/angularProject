export class Booking {
  id: string;
  userId: string;
  providerId: string;
  date: string;
  pricingId: string;
  updateAt: string;
  createdAt: string;

  constructor(id: string, userId: string, providerId: string, date: string, pricingId: string, updateAt: string, createdAt: string) {
        this.id = id;
        this.userId = userId;
        this.providerId = providerId;
        this.date = date;
        this.pricingId = pricingId;
        this.updateAt = updateAt;
        this.createdAt = createdAt;
      }

}
