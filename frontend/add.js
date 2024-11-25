document.addEventListener("DOMContentLoaded", () => {
    let llcDateInput = document.getElementById("llc-date");
    let shareholdersList = document.getElementById("shareholders-list");
    let addShareholderBtn = document.getElementById("add-shareholder-btn");
    let saveBtn = document.getElementById("save-btn");

    // Set the max date for the date of incorporation to today's date
    llcDateInput.max = new Date().toISOString().split("T")[0];

    let shareholders = [];

    // Add a new shareholder
    addShareholderBtn.addEventListener("click", () => {
        let shareholderDiv = document.createElement("div");
        shareholderDiv.className = "shareholder";

        shareholderDiv.innerHTML = `
            <label>Osaniku tüüp:</label>
            <select class="shareholder-type">
                <option value="natural">Füüsiline isik</option>
                <option value="legal">Juriidiline isik</option>
            </select>
            <div class="shareholder-details">
                <input type="text" class="shareholder-name" placeholder="Nimi (füüsiline või juriidiline isik)" required>
                <input type="text" class="shareholder-id" placeholder="Isikukood / registrikood" required>
            </div>
            <label>Osaniku osa suurus (€) (vähemalt 1):</label>
            <input type="number" class="shareholder-share" min="1" required>
            <button type="button" class="remove-shareholder-btn">Eemalda</button>
        `;

        shareholdersList.appendChild(shareholderDiv);

        // Add event listener to remove shareholder
        let removeBtn = shareholderDiv.querySelector(".remove-shareholder-btn");
        removeBtn.addEventListener("click", () => {
            shareholdersList.removeChild(shareholderDiv);
        });
    });

    // Save the LLC details
    saveBtn.addEventListener("click", async () => {
        let llcName = document.getElementById("llc-name").value.trim();
        let llcCode = document.getElementById("llc-code").value;
        let llcDate = document.getElementById("llc-date").value;
        let llcCapital = parseInt(document.getElementById("llc-capital").value, 10);

        // Collect shareholder details
        shareholders = [];
        let totalShares = 0;
        let shareholderDivs = shareholdersList.getElementsByClassName("shareholder");
        for (let div of shareholderDivs) {

            console.log(div)

            let type = div.querySelector(".shareholder-type").value;
            let name = div.querySelector(".shareholder-name").value.trim();
            let id = div.querySelector(".shareholder-id").value.trim();
            let share = parseInt(div.querySelector(".shareholder-share").value, 10);
            let is_founder = true;

            if (!name || !id || isNaN(share) || share < 1) {
                alert("Palun täitke kõigi osanike andmed õigesti.");
                return;
            }

            shareholders.push({ type, name, id, share, is_founder});
            totalShares += share;
        }

        // Validate inputs
        if (llcName.length < 3 || llcName.length > 100) {
            alert("Osaühingu nimi peab olema 3–100 tähemärgi pikkune.");
            return;
        }
        if (llcCode.length !== 7) {
            alert("Registrikood peab olema 7 numbri pikkune.");
            return;
        }
        if (!llcDate || new Date(llcDate) > new Date()) {
            alert("Valige kehtiv asutamiskuupäev.");
            return;
        }
        if (isNaN(llcCapital) || llcCapital < 2500) {
            alert("Kogukapital peab olema vähemalt 2500 eurot.");
            return;
        }
        if (totalShares !== llcCapital) {
            alert("Osanike osade summa peab võrduma kogukapitaliga.");
            return;
        }

        try {
            // Send data to the backend
            let response = await fetch("http://localhost:5000/llcs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: llcName,
                    registration_code: llcCode,
                    incorporation_date: llcDate,
                    total_capital: llcCapital,
                    shareholders
                })
            });

            if (!response.ok) {
                throw new Error("Osaühingu salvestamine ebaõnnestus.");
            }

            let result = await response.json();
            alert("Osaühing edukalt loodud!");
            window.location.href = `details.html?id=${result.llc_id}`;
        } catch (error) {
            console.error(error);
            alert(`Tekkis viga, proovi hiljem uuesti.`);
        }
    });
});
