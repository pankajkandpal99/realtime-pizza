export class CardWidget {
  stripe = null;
  cardElement = null;

  style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  };

  constructor(stripe) {
    this.stripe = stripe;
  }

  mount() {
    const elements = this.stripe.elements();
    this.cardElement = elements.create("card", { style: this.style, hidePostalCode: true }); // elements.create('card') ke andar di gayi 'card' string, stripe.js library ke pre-defined element type ko represent karta hai, aur yeh card element hota hai jo user se payment card details collect karta hai. Iska matlab hai ki aapko specific card element ka selector provide nahi karna padta, kyunki 'card' string hi ek specific element type ko indicate karta hai. Jab aap elements.create('card') ka istemal karte hain, stripe.js library khud hi ek card element create karta hai. Is element ka layout aur behavior Stripe ke design guidelines ke hisab se hota hai.
    this.cardElement.mount("#card-element");
  }

  destroy() {
    this.cardElement.destroy();
  }

  async createToken() {
    try {
      const result = await this.stripe.createToken(this.cardElement);
      if (!result) {
        console.log("Error while you are creating token.");
        return res.status(422).json({ message: "Token creation issue.." });
      }

      // console.log(result);
      return result.token;

    } catch (err) {
      console.log(err);
    }

    // this.stripe
    //   .createToken(this.cardElement)
    //   .then((result) => {
    //     // console.log(result);                                                     
    //     formObject.stripeToken = result.token.id;                                  
    //     placeOrder(formObject);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }
}
