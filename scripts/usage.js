async function generatePix() {
    const pixData = {
        pixKey: document.getElementById("pixKey").value,
        value: document.getElementById("value").value,
        name: document.getElementById("name").value,
        city: document.getElementById("city").value,
        additionalInfo: document.getElementById("additionalInfo").value
    };

    const response = await fetch("apipixqrcode-production.up.railway.app/qrcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pixData)
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById("pixCode").textContent = data.pixCode;
        document.getElementById("qrcode").src = data.qrcode;
    } else {
        alert("Erro ao gerar QR Code");
    }
}