const path = require('path');
const puppeteer = require('puppeteer');

/**
 * @typedef {Object} TestResult
 * @property {number} status Status code of the test where 0 means success
 * @property {string} name Name of the test
 * @property {string|null} message Message of the test
 * @property {string|null} stack Stack trace of the test
 */

/**
 * ID of the page element where the test results should be placed after the page loading.
 */
const RESULTS_ELEMENT_ID = '__testharness__results__';

/**
 * Relative path to the test page.
 */
const TESTS_PAGE_PATH = '../test/index.html';

/**
 * Timeout for the tests in milliseconds.
 */
const TESTS_TIMEOUT_MS = 10 * 1000;

(async () => {
    const testPath = path.resolve(__dirname, TESTS_PAGE_PATH);

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });

    const page = await browser.newPage();

    page.on('console', (msg) => {
        console.log(`[browser] ${msg.text()}`);
    });

    page.on('pageerror', (err) => {
        console.error('Page error:', err);
        process.exit(1);
    });

    await page.goto(`file://${testPath}`);

    await page.waitForSelector(`#${RESULTS_ELEMENT_ID}`);

    const res = await page.evaluateHandle((resultsElementId) => {
        /**
         * Gets the names of the failed tests.
         *
         * @param {TestResult[]} tests The array of test results.
         *
         * @returns {string} A string with the names of the failed tests.
         */
        const getFailedTestNamesStr = (tests) => {
            const failedTestNames = [];

            tests.forEach((test) => {
                const { status, name } = test;
                if (status !== 0) {
                    failedTestNames.push(name);
                }
            });

            return failedTestNames.join(', ')
        };

        const results = document.getElementById(resultsElementId);
        if (!results) {
            console.error(`❌ Test results not found on page by id ${resultsElementId}`);
            return;
        }

        let parsedResults;
        try {
            parsedResults = JSON.parse(results.innerHTML);
        } catch (e) {
            console.error('❌ Failed to parse test results:', e);
            return;
        }

        const failedTestNamesStr = getFailedTestNamesStr(parsedResults.tests);

        if (failedTestNamesStr.length > 0) {
            console.error(`❌ Some tests failed: ${getFailedTestNamesStr(parsedResults.tests)}`);
            return false;
        }

        return true;
    }, RESULTS_ELEMENT_ID);

    // Timeout fallback in case tests hang
    setTimeout(async () => {
        console.error('❌ Timeout: Tests did not finish.');
        await page.close();
        await browser.close();
        process.exit(1);
    }, TESTS_TIMEOUT_MS);

    const areTestsOk = await res.jsonValue();

    if (areTestsOk) {
        console.log('✅ All tests are ok');
    } else {
        console.error('❌ Tests failed');
    }

    await page.close();
    await browser.close();

    process.exit(0);
})();
