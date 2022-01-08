import "./commands";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select the value text of a given metric. Must be chained off of the text of the metric label.
       * @example cy.contains("Total").getMetricValueFromLabelText()
       */
      getMetricValue(): Chainable<JQuery<HTMLElement>>;
    }
  }
}
