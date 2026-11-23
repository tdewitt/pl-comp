'use strict';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function queue(browser) {
  await browser.evaluate(`(() => { setTimeout(() => location.reload(), 100); return true; })()`);
  await sleep(1000);
  let result;
  for (let attempt = 0; attempt < 35; attempt++) {
    result = await browser.evaluate(`(() => {
      const text = document.body.innerText;
      const total = Number(text.match(/(\\d+)\\nActive vendors/)?.[1] || 0);
      const vendors = [...document.querySelectorAll('tr[data-row-id]')].map(row => {
        const cells = [...row.querySelectorAll('td')].map(cell => cell.innerText.trim());
        const [name, domain] = (cells[1] || '').split('\\n');
        return { vendorId:row.getAttribute('data-row-id'), name, domain,
          risk:cells[3], review:cells[4], lastReviewed:cells[6], documents:cells[7] };
      });
      return { total, vendors };
    })()`);
    if (result.total && result.vendors.length) break;
    await sleep(350);
  }
  if (!result?.total || !result.vendors.length) throw new Error('Secureframe vendor list did not load');
  if (result.vendors.length < result.total) {
    throw new Error(`Vendor list is paginated: loaded ${result.vendors.length} of ${result.total}`);
  }
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const vendors = result.vendors.map(vendor => {
    const review = vendor.review || '';
    const match = review.match(/Next review starts ([A-Za-z]+ \d{1,2}, \d{4})/);
    const nextReview = match ? new Date(match[1]).toISOString().slice(0, 10) : null;
    const state = /In progress/i.test(review) ? 'in-progress' :
      nextReview && nextReview <= today ? 'due' : nextReview ? 'scheduled' : 'unknown';
    return { ...vendor, nextReview, state };
  });
  return { checkedAt: new Date().toISOString(), total: result.total,
    needsReview: vendors.filter(v => ['in-progress', 'due', 'unknown'].includes(v.state)), vendors };
}

module.exports = { queue };
