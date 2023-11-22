import axios from "axios";
import toastr from "toastr";
import moment from "moment";
import initAdmin from "./admin";
import { initStripe } from "./stripe";

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
    }) 
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
    let pizza = JSON.parse(btn.dataset.pizza); 
    updateCart(pizza);
  });
});


const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 2000);
}

// change order status.... file -- singleOrder.ejs....
let statuses = document.querySelectorAll(".status_line");
// console.log(statuses);

let hiddenInput = document.querySelector("#hidden-input");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
// console.log(order);
let time = document.createElement("small"); 

// We need to render updated status....
function updatedStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });

  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }

    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);

      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updatedStatus(order);
initStripe()


// Socket...
let socket = io();
// join
if (order) {
  socket.emit("join", `order_${order._id}`); 
}

let adminAreaPath = window.location.pathname;
// console.log(adminAreaPath);
if (adminAreaPath.includes("admin")) {
  initAdmin(socket);
  socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (data) => {
  
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  // console.log(data);
  updatedStatus(updatedOrder);
  toastr.options = {
    positionClass: "toast-top-right",
    timeOut: 1000, // Disappear after 1 seconds
    // progressBar: true,
    closeButton: true, // Show close button
  };

  toastr.success("Order updated.");
});
