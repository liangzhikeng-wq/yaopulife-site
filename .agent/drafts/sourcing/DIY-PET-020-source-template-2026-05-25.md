# Source Template: DIY-PET-020

Product: Custom Pet Photo Mug
Research ID: R-20260525-001
Domestic Search Keyword: 照片陶瓷马克杯 定制
Created At: 2026-05-25T23:28:52.560Z

## Search Targets

- 1688
- Taobao
- Pinduoduo
- YiwuGo
- Baidu AiCaigou

## Required Fields

- [ ] supplier_name
- [ ] supplier_store_url
- [ ] supplier_product_url
- [ ] supplier_product_title
- [ ] supplier_price_min
- [ ] supplier_price_max
- [ ] currency
- [ ] moq
- [ ] supports_dropshipping
- [ ] supports_customization
- [ ] material
- [ ] size
- [ ] domestic_shipping_fee
- [ ] estimated_weight
- [ ] stock_status
- [ ] risk_notes

## Candidate Supplier Notes

Use this block while researching, then convert the best candidate into a real source record with `agent-source-product.cjs`.

```text
supplier_name:
supplier_store_url:
supplier_product_url:
supplier_product_title:
supplier_price_min:
supplier_price_max:
currency: CNY
moq:
supports_dropshipping:
supports_customization:
material:
size:
color_options:
shipping_origin:
domestic_shipping_fee:
estimated_weight:
supplier_rating:
monthly_sales:
review_count:
image_quality_score:
style_match_score:
price_score:
supplier_reliability_score:
stock_status:
purchase_notes:
risk_notes:
```

## Next Command

```bash
node scripts/agent-source-product.cjs \
  --yaopulife-sku DIY-PET-020 \
  --product-status candidate \
  --research-id R-20260525-001 \
  --domestic-search-keyword "照片陶瓷马克杯 定制" \
  --supplier-name "Supplier Name" \
  --supplier-product-url "https://detail.1688.com/..." \
  --domestic-platform 1688
```
