const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  await page.goto('https://cgd-platform.vercel.app/#/officer/cash-payment', { waitUntil: 'networkidle', timeout: 20000 });
  const title = await page.title();
  const loginForm = await page.$('.login-card').catch(() => null);
  console.log('PAGE_TITLE=' + title);
  console.log('HAS_LOGIN=' + !!loginForm);

  if (loginForm) {
    await page.fill('input[placeholder="name@gasonet.in"]', 'priya.sharma@gasonet.in');
    await page.fill('input[type="password"]', 'gasonet123');
    await page.click('button.btn-lg');
    await page.waitForTimeout(3000);
    const alertWarn = await page.$('.alert-warn');
    const alertText = alertWarn ? await alertWarn.innerText() : '';
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => '');
    console.log('LOGIN_ERROR=' + alertText);
    console.log('H1_AFTER_LOGIN=' + h1);
  }

  await page.goto('https://cgd-platform.vercel.app/#/officer/cash-payment', { waitUntil: 'networkidle', timeout: 10000 });
  await page.waitForTimeout(1000);
  const h1Cash = await page.$eval('h1', el => el.textContent).catch(() => '');
  const pngInput = await page.$('input[placeholder*="PNG"]').catch(() => null);
  console.log('H1_CASH_PAGE=' + h1Cash);
  console.log('HAS_PNG_INPUT=' + !!pngInput);

  if (pngInput) {
    await page.fill('input[placeholder*="PNG"]', 'PNG-2026-000412');
    await page.waitForTimeout(500);
    const customerCard = await page.$('.card-b').catch(() => null);
    const custText = customerCard ? await customerCard.innerText() : '';
    console.log('CUSTOMER_CARD=' + custText.replace(/\n/g, ' | '));
    const amtInput = await page.$('input[placeholder="0"]');
    if (amtInput) { await page.fill('input[placeholder="0"]', '500'); await page.waitForTimeout(300); }
    const collectBtn = await page.$('button.btn-green');
    const btnDisabled = collectBtn ? await collectBtn.getAttribute('disabled') : 'no-btn';
    console.log('COLLECT_BTN_DISABLED=' + btnDisabled);
  }

  if (errors.length) console.log('JS_ERRORS=' + JSON.stringify(errors));
  await browser.close();
})();
