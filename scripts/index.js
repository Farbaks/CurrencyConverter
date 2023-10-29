class CurrencyConverter {
    countryList = [];

    selectedSourceCountry = null;
    sourceCurrencyValueEl = document.getElementById("sourceCurrencyValue");
    sourceCurrencyEl = document.getElementById("sourceCurrency");
    sourceCurrencyFlagEl = document.getElementById("sourceCurrencyFlag");
    sourceCurrencyCodeEl = document.getElementById("sourceCurrencyCode");
    sourceCurrencyRates = [];

    selectedDestinationCountry = null;
    destinationCurrencyEl = document.getElementById("destinationCurrency");
    destinationCurrencyFlagEl = document.getElementById("destinationCurrencyFlag");
    destinationCurrencyCodeEl = document.getElementById("destinationCurrencyCode");
    destinationCurrencyValueEl = document.getElementById("destinationCurrencyValue");
    destinationCurrencyRate = null;

    constructor() {
        this.fetchCountryList();
        this.setupEventListeners();
    }

    async fetchCountryList() {
        let result = await fetch('/assets/json/countries.json');
        this.countryList = await result.json();

        this.loadCountriesIntoDropdown();
    }

    async loadCountriesIntoDropdown() {
        const template = this.countryList.map(item => `<option value="${item.name}">${item.name} - ${item.currency}</option>`).join('');

        this.sourceCurrencyEl.innerHTML = template;
        this.destinationCurrencyEl.innerHTML = template;

        // Select default countries
        this.sourceCurrencyEl.value = 'United Kingdom';
        await this.selectCountry(this.sourceCurrencyEl.value, 'source', 1);

        this.destinationCurrencyEl.value = 'Nigeria';
        this.selectCountry(this.destinationCurrencyEl.value, 'destination');
    }

    async selectCountry(name, type, value = null) {
        let country = this.countryList.find((item) => item.name == name);
        if (!country) return;

        this.loadCountryDetails(country, type);

        if (type == 'source') {
            this.selectedSourceCountry = country;
            await this.fetchSourceCountryRates();
        }
        else {
            this.selectedDestinationCountry = country;
            this.fetchDestinationCountryRates();
        }

        if (type === 'source' && value !== null) {
            this.sourceCurrencyValueEl.value = value;
        }
    }

    loadCountryDetails(country, type) {
        const currencyCodeEl = type === 'source' ? this.sourceCurrencyCodeEl : this.destinationCurrencyCodeEl;
        const currencyFlagEl = type === 'source' ? this.sourceCurrencyFlagEl : this.destinationCurrencyFlagEl;

        currencyCodeEl.innerText = country.currency;
        currencyFlagEl.src = country.flag;
        currencyFlagEl.alt = country.flagAlt;
    }

    async fetchSourceCountryRates() {
        let result = await fetch(`https://www.floatrates.com/daily/${this.selectedSourceCountry.currency}.json`);
        this.sourceCurrencyRates = await result.json();
    }

    fetchDestinationCountryRates() {
        this.destinationCurrencyRate = this.sourceCurrencyRates[this.selectedDestinationCountry.currency.toLowerCase()];
        this.loadConversionRatesDetails();
        this.calculateExchangeRate('source');
    }

    loadConversionRatesDetails() {
        document.getElementById('sourceCurrencyConversion').innerText = this.selectedSourceCountry.currency;
        document.getElementById('conversionValue').innerText = this.destinationCurrencyRate.inverseRate.toFixed(3);
        document.getElementById('destinationCurrencyConversion').innerText = this.selectedDestinationCountry.currency;

        var inputDate = new Date(this.destinationCurrencyRate.date);
        var ukDateString = new Date(inputDate.toLocaleString("en-US", { timeZone: "Europe/London" })).toLocaleString();
        document.getElementById('timestamp').innerText = ukDateString;
    }

    calculateExchangeRate(type) {
        if (type == 'source') {
            this.destinationCurrencyValueEl.value = (this.sourceCurrencyValueEl.value * this.destinationCurrencyRate.rate).toFixed(3);
            return;
        }

        this.sourceCurrencyValueEl.value = (this.destinationCurrencyValueEl.value * this.destinationCurrencyRate.inverseRate).toFixed(3);
    }

    setupEventListeners() {
        // event listeners for the inputs
        this.sourceCurrencyValueEl.addEventListener("input", () => this.calculateExchangeRate('source'));
        this.destinationCurrencyValueEl.addEventListener("input", () => this.calculateExchangeRate('destination'));

        // event listeners for the dropdowns
        this.sourceCurrencyEl.addEventListener("change", async () => {
            await this.selectCountry(this.sourceCurrencyEl.value, 'source');
            this.selectCountry(this.destinationCurrencyEl.value, 'destination');
        });

        this.destinationCurrencyEl.addEventListener("change", () => {
            this.selectCountry(this.destinationCurrencyEl.value, 'destination');
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new CurrencyConverter();
});