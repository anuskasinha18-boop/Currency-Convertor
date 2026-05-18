const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".select-container select");
const btn = document.querySelector(".convert-btn");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msgRate = document.querySelector(".msg-rate");
const finalAmt = document.querySelector(".final-amt");
const finalCurrText = document.querySelector(".final-curr");
const amountInput = document.querySelector(".amount-input");
const swapIcon = document.querySelector(".swap-icon");

// Quick Rate Elements
const quickRates = document.querySelectorAll(".quick-rate");
const quickPairs = ['usd', 'jpy', 'eur', 'lvl']; // INR to these

for (let select of dropdowns) {
    for (currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }

    select.addEventListener("change", (evt) => {
        updateFlag(evt.target);
    });
}

const updateExchangeRate = async () => {
    let amtVal = amountInput.value;
    if (amtVal === "" || amtVal < 1) {
        amtVal = 1;
        amountInput.value = "1";
    }

    // UI Loading state
    btn.innerText = "Converting...";
    btn.disabled = true;
    msgRate.innerText = "Fetching rate...";

    try {
        const URL = `${BASE_URL}/${fromCurr.value.toLowerCase()}.json`;
        let response = await fetch(URL);
        let data = await response.json();
        let fromCode = fromCurr.value.toLowerCase();
        let toCode = toCurr.value.toLowerCase();

        let rate = data[fromCode][toCode];
        let finalAmount = amtVal * rate;

        msgRate.innerText = `1 ${fromCurr.value} = ${rate.toFixed(4)} ${toCurr.value}`;

        // Formatting final amount for large numbers
        if (finalAmount > 100) {
            finalAmt.innerText = finalAmount.toFixed(2);
        } else {
            finalAmt.innerText = finalAmount.toFixed(4);
        }

        finalCurrText.innerText = toCurr.value;

        // Update quick rates (Assuming base is INR, since our cards are INR/USD etc)
        // If fromCode is INR, we already have the data
        if (fromCode === 'inr') {
            updateQuickRates(data['inr']);
        } else {
            // fetch INR rates for quick cards
            const inrURL = `${BASE_URL}/inr.json`;
            let inrRes = await fetch(inrURL);
            let inrData = await inrRes.json();
            updateQuickRates(inrData['inr']);
        }

    } catch (err) {
        console.error("Failed to fetch exchange rate", err);
        msgRate.innerText = "Error fetching rate. Try again.";
        finalAmt.innerText = "--";
    } finally {
        btn.innerText = "Convert Now";
        btn.disabled = false;
    }
};

const updateQuickRates = (inrRates) => {
    quickRates.forEach((card, idx) => {
        let pair = quickPairs[idx];
        let rate = inrRates[pair];
        let valEl = card.querySelector(".quick-val");
        if (rate) {
            valEl.innerText = rate > 100 ? rate.toFixed(1) : rate.toFixed(4);
        }
    });
};

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    if (img) {
        img.src = newSrc;
    }
};

const swapCurrencies = () => {
    // Swap values
    let tempValue = fromCurr.value;
    fromCurr.value = toCurr.value;
    toCurr.value = tempValue;

    // Update flags
    updateFlag(fromCurr);
    updateFlag(toCurr);

    // Update rates
    updateExchangeRate();
};

swapIcon.addEventListener("click", swapCurrencies);

btn.addEventListener("click", (evt) => {
    evt.preventDefault();
    updateExchangeRate();
});

window.addEventListener("load", () => {
    updateExchangeRate();
});