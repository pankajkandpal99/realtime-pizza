// This is the javascript file of our client-side....
import moment from "moment/moment";
import toastr from "toastr";
// import axios from "axios";

async function initAdmin(socket) {
  const orderTableBody = document.querySelector("#orderTableBody");
  let orders = [];
  let markup;
  // console.log("Before fetch");
  try {
    const response = await fetch("/admin/orders", {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    // console.log("Response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    orders = await response.json();
    markup = generateMarkup(orders);
    orderTableBody.innerHTML = markup;
    // console.log("orders:", orders);
  } catch (err) {
    console.error(err.message);
  }

  function renderItems(items) {
    let parsedItems = Object.values(items);
    return parsedItems
      .map((menuItem) => {
        return `<p>${menuItem.item.name} - ${menuItem.qty} pcs </p>`; // menueItem means items array ke andar available objectId. aur uss objetcId ke andar ke item aur fir uske andar name ko access karna...
      })
      .join(""); 
  }

  function generateMarkup(orders) {
    return orders
      .map((order) => {
        return `
        <tr>
          <td class="border px-4 py-2 text-green-900">
            <p>${order._id}</p>
            <div> ${renderItems(order.items)} </div>
          </td>
          <td class="border px-4 py-2"> ${order.customerId.name} </td>
          <td class="border px-4 py-2">${order.address}</td>
          <td class="border px-4 py-2">
            <div class="inline-block relative w-64">
              <form action="/admin/order/status" method="POST">
                <input type="hidden" name="orderId" value="${order._id}" />
                <select name="status" onchange="this.form.submit()" class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 shadow leading-tight focus:outline-none focus:shadow-outline">
                    <option value="order_placed" ${
                      order.status === "order-placed" ? "selected" : ""
                    }>Placed</option>
                    <option value="confirmed" ${
                      order.status === "confirmed" ? "selected" : ""
                    }>Confirmed</option>
                    <option value="prepared" ${
                      order.status === "prepared" ? "selected" : ""
                    }>Prepared</option>
                    <option value="delivered" ${
                      order.status === "delivered" ? "selected" : ""
                    }> Delivered</option>
                    <option value="completed" ${
                      order.status === "completed" ? "selected" : ""
                    }>Completed</option>
                </select>
              </form>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </td>
          <td class="border px-4 py-2">
            ${moment(order.createdAt).format("hh:mm A")}
          </td>
          <td class="border px-4 py-2">
            ${ order.paymentStatus ? 'Paid' : 'Not Paid' }
          </td>
        </tr>
      `;
      })
      .join("");
  }

  socket.on('orderPlaced', (order) => {
    toastr.options = {
      positionClass: "toast-top-right",
      timeOut: 1000, // Disappear after 1 seconds
      progressBar: false,
      closeButton: true, // Show close button
    };
  
    toastr.success("New Order.");

    orders.unshift(order)                         // admin panel me orders ko top per add karna...
    orderTableBody.innerHTML = '';
    orderTableBody.innerHTML = generateMarkup(orders);
  });
}

export default initAdmin;