export class Booking {
  id: string;
  userId: string;
  providerId: string;
  startDate: string;
  endDate: string;
  pricingId: string;
  price: number;
  updateAt: string;
  createdAt: string;

  constructor(id: string, userId: string, providerId: string, startDate: string, endDate: string,
              pricingId: string, price: number, updateAt: string, createdAt: string) {
        this.id = id;
        this.userId = userId;
        this.providerId = providerId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.pricingId = pricingId;
        this.price = price;
        this.updateAt = updateAt;
        this.createdAt = createdAt;
      }

}
