import { placeOrder } from "./apiService";
import { loadStripe } from "@stripe/stripe-js";
import { CardWidget } from "./CardWidget";

export async function initStripe() {
  //   load stripe
  const stripe = await loadStripe(
    "pk_test_51ODomQSJv0vJsn9f0cho474x4rHpExH2OZeij7z3dHj6AokH8ZtBih4OeQsRnFd9fbk7nA1KTbLXUVYxjhdB2LWu00EhOLiR39"
  );                                          // Client-Side Authentication: ->  Publishable Key ka istemal hota hai Stripe ke servers se communication ke liye. Jab aap Stripe JavaScript library ka use karte hain apne frontend par, to aapko is key ki zarurat hoti hai taki Stripe aapke website ya app ko authenticate kar sake........ Payment Form Initialization: --> Jab user payment details enter karta hai, to Stripe Publishable Key ka istemal hota hai taki Stripe JavaScript library se ek secure environment create ho sake jisme user apne card details enter kar sake. Yeh details directly aapke servers par nahi jati, balki Stripe ke servers par securely store hoti hain......

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

  //   cardElement = elements.create("card", { style, hidePostalCode: true });                          // elements.create('card') ke andar di gayi 'card' string, stripe.js library ke pre-defined element type ko represent karta hai, aur yeh card element hota hai jo user se payment card details collect karta hai. Iska matlab hai ki aapko specific card element ka selector provide nahi karna padta, kyunki 'card' string hi ek specific element type ko indicate karta hai. Jab aap elements.create('card') ka istemal karte hain, stripe.js library khud hi ek card element create karta hai. Is element ka layout aur behavior Stripe ke design guidelines ke hisab se hota hai.
  //   cardElement.mount("#card-element");                       // Jab aap mount ka istemal karte hain, aapko ek HTML element ka selector provide karna hota hai jismein aap stripe element ko render karna chahte hain. Yani, wo element jahan par aap chahte hain ki card details input field ya card widget dikhe.
  // }

  let paymentType = document.querySelector("#payment_type");             // payment type wale select box ko access kiya hai...
  
  if(!paymentType) {
    return;
  }

  paymentType.addEventListener("change", (event) => {
    // console.log(event.target.value);                                     // apne select field se hame option ki value mil jayegi jo option hum select karte hain.

    if (event.target.value === "card") {                    // agar user card select karta hai tab hi widget mount hoga nahi to cod ke case me use destroy kar diya jayega...
      // display widget
      // mountWidget();
      cardElement = new CardWidget(stripe);
      cardElement.mount();
    } else {                                         // iska matlab hai ki user ne payment ke liye cod select kiya hai ....
      cardElement.destroy();
    }
  });

  // ajax call
  const paymentForm = document.querySelector("#payment-form");                          // cart.ejs se form ko access kiya ja ra hai ...
  if (paymentForm) {                                                                    // jab order kiya hua hoga user ne tab hi order usme eventListener add kiya jayega...
    paymentForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let formData = new FormData(paymentForm);                                         // FormData constructor JavaScript mein form data ko collect aur submit karne ke liye use hota hai. Is constructor ka istemal aksar HTML form elements ke data ko XMLHttpRequest ke sath asynchronous communication ke liye bhejne mein hota hai. Jab aap kisi form ko submit karte hain, form ke data ko FormData object mein collect kiya ja sakta hai, jise aap phir XMLHttpRequest ke sath bhej sakte hain. Yeh constructor form element ke reference ko lekar initialize hota hai.
      // console.log(formData.entries());                                               // ye entries method ek Iterator object return karta hai..

      let formObject = {};

      for (let [key, value] of formData.entries()) {                                     // ye for of loop ye batata hai ki jab hum cart.ejs page me item order karne ke liye mendatory field like phone number aur address denge to ye usme iterate karega aur hame ek object ke roop me return karega jisme hame key value pair ke roop me 2 array milegenge kyuki hum neeche key ko log kar rahe hain..................  entries() method FormData object ke key-value pairs ko iterator ke roop mein pradan karta hai. Har ek pair ek array hai jisme pehla element key (name) hai aur dusra element value (associated value) hai. Yeh method commonly for...of loop ke sath istemal hota hai jisse aap FormData object ke har key-value pair ko ek iterator ke roop mein traverse kar sakein.
        formObject[key] = value;
        // console.log(key, value);
      }
      // console.log(formObject);


      if(!cardElement){             // iska matlab hai ki cardElement available nahi hai means ki null hai...
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
      //   // console.log(result);                            // ye ek token provide karega...jo ki token object ke andar id field me hoga...
      //   formObject.stripeToken = result.token.id;       // formObject ke andar ek stripeToken naame ke key me stripe server dwara bheja gaya token backend server ko send kiya ja ra hai ...
      //   placeOrder(formObject);
      // })
      // .catch((err) => {
      //   console.log(err);
      // });   
    });
  }
}
