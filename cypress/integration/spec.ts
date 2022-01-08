function numberFromLocaleString(text: string) {
  return parseInt(text.replace(/,/g, ""));
}

Cypress.on("uncaught:exception", () => false); // Removes test-breaking error that has no relation to the current tests.

describe("Sellerfusion dashboard", () => {
  let available: number | undefined,
    transfer: number | undefined,
    inbound: number | undefined,
    unfulfillable: number | undefined,
    researching: number | undefined,
    fulfilledQuantityTotal: number | undefined,
    customerDamaged: number | undefined,
    defective: number | undefined,
    unfulfilledQuantityTotal: number | undefined;
  describe("Front End", () => {
    it("should have the correct Fulfilled Quantity and Unfulfilled Quantity totals for all the products.", () => {
      cy.intercept("/api/products").as("getProducts");
      cy.visit("/");
      cy.wait("@getProducts"); // Waits for the website to call the API to fill the table with information
      cy.get("tbody > tr > td:nth-child(5) span.MuiChip-label") // Refers to the "FBA" labels in the Inventory column. Can be simplified to .MuiChip-label
        .each(($row) => {
          available =
            transfer =
            inbound =
            unfulfillable =
            researching =
            fulfilledQuantityTotal =
            customerDamaged =
            defective =
            unfulfilledQuantityTotal =
              undefined;
          cy.wrap($row).trigger("mouseover");
          cy.contains("Amazon Fulfilled Quantity") // Will work because .contains() will automatically retry until the element(s) exist in the DOM
            .parent() // Grabs the "Amazon Fulfilled Quantity" summary
            .within(() => {
              // Gets the Available value
              cy.contains("Available")
                .getMetricValue()
                .then(($available) => {
                  available = numberFromLocaleString($available.text());
                });
              // Gets the Transfer value
              cy.contains("Transfer")
                .getMetricValue()
                .then(($transfer) => {
                  transfer = numberFromLocaleString($transfer.text());
                });
              // Gets the Inbound value
              cy.contains("Inbound")
                .getMetricValue()
                .then(($inbound) => {
                  inbound = numberFromLocaleString($inbound.text());
                });
              // Gets the Unfulfillable value
              cy.contains("Unfulfillable")
                .getMetricValue()
                .then(($unfulfillable) => {
                  unfulfillable = numberFromLocaleString($unfulfillable.text());
                });
              // Gets the Researching value
              cy.contains("Researching")
                .getMetricValue()
                .then(($researching) => {
                  researching = numberFromLocaleString($researching.text());
                });
              // Gets the Fulfilled Quantity Total value
              cy.contains("Total")
                .getMetricValue()
                .then(($total) => {
                  fulfilledQuantityTotal = numberFromLocaleString(
                    $total.text()
                  );
                });

              // Gets the Customer Damaged value
              cy.contains("Customer Damaged")
                .getMetricValue()
                .then(($customerDamaged) => {
                  customerDamaged = numberFromLocaleString(
                    $customerDamaged.text()
                  );
                });
              // Gets the Defective value
              cy.contains("Defective")
                .getMetricValue()
                .then(($defective) => {
                  defective = numberFromLocaleString($defective.text());
                });
              // Gets the Unfulfilled Quantity Total value
              cy.contains("Defective")
                .parent()
                .parent()
                .nextAll()
                .contains("Total")
                .getMetricValue()
                .then(($total) => {
                  unfulfilledQuantityTotal = numberFromLocaleString(
                    $total.text()
                  );
                });
            })

            .then(() => {
              if (
                typeof available === "undefined" ||
                typeof transfer === "undefined" ||
                typeof inbound === "undefined" ||
                typeof unfulfillable === "undefined" ||
                typeof researching === "undefined" ||
                typeof fulfilledQuantityTotal === "undefined"
              )
                throw new Error(
                  "At least one variable necessary for calculating and verifying the Fulfilled Quantity total was never defined."
                );

              const calculatedFulfilledQuantityTotal =
                available + transfer + inbound + unfulfillable + researching;
              assert.equal(
                fulfilledQuantityTotal,
                calculatedFulfilledQuantityTotal,
                "The Fulfilled Quantity total equals the sum of its parts (available, transfer, inbound, unfulfillable, and researching)."
              );

              if (
                typeof customerDamaged === "undefined" ||
                typeof defective === "undefined" ||
                typeof unfulfilledQuantityTotal === "undefined"
              )
                throw new Error(
                  "At least one variable necessary for calculating and verifying the Unfulfilled Quantity total was never defined."
                );

              const calculatedUnfulfilledQuantityTotal =
                customerDamaged + defective;
              assert.equal(
                unfulfilledQuantityTotal,
                calculatedUnfulfilledQuantityTotal,
                "The Unfulfilled Quantity total equals the sum of its parts (customer damaged and defective)."
              );

              // Reset variable values
              available =
                transfer =
                inbound =
                unfulfillable =
                researching =
                fulfilledQuantityTotal =
                customerDamaged =
                defective =
                unfulfilledQuantityTotal =
                  undefined;
            })
            .then(($row) => {
              cy.wrap($row).trigger("mouseout"); // Used to close the Amazon Fulfilled Quantity summary
              cy.wait(100); // Ensures that the summary closes before anything else happens
            });
        });
    });
  });
});
