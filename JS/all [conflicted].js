const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCartList");
let productData = [];
let cartData = [];

function init() {
  getProductList();
  getCartList();
}
init();

//產品列表
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then(function (response) {
      productData = response.data.products;
      renderProductList();
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

function combineProductHTMLItem(item) {
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img
    src="${item.images} "
    alt=""
  />
  <a href="#" class="addCardBtn" data-id="${item.id}" >加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${item.origin_price}</del>
  <p class="nowPrice">NT$${item.price}</p>
  </li>`;
}

function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item);
  });
  productList.innerHTML = str;
}

//篩選產品種類
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }

  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
});

//新增購物車品項
productList.addEventListener("click", function (e) {
  e.preventDefault();
  let addCardBtn = e.target.getAttribute("class");
  if (addCardBtn !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
      Swal.fire({
        title: "加入購物車成功!",
        icon: "success",
      });
      getCartList();
    });
});

// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      const totalPrice = document.querySelector(".js-total");
      totalPrice.textContent = response.data.finalTotal;
      cartData = response.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>${item.product.price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}" > clear </a>
        </td>
      </tr>`;
      });
      cartList.innerHTML = str;
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

//刪除購物車內特定商品
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  Swal.fire({
    title: "確定刪除此項商品嗎?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "確定刪除",
    cancelButtonText: "取消",
  }).then((result) => {
    if (result.isConfirmed) {
      axios
        .delete(
          `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
        )
        .then(function (response) {
          console.log(response.data);
          getCartList();
        });
      Swal.fire({
        title: "刪除成功",
        text: "您已將此商品從購物車中刪除",
        icon: "success",
      });
    }
  });
});

// 清除購物車內全部產品
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  Swal.fire({
    title: "確定要將購物車商品全部清空嗎?",
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
          `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
        )
        .then(function (response) {
          console.log(response.data);
          getCartList();
          Swal.fire({
            title: "刪除成功",
            text: "您已將購物車商品全數刪除",
            icon: "success",
          });
        })
        .catch(function (error) {
          console.error("刪除失敗", error);
          Swal.fire({
            title: "刪除失敗",
            text: "您的購物車內並無商品",
            icon: "error",
          });
        });
    }
  });
});

const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length === 0) {
  }
});

// 送出購買訂單
function createOrder() {
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: "六角學院",
            tel: "07-5313506",
            email: "hexschool@hexschool.com",
            address: "高雄市六角學院路",
            payment: "Apple Pay",
          },
        },
      }
    )
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error.response.data);
    }