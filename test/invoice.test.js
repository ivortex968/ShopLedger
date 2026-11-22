'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function compareCurrentFigures(order, expectedInvoice, expectedPricing) {
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const pricingFigures = pricing.computeTotals(order.items, order.coupon);

  assert.deepStrictEqual(invoiceFigures, expectedInvoice);
  assert.deepStrictEqual({
    subtotal: pricingFigures.subtotal,
    discount: pricingFigures.discount,
    taxable: pricingFigures.taxable,
    tax: pricingFigures.tax,
    cgst: pricingFigures.cgst,
    sgst: pricingFigures.sgst,
    total: pricingFigures.total
  }, expectedPricing);
}

test('CURRENT BEHAVIOUR: #1001 uses explicit 5% and 12% gstRate values without a coupon', function () {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { id: 6, sku: 'DRY-001', name: 'A2 Gir Cow Ghee 500ml', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ]
  };

  compareCurrentFigures(order, {
    subtotal: 1090,
    discount: 0,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176,
    rows: [
      { name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'A2 Gir Cow Ghee 500ml', sku: 'DRY-001', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  }, {
    subtotal: 1090,
    discount: 0,
    taxable: 1090,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176
  });
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 discount is applied to taxable subtotal before tax', function () {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { id: 1, sku: 'GRN-001', name: 'Indrayani Basmati Rice 5kg', price: 640, qty: 1, hsn: '1006', gstRate: 5 }
    ]
  };

  compareCurrentFigures(order, {
    subtotal: 640,
    discount: 64,
    tax: 28.8,
    cgst: 14.4,
    sgst: 14.4,
    total: 604.8,
    rows: [
      { name: 'Indrayani Basmati Rice 5kg', sku: 'GRN-001', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 }
    ]
  }, {
    subtotal: 640,
    discount: 64,
    taxable: 576,
    tax: 28.8,
    cgst: 14.4,
    sgst: 14.4,
    total: 604.8
  });
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 applies the ₹150 cap before tax on ₹2,240', function () {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 12, sku: 'BEV-003', name: 'Kokum Sherbet Concentrate 750ml', price: 2240, qty: 1, hsn: '2106', gstRate: 18 }
    ]
  };

  compareCurrentFigures(order, {
    subtotal: 2240,
    discount: 150,
    tax: 376.2,
    cgst: 188.1,
    sgst: 188.1,
    total: 2466.2,
    rows: [
      { name: 'Kokum Sherbet Concentrate 750ml', sku: 'BEV-003', hsn: '2106', qty: 1, price: 2240, gstPercent: 18, line: 2240, lineTax: 376.2 }
    ]
  }, {
    subtotal: 2240,
    discount: 150,
    taxable: 2090,
    tax: 376.2,
    cgst: 188.1,
    sgst: 188.1,
    total: 2466.2
  });
});

test('invoice matches checkout for #1004 HSN slab and capped SAVE10 coupon', function () {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { id: 5, sku: 'OIL-002', name: 'Cold-Pressed Groundnut Oil 5L', price: 1120, qty: 2, hsn: '1508', gstRate: undefined }
    ]
  };
  const billed = pricing.computeTotals(order.items, order.coupon);
  const figures = invoice.computeInvoiceFigures(order);

  assert.deepStrictEqual({
    subtotal: figures.subtotal,
    discount: figures.discount,
    tax: figures.tax,
    cgst: figures.cgst,
    sgst: figures.sgst,
    total: figures.total
  }, {
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    cgst: billed.cgst,
    sgst: billed.sgst,
    total: billed.total
  });
  assert.deepStrictEqual(figures.rows, [
    { name: 'Cold-Pressed Groundnut Oil 5L', sku: 'OIL-002', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
  ]);
});

test('CURRENT BEHAVIOUR: #1008 all-18% items without a coupon match pricing totals', function () {
  const order = {
    id: 1008,
    coupon: '',
    items: [
      { id: 8, sku: 'BEV-001', name: 'Assam CTC Masala Chai 250g', price: 140, qty: 2, hsn: '0902', gstRate: 18 },
      { id: 9, sku: 'BEV-002', name: 'Filter Coffee Decoction Blend 500g', price: 310, qty: 1, hsn: '0901', gstRate: 18 }
    ]
  };

  compareCurrentFigures(order, {
    subtotal: 590,
    discount: 0,
    tax: 106.2,
    cgst: 53.1,
    sgst: 53.1,
    total: 696.2,
    rows: [
      { name: 'Assam CTC Masala Chai 250g', sku: 'BEV-001', hsn: '0902', qty: 2, price: 140, gstPercent: 18, line: 280, lineTax: 50.4 },
      { name: 'Filter Coffee Decoction Blend 500g', sku: 'BEV-002', hsn: '0901', qty: 1, price: 310, gstPercent: 18, line: 310, lineTax: 55.8 }
    ]
  }, {
    subtotal: 590,
    discount: 0,
    taxable: 590,
    tax: 106.2,
    cgst: 53.1,
    sgst: 53.1,
    total: 696.2
  });
});
