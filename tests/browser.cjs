const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png'})[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, channel:process.env.BROWSER_CHANNEL || "msedge"});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}/`;
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto(url);
      await page.waitForSelector('.menu-item');
      await page.locator('.menu-item-image').evaluateAll(images => Promise.all(images.map(image => { image.loading = "eager"; return image.decode(); })));
      assert(await page.locator('.menu-item-image').evaluateAll(images => images.every(image => image.naturalWidth > 0)));
      assert.equal(await page.locator('.menu-item').count(),14);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const small = await page.locator('button:visible, .category-nav-button').evaluateAll(nodes => nodes.filter(n => { const r=n.getBoundingClientRect(); return r.width<44 || r.height<44; }).map(n=>n.className));
      assert.deepEqual(small,[]);
    }
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('#store-name').innerText(),'Marichef_Cafe');
    assert.equal(await page.locator('[data-item-id="d009"] .menu-item-price').innerText(),'$3.00');
    assert.equal(await page.locator('[data-item-id="d010"] .menu-item-price').innerText(),'$3.00');
    assert(await page.locator('[data-item-id="d010"] .add-button').isEnabled());
    for (const id of ['p001','p002','p003','f001','f002','f003']) {
      assert.equal(await page.locator('[data-item-id="'+id+'"] .menu-item-price').innerText(),'$3.50');
      assert(await page.locator('[data-item-id="'+id+'"] .add-button').isEnabled());
    }
    const item = page.locator('[data-item-id="b001"]');
    await item.locator('.qty-increase').click();
    await item.locator('.add-button').click();
    await page.locator('#cart-fab').click();
    assert.equal(await page.locator('#cart-total').innerText(),'$16.00');
    assert(await page.locator('#cart-whatsapp-btn').isEnabled());
    await page.locator('.cart-item .qty-increase').click();
    assert.equal(await page.locator('#cart-total').innerText(),'$24.00');
    assert(await page.locator('.cart-item .qty-increase').evaluate(n=>n===document.activeElement));
    await page.locator('#cart-close').focus();
    await page.keyboard.press('Shift+Tab');
    assert(await page.locator('#cart-whatsapp-btn').evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Tab');
    assert(await page.locator('#cart-close').evaluate(n=>n===document.activeElement));
    await page.keyboard.press('Escape');
    await page.evaluate(()=>document.getElementById('cart-fab').click());
    await page.waitForTimeout(350);
    assert(await page.locator('#cart-panel').isVisible());
    await page.screenshot({path:path.join(root,'tests/cart-mobile.png')});
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert(await page.locator('#cart-fab').evaluate(n=>n===document.activeElement));
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await page.waitForTimeout(800);
    assert.equal(await page.locator('[aria-current="true"]').innerText(),'Bebidas');
    assert.equal(await page.locator('#cat-bebidas .menu-item').count(), 8);

    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:path.join(root,'tests/menu-mobile.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:path.join(root,'tests/menu-desktop.png'),fullPage:true});
    await page.goto(url);
    await page.locator('[data-item-id="p001"] .add-button').click();
    await page.locator('[data-item-id="f003"] .add-button').click();
    await page.locator('#cart-fab').click();
    await page.evaluate(()=>window.open=(url)=>{ window.testWhatsApp=url; });
    await page.locator('#cart-whatsapp-btn').click();
    const link = new URL(await page.evaluate(()=>window.testWhatsApp));
    assert.equal(link.hostname,'wa.me');
    assert.equal(link.pathname,'/584244000634');
    assert(link.searchParams.get('text').includes('Total: $7.00'));
    assert(link.searchParams.get('text').includes('1x Smoothie Proteico de Vainilla'));
    assert(link.searchParams.get('text').includes('1x Smoothie de Mora'));
    await page.locator('.cart-item-remove').first().click();
    await page.locator('.cart-item-remove').click();
    assert(await page.locator('#cart-empty-message').isVisible());
    assert(await page.locator('#cart-whatsapp-btn').isDisabled());
    await page.route('**/data/menu.json',async route=>{const response=await route.fetch();const menu=await response.json();menu.categorias[0].items[0].disponible=false;await route.fulfill({response,json:menu});});
    await page.goto(url);
    assert(await page.locator('[data-item-id="b001"] .add-button').isDisabled());
    await page.unroute('**/data/menu.json');
    await page.route('**/data/menu.json',route=>route.fulfill({status:500,body:'error'}));
    await page.goto(url);
    await page.getByRole('button',{name:'Reintentar'}).waitFor();
    assert.deepEqual(errors,[]);
    console.log('PASS: widths, JSON, touch targets, quantities, totals, unavailable item, focus, rapid reopen, scroll navigation, empty cart, WhatsApp URL interception and load error.');
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
