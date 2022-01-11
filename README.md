# acquco-testing

This is my solution to the take-home project from Acquco for their Full Stack Engineer - QA Test Engineer role. The details of the project are in the [qa-task.pdf](qa-task.pdf) file.

The documents for step 1 are [qa-strategy.pdf](qa-strategy.pdf) and [qa-plan.pdf](qa-plan.pdf)

The document for step 2 is [automatable-tests.pdf](automatable-tests.pdf)

The test script for step 3 is in [cypress/integration/spec.ts](cypress/integration/spec.ts), and there is a custom command in [cypress/support/commands.ts](cypress/support/commands.ts) (its Cypress type declarations are in [cypress/support/index.ts](cypress/support/index.ts)).

## How to Run

1. Open a terminal or command prompt
2. Clone the repository with `git clone https://github.com/TeenageMutantCoder/acquco-testing.git`
3. Change directories into the repository folder with `cd acquco-testing`
4. Install dependencies with `npm install`
5. Open the Cypress window with `npm run cy:open` (if you want to run the test headlessly, you can use the command `npm run cy:run` instead and skip the rest of the steps)
6. Select the "spec.ts" file in the Integration Tests section using the Cypress GUI
