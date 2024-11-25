document.addEventListener("DOMContentLoaded", async () => {
    let llcId = new URLSearchParams(window.location.search).get("id");
    let llcDetailsDiv = document.getElementById("llc-details");

    try {
        // Fetch LLC details from the backend
        let response = await fetch(`http://localhost:5000/llcs/${llcId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch LLC details.");
        }

        let llc = await response.json();

        // Populate LLC details
        document.getElementById("llc-name").innerHTML  = llc.name;
        document.getElementById("llc-registration-code").innerHTML = llc.registration_code;
        document.getElementById("llc-date").innerHTML = llc.incorporation_date;
        document.getElementById("llc-capital").innerHTML = llc.total_capital;
        document.getElementById("shareholders-list").innerHTML = llc.shareholders.map(
            shareholder => 
                `<li>
                    <strong>${shareholder.type === "natural" ? "Füüsiline isik" : "Juriidiline isik"}:</strong> ${shareholder.name} 
                    (${shareholder.id_number})<br>
                    <strong>Osaniku osa suurus (€):</strong> ${shareholder.share}<br>
                    <strong>Asutaja:</strong> ${shareholder.is_founder ? "Jah" : "Ei"}
                </li>`
            ).join("");

    } catch (error) {
        console.error(error)
        llcDetailsDiv.innerHTML = `<p>Tekkis viga, proovi hiljem uuesti.</p>`;
    }
});
