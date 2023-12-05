const orderList = document.querySelector(".js-orderList");
let orderData = [];

function init() {
  getOrderList();
}
init();

//C3圖表
function renderC3() {
  //物件資料蒐集
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });

  let categoryAry = Object.keys(total);
  let newData = [];
  categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
    console.log(total);
  });

  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
  });
}

// 取得訂單列表
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      orderData = response.data.orders;

      let str = "";
      orderData.forEach(function (item) {
        //組時間字串
        const timeStamp = new Date(item.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()}/${
          timeStamp.getMonth() + 1
        }/${timeStamp.getDate()}`;

        //組產品字串
        let productStr = "";
        item.products.forEach(function (productItem) {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });
        //訂單處理狀態
        let orderStatus = "";
        if (item.paid) {
          orderStatus = "已處理";
        } else {
          orderStatus = "未處理";
        }

        //組訂單字串
        str += `<tr>
        <td>${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productStr}
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" data-status="${item.paid}" class="js-orderStatus" data-id="${item.id}">${orderStatus}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除" />
        </td>
      </tr>`;
      });
      orderList.innerHTML = str;
      renderC3();
    });
}

//監聽刪除/修改訂單資料
orderList.addEventListener("click", function (e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    Swal.fire({
      title: "確定刪除此筆訂單嗎?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteOrderItem(id);
        Swal.fire({
          title: "刪除成功",
          text: "您已將此筆訂單刪除",
          icon: "success",
        });
      }
    });
    return;
  }
  if (targetClass == "js-orderStatus") {
    let status = e.target.getAttribute("data-status");
    Swal.fire({
      title: "確定更改訂單狀態?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "確定",
      cancelButtonText: "取消",
    }).then((result) => {
      if (result.isConfirmed) {
        editOrderList(status, id);
        Swal.fire({
          title: "更改成功",
          text: "訂單狀態已變更",
          icon: "success",
        });
      }
    });

    return;
  }
});

// 修改訂單狀態
function editOrderList(status, id) {
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }
  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        data: {
          id: id,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {});
  getOrderList();
}

// 刪除特定訂單
function deleteOrderItem(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    )
    .then(function (response) {
      getOrderList();
    });
}

// 刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  Swal.fire({
    title: "確定要將所有訂單刪除嗎?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(
          `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then(function (response) {
          console.log(response.data);
          getOrderList();
          Swal.fire({
            title: "刪除成功",
            text: "您已將訂單全部清除",
            icon: "success",
          });
        })
        .catch(function (error) {
          console.error("刪除失敗", error);
          Swal.fire({
            title: "刪除失敗",
            text: "已無訂單可刪除",
            icon: "error",
          });
        });
    }
  });
});
