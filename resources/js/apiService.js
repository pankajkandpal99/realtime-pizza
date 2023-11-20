import axios from "axios";
import toastr from "toastr";

export function placeOrder(formObject) {
  axios
    .post("/orders", formObject)
    .then((res) => {
      toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 1000,
        closeButton: true,
      };

      toastr.success(res.data.message);

      setTimeout(() => {
        window.location.href = "/customer/orders";
      }, 1000);
    })
    .catch((err) => {
      toastr.options = {
        positionClass: "toast-top-right",
        timeOut: 1000,
        closeButton: true,
      };

      toastr.error(err.res.data.message);
    });
}
