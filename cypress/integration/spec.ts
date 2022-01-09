function numberFromLocaleString(text: string) {
  return parseInt(text.replace(/,/g, ""));
}

Cypress.on("uncaught:exception", () => false); // Removes test-breaking error that has no relation to the current tests.

describe("Sellerfusion dashboard", () => {
  interface CurrentProduct {
    frontEndData: {
      available: number | null;
      transfer: number | null;
      inbound: number | null;
      unfulfillable: number | null;
      researching: number | null;
      fulfilledQuantityTotal: number | null;
      customerDamaged: number | null;
      defective: number | null;
      unfulfilledQuantityTotal: number | null;
    };

    apiData: {
      fulfillable: number | null;
      transfer: number | null;
      inbound_receiving: number | null;
      inbound_shipped: number | null;
      inbound_working: number | null;
      total_researching: number | null;
      customer_damaged: number | null;
      defective: number | null;
    };
  }

  let currentProduct: CurrentProduct = {
    frontEndData: {
      available: null,
      transfer: null,
      inbound: null,
      unfulfillable: null,
      researching: null,
      fulfilledQuantityTotal: null,
      customerDamaged: null,
      defective: null,
      unfulfilledQuantityTotal: null,
    },

    apiData: {
      fulfillable: null,
      transfer: null,
      inbound_receiving: null,
      inbound_shipped: null,
      inbound_working: null,
      customer_damaged: null,
      defective: null,
      total_researching: null,
    },
  };
  let apiData: any[];
  let errors: Error[] = [];

  it("should have the correct Fulfilled Quantity and Unfulfilled Quantity totals for all the products.", () => {
    cy.intercept("/api/products").as("getProducts");
    cy.request("/api/products")
      .its("body")
      .its("data")
      .then((data) => {
        apiData = data; // Saves the list of product data taken from the API in the apiData variable
      });
    cy.visit("/");
    cy.wait("@getProducts"); // Waits for the website to call the API to fill the table with information
    cy.get("tbody > tr > td:nth-child(5) span.MuiChip-label") // Refers to the "FBA" labels in the Inventory column. Can be simplified to .MuiChip-label
      .each(($row, index) => {
        // Get current product data from the API data and put the relevant data in currentProduct.apiData
        cy.wrap(apiData[index]).then(() => {
          const {
            fulfillable,
            transfer,
            inbound_receiving,
            inbound_shipped,
            inbound_working,
            total_researching,
            customer_damaged,
            defective,
          } = apiData[index];
          currentProduct.apiData = {
            fulfillable,
            transfer,
            inbound_receiving,
            inbound_shipped,
            inbound_working,
            total_researching,
            customer_damaged,
            defective,
          };
        });

        cy.wrap($row).trigger("mouseover");

        cy.contains("Amazon Fulfilled Quantity") // Will work because .contains() will automatically retry until the element(s) exist in the DOM
          .parent() // Grabs the "Amazon Fulfilled Quantity" summary
          .within(() => {
            // Gets the Available value from the front end
            cy.contains("Available")
              .getMetricValue()
              .then(($available) => {
                currentProduct.frontEndData.available = numberFromLocaleString(
                  $available.text()
                );
              });
            // Gets the Transfer value from the front end
            cy.contains("Transfer")
              .getMetricValue()
              .then(($transfer) => {
                currentProduct.frontEndData.transfer = numberFromLocaleString(
                  $transfer.text()
                );
              });
            // Gets the Inbound value from the front end
            cy.contains("Inbound")
              .getMetricValue()
              .then(($inbound) => {
                currentProduct.frontEndData.inbound = numberFromLocaleString(
                  $inbound.text()
                );
              });
            // Gets the Unfulfillable value from the front end
            cy.contains("Unfulfillable")
              .getMetricValue()
              .then(($unfulfillable) => {
                currentProduct.frontEndData.unfulfillable =
                  numberFromLocaleString($unfulfillable.text());
              });
            // Gets the Researching value from the front end
            cy.contains("Researching")
              .getMetricValue()
              .then(($researching) => {
                currentProduct.frontEndData.researching =
                  numberFromLocaleString($researching.text());
              });
            // Gets the Fulfilled Quantity Total value from the front end
            cy.contains("Total")
              .getMetricValue()
              .then(($total) => {
                currentProduct.frontEndData.fulfilledQuantityTotal =
                  numberFromLocaleString($total.text());
              });

            // Gets the Customer Damaged value from the front end
            cy.contains("Customer Damaged")
              .getMetricValue()
              .then(($customerDamaged) => {
                currentProduct.frontEndData.customerDamaged =
                  numberFromLocaleString($customerDamaged.text());
              });
            // Gets the Defective value from the front end
            cy.contains("Defective")
              .getMetricValue()
              .then(($defective) => {
                currentProduct.frontEndData.defective = numberFromLocaleString(
                  $defective.text()
                );
              });
            // Gets the Unfulfilled Quantity Total value from the front end
            cy.contains("Defective")
              .parent()
              .parent()
              .nextAll()
              .contains("Total")
              .getMetricValue()
              .then(($total) => {
                currentProduct.frontEndData.unfulfilledQuantityTotal =
                  numberFromLocaleString($total.text());
              });
          })

          .then(() => {
            // Ensure all variables are set to non-null values
            if (
              currentProduct.frontEndData.available === null ||
              currentProduct.frontEndData.transfer === null ||
              currentProduct.frontEndData.inbound === null ||
              currentProduct.frontEndData.unfulfillable === null ||
              currentProduct.frontEndData.researching === null ||
              currentProduct.frontEndData.fulfilledQuantityTotal === null
            )
              throw new Error(
                "At least one variable necessary for calculating and verifying the Fulfilled Quantity total from the front end is missing."
              );

            if (
              currentProduct.frontEndData.customerDamaged === null ||
              currentProduct.frontEndData.defective === null ||
              currentProduct.frontEndData.unfulfilledQuantityTotal === null
            )
              throw new Error(
                "At least one variable necessary for calculating and verifying the Unfulfilled Quantity total from the front end is missing."
              );

            if (
              currentProduct.apiData.fulfillable === null ||
              currentProduct.apiData.transfer === null ||
              currentProduct.apiData.inbound_receiving === null ||
              currentProduct.apiData.inbound_shipped === null ||
              currentProduct.apiData.inbound_working === null ||
              currentProduct.apiData.customer_damaged === null ||
              currentProduct.apiData.defective === null ||
              currentProduct.apiData.total_researching === null
            )
              throw new Error(
                "At least one variable necessary for calculating and verifying the Fulfilled Quantity total from the API is missing."
              );

            // Make calculations
            const calculatedFulfilledQuantityTotal =
              currentProduct.frontEndData.available +
              currentProduct.frontEndData.transfer +
              currentProduct.frontEndData.inbound +
              currentProduct.frontEndData.unfulfillable +
              currentProduct.frontEndData.researching;

            const calculatedUnfulfilledQuantityTotal =
              currentProduct.frontEndData.customerDamaged +
              currentProduct.frontEndData.defective;

            const calculatedApiUnfulfilledQuantityTotal =
              currentProduct.apiData.defective +
              currentProduct.apiData.customer_damaged;

            const calculatedApiFulfilledQuantityTotal =
              currentProduct.apiData.fulfillable +
              currentProduct.apiData.transfer +
              currentProduct.apiData.inbound_receiving +
              currentProduct.apiData.inbound_shipped +
              currentProduct.apiData.inbound_working +
              currentProduct.apiData.total_researching +
              calculatedApiUnfulfilledQuantityTotal;

            try {
              // Checks the Fulfilled Quantity total against calculations from front end data
              assert.equal(
                currentProduct.frontEndData.fulfilledQuantityTotal,
                calculatedFulfilledQuantityTotal,
                "The Fulfilled Quantity total equals the sum of its parts taken from the front end (Available, Transfer, Inbound, Unfulfillable, and Researching)"
              );

              // Checks the Fulfilled Quantity total against calculations from API data
              assert.equal(
                currentProduct.frontEndData.fulfilledQuantityTotal,
                calculatedApiFulfilledQuantityTotal,
                "The Fulfilled Quantity total equals the sum of its parts taken from the API (fulfillable, transfer, inbound_receiving, inbound_shipped, inbound_working, customer_damaged, defective, and total_researching)"
              );

              // Checks the Unfulfilled Quantity total against calculations from front end data
              assert.equal(
                currentProduct.frontEndData.unfulfilledQuantityTotal,
                calculatedUnfulfilledQuantityTotal,
                "The Unfulfilled Quantity total equals the sum of its parts taken from the front end (Customer Damaged and Defective)"
              );

              // Checks the Unfulfilled Quantity total against calculations from API data
              assert.equal(
                currentProduct.frontEndData.unfulfilledQuantityTotal,
                calculatedApiUnfulfilledQuantityTotal,
                "The Unfulfilled Quantity total equals the sum of its parts taken from the API (customer_damaged and defective)"
              );
            } catch (error) {
              errors.push(error as Error);
            }

            // Reset variable values to be ready for the next product
            currentProduct.frontEndData = {
              available: null,
              transfer: null,
              inbound: null,
              unfulfillable: null,
              researching: null,
              fulfilledQuantityTotal: null,
              customerDamaged: null,
              defective: null,
              unfulfilledQuantityTotal: null,
            };

            currentProduct.apiData = {
              fulfillable: null,
              transfer: null,
              inbound_receiving: null,
              inbound_shipped: null,
              inbound_working: null,
              customer_damaged: null,
              defective: null,
              total_researching: null,
            };
          })
          .then(($row) => {
            cy.wrap($row).trigger("mouseout"); // Used to close the Amazon Fulfilled Quantity summary
            cy.wrap($row).should("not.be.visible"); // Ensures that the summary closes before trying to move to the next row
          });
      })
      .then(() => {
        if (errors.length > 0) throw errors;
      });
  });
});
