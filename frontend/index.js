// Function to handle search
async function handleSearch() {
    let name = document.getElementById("company-name").value.trim();
    let registrationCode = document.getElementById("company-code").value.trim();
    let shareholderName = document.getElementById("shareholder-name").value.trim();
    let shareholderCode = document.getElementById("shareholder-code").value.trim();

    let searchCriteria = { name, registrationCode, shareholderName, shareholderCode };
    
    let companies = [];
    let shareholders = [];

    try {
        // Fetch all LLCs from the backend
        let response = await fetch("http://localhost:5000/llcs");
        
        if (!response.ok) {
            throw new Error("Viga osaühingute andmete kättesaamisel.");
        }

        companies = await response.json();
        
    } catch (error) {
        console.error(error)
        alert(`Tekkis viga, proovi hiljem uuesti.`);
    }

    try {
        // Fetch all shareholders from the backend
        let response = await fetch("http://localhost:5000/shareholders");
        
        if (!response.ok) {
            throw new Error("Viga osanike andmete kättesaamisel.");
        }

        shareholders = await response.json();
        
    } catch (error) {
        console.error(error)
        alert(`Tekkis viga, proovi hiljem uuesti.`);
    }
    
    searchCriteria.companyIds = [];
    shareholders.forEach(el => {
        if (!searchCriteria.companyIds.includes(el.llc_id) &&(!searchCriteria.shareholderName || el.name.toLowerCase().includes(searchCriteria.shareholderName.toLowerCase())) &&
        (!searchCriteria.shareholderCode || el.id_number === searchCriteria.shareholderCode)){
            searchCriteria.companyIds.push(el.llc_id);
            
        }
    })

    let results = companies.filter(company => {
        return (
            (!searchCriteria.name || company.name.toLowerCase().includes(searchCriteria.name.toLowerCase())) &&
            (!searchCriteria.registrationCode || company.registration_code === searchCriteria.registrationCode) &&
            (searchCriteria.companyIds.includes(company.id))
        );
    });
    

    let resultsList = document.getElementById("results-list");
    resultsList.innerHTML = "";

    if (results.length === 0) {
        resultsList.innerHTML = "<li>Osaühinguid ei leitud.</li>";
    } else {
        results.forEach(company => {
            let listItem = document.createElement("li");
            listItem.innerHTML = `
                <strong>${company.name}</strong> (registrikood: ${company.registration_code})
                <button type="button" onclick="location.href='details.html?id=${company.id}'">Detailid</button>
            `;
            resultsList.appendChild(listItem);
        });
    }
}

// Attach search handler
document.getElementById("search-btn").addEventListener("click", handleSearch);
