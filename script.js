document.addEventListener("DOMContentLoaded", function () {
    loadMenuItems();
    setupPayBillButton();
    updateOrderDisplay();
    setupModal();
});

function loadMenuItems() {
    fetch("menu.json")
        .then((response) => response.json())
        .then((menuItems) => {
            const menuContainer = document.querySelector(".menu");
            menuContainer.innerHTML = "";

            menuItems.forEach((item) => {
                const menuItemElement = document.createElement("div");
                menuItemElement.classList.add("menu-item");
                menuItemElement.innerHTML = `
                    <img src="${item.imgSrc}" alt="${item.name}" />
                    <h2>${item.name}</h2>
                    <p>฿${item.price.toFixed(2)}</p>
                `;

                menuContainer.appendChild(menuItemElement);

                menuItemElement.addEventListener("click", () => {
                    let orders = JSON.parse(localStorage.getItem("customerOrders")) || [];
                    const existingOrderIndex = orders.findIndex(
                        (order) => order.name === item.name
                    );

                    if (existingOrderIndex > -1) {
                        orders[existingOrderIndex].quantity += 1;
                    } else {
                        orders.push({ name: item.name, price: item.price, quantity: 1 });
                    }
                    localStorage.setItem("customerOrders", JSON.stringify(orders));
                    updateOrderDisplay(); // อัปเดตรายการอาหารทันทีหลังจากคลิกเพื่อเพิ่มรายการอาหาร
                });
            });
        })
        .catch((error) => console.error("Error loading menu items:", error));
}

function updateOrderDisplay() {
    const ordersPanel = document.querySelector(".orders-panel");
    const ordersList = document.getElementById("order-list");
    const totalCostElement = document.getElementById("total-cost");
    let totalCost = 0;

    let orders = JSON.parse(localStorage.getItem("customerOrders")) || [];

    ordersList.innerHTML = "";

    orders.forEach((order, index) => {
        const li = document.createElement("li");
        const itemTotalPrice = (order.price * order.quantity).toFixed(2);
        li.innerHTML = `
            ${order.name} - Quantity: ${order.quantity} - Price: ฿${itemTotalPrice}
            <button class="remove-item-btn" data-index="${index}">ลบ</button>
        `;
        ordersList.appendChild(li);

        totalCost += order.price * order.quantity;
    });

    totalCostElement.textContent = `Total Price: ฿${totalCost.toFixed(2)}`;
    totalCostElement.dataset.totalCost = totalCost.toFixed(2); // เก็บราคารวมใน data attribute

    if (orders.length > 0) {
        ordersPanel.classList.remove("hidden");
    } else {
        ordersPanel.classList.add("hidden");
    }

    // เพิ่ม Event Listener สำหรับปุ่มลบ
    const removeButtons = document.querySelectorAll(".remove-item-btn");
    removeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const index = this.dataset.index;
            removeOrderItem(index);
        });
    });
}

function removeOrderItem(index) {
    let orders = JSON.parse(localStorage.getItem("customerOrders")) || [];
    orders.splice(index, 1); // ลบรายการตามดัชนีที่ระบุ
    localStorage.setItem("customerOrders", JSON.stringify(orders));
    updateOrderDisplay(); // อัปเดตรายการสั่งซื้อ
}

function setupPayBillButton() {
    document
        .getElementById("pay-bill-btn")
        .addEventListener("click", function () {
            const totalCostElement = document.getElementById("total-cost");
            const totalCost = totalCostElement.dataset.totalCost || "0.00";

            // แสดงโมดอล
            const modal = document.getElementById("confirmation-modal");
            const confirmMessage = document.getElementById("confirm-message");
            confirmMessage.textContent = `Total Price: ฿${totalCost}`;

            modal.style.display = "block";
        });
}

function setupModal() {
    const modal = document.getElementById("confirmation-modal");
    const closeModalButton = document.getElementById("close-modal");
    const confirmOrderButton = document.getElementById("confirm-order-btn");
    const cancelOrderButton = document.getElementById("cancel-order-btn");

    // ปิดโมดอลเมื่อคลิกปุ่มปิด
    closeModalButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // ปิดโมดอลเมื่อคลิกปุ่มยกเลิก
    cancelOrderButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // ยืนยันคำสั่งซื้อ
    confirmOrderButton.addEventListener("click", () => {
        const totalCostElement = document.getElementById("total-cost");
        const totalCost = totalCostElement.dataset.totalCost || "0.00";

        alert(`Billing Success!\nTotal Price: ฿${totalCost}\nThank ypu for your order!`);

        // ล้างรายการสั่งซื้อ
        localStorage.removeItem("customerOrders");
        updateOrderDisplay();

        // ปิดโมดอล
        modal.style.display = "none";
    });

    // ปิดโมดอลเมื่อคลิกนอกเนื้อหาโมดอล
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}
