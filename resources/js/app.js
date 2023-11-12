import axios from "axios";
import toastr from "toastr";
import initAdmin from './admin';

let addToCart = document.querySelectorAll(".add-to-cart");
let cartcounter = document.querySelector("#cart-counter");

const updateCart = (pizza) => {
  axios
    .post("/update-cart", pizza)
    .then((res) => {
      // console.log(res);
      cartcounter.innerText = res.data.totalQty;

      toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 1000, // Disappear after 1 seconds
        // progressBar: true,
        closeButton: true, // Show close button
      };

      toastr.success("Item added to your cart.");
    }) // Server ki taraf se bheje gaye JSON response ko client-side code (app.js) means isi file me axios ke then block me access kiya ja sakta hai. Yani, jab server se response aata hai, tab then block me res variable ke andar yeh response store ho jata hai.
    .catch((err) => {
      toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 1000, // Disappear after 2 seconds
        progressBar: true,
        closeButton: true, // Show close button
      };

      toastr.error("Something went wrong");
      console.log(err.message);
    });
};

addToCart.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    let pizza = JSON.parse(btn.dataset.pizza); // dataset.pizza HTML element ke data-pizza attribute se associated data ko represent karta hai. Is data ko JavaScript me retrieve karke aap us data ka use kar sakte hain. jisme 'dataset' ek JavaScript object hai jo HTML element ke data-* attributes se associated data ko hold karta hai aur  "pizza" ek arbitrary attribute name hai jo aapne choose kiya hai, aur isme custom data, jaise JSON string, store kiya jata hai.
    updateCart(pizza);
  });
});

// order place hone ke baad green color wale success msg ko 2 second baad remove kr dena...
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

// for Admin only....
initAdmin();