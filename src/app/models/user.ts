export class User{
    firstName: string;
    lastName: string;
    mail: string;
    login: string;
    image: string;
  birthdate: string;
  address: string;
  zipcode: string;
  city: string;
  province: string;
  phoneNumber: string;
    providerId: string | undefined;
    constructor(firstName: string, lastName: string, mail: string, login: string,
                image: string, birthdate: string, address: string,
                zipcode: string, city: string, province: string, phoneNumber: string, providerId?: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.mail = mail;
        this.login = login;
        this.image = image;
        this.birthdate = birthdate;
        this.address = address;
        this.zipcode = zipcode;
        this.city = city;
        this.province = province;
        this.phoneNumber = phoneNumber;
        this.providerId = providerId;
      }

}
