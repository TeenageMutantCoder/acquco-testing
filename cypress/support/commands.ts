Cypress.Commands.add(
  "getMetricValue",
  { prevSubject: "element" },
  (subject) => {
    return cy.wrap(subject).parent().parent().next().children().children();
  }
);
