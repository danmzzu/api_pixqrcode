async function generatePix() {
    try {
        const pixKey = document.getElementById("pixKey")?.value.trim();
        const value = parseFloat(document.getElementById("value")?.value) || 0;
        const name = document.getElementById("name")?.value.trim();
        const city = document.getElementById("city")?.value.trim();
        const additionalInfo = document.getElementById("additionalInfo")?.value.trim();
        
        if (!pixKey || !value || !name || !city) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const pixData = { pixKey, value, name, city, additionalInfo };

        const response = await fetch("https://apipixqrcode-production.up.railway.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pixData)
        });

        if (!response.ok) {
            throw new Error("Erro ao gerar QR Code");
        }

        const data = await response.json();

        document.getElementById("pixCode").textContent = data.pixCode || "Código não disponível";
        document.getElementById("qrcode").src = data.qrcode || "";

    } catch (error) {
        console.error("Erro:", error);
        alert(error.message || "Ocorreu um erro ao gerar o QR Code.");
    }
}
