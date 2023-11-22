import { placeOrder } from "./apiService";
import { loadStripe } from "@stripe/stripe-js";
import { CardWidget } from "./CardWidget";

export async function initStripe() {
  //   load stripe
  const stripe = await loadStripe(
    "pk_test_51ODomQSJv0vJsn9f0cho474x4rHpExH2OZeij7z3dHj6AokH8ZtBih4OeQsRnFd9fbk7nA1KTbLXUVYxjhdB2LWu00EhOLiR39"
  );                                          // publishable key.....

  let cardElement = null;
  
  // function mountWidget() {
  //   const elements = stripe.elements();

  //   let style = {
  //     base: {
  //       color: "#32325d",
  //       fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  //       fontSmoothing: "antialiased",
  //       fontSize: "16px",
  //       "::placeholder": {
  //         color: "#aab7c4",
  //       },
  //     },
  //     invalid: {
  //       color: "#fa755a",
  //       iconColor: "#fa755a",
  //     },
  //   };

  //   cardElement = elements.create("card", { style, hidePostalCode: true });                          
  //   cardElement.mount("#card-element");                       
  // }

  let paymentType = document.querySelector("#payment_type");             
  
  if(!paymentType) {
    return;
  }

  paymentType.addEventListener("change", (event) => {
    // console.log(event.target.value);                                    

    if (event.target.value === "card") {                    
      // display widget
      // mountWidget();
      cardElement = new CardWidget(stripe);
      cardElement.mount();
    } else {                                         
      cardElement.destroy();
    }
  });

  // ajax call
  const paymentForm = document.querySelector("#payment-form");                          // cart.ejs se form ko access kiya ja ra hai ...
  if (paymentForm) {                                                                   
    paymentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let formData = new FormData(paymentForm);                                         
      // console.log(formData.entries());                                               

      let formObject = {};

      for (let [key, value] of formData.entries()) {                                     
        formObject[key] = value;
        // console.log(key, value);
      }
      // console.log(formObject);


      if(!cardElement){            
        // Ajax call
        placeOrder(formObject);
        // console.log(formObject);
        return;
      }

      const token = await cardElement.createToken();
      // console.log(token.id);
      formObject.stripeToken = token.id;
      placeOrder(formObject);

    //    varify card....
      // stripe.createToken(cardElement).then((result) => {
      //   // console.log(result);                            
      //   formObject.stripeToken = result.token.id;      
      //   placeOrder(formObject);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });   
    });
  }
}
