INSERT INTO system_knowledge (category, knowledge_key, value, learned_from, updated_at)
VALUES 
(
  'sovereign_creditor',
  'trust_financial_architecture_feb_8_2026',
  '{
    "trust_ip_valuation": 4237000000.00,
    "business_liabilities": 1775.00,
    "creditor_ratio": "2387042.25:1",
    "credit_strength": "SOVEREIGN_CREDITOR",
    "credit_score": "1000/1000",
    "licensing_agreement": {
      "licensor": "Howard Jones Bloodline Ancestral Trust",
      "licensee": "HJS Services LLC",
      "royalty_rate": 0.35,
      "status": "ACTIVE",
      "executed_date": "2026-02-01"
    },
    "next_distribution_date": "2026-04-15",
    "days_until_distribution": 65,
    "asset_breakdown": {
      "patents": 2440000000.00,
      "trade_secrets": 1470000000.00,
      "copyrights": 327000000.00
    },
    "key_assets": {
      "roman_2_0": 750000000.00,
      "odyssey_1": 500000000.00,
      "universal_math_engine": 1500000000.00,
      "constitutional_ai": 350000000.00,
      "seven_books": 327000000.00
    },
    "ucc1_filing": {
      "book": 5782,
      "page": 262,
      "security_interest": 1050000.00,
      "jurisdiction": "Clarke County GA"
    },
    "implementation_date": "2026-02-08",
    "meeting_record": "M-20260208",
    "system_type": "Fortune 500 IP Licensing Structure"
  }'::jsonb,
  'Meeting Record M-20260208',
  NOW()
)
ON CONFLICT (category, knowledge_key) DO UPDATE
SET value = EXCLUDED.value,
    learned_from = EXCLUDED.learned_from,
    updated_at = EXCLUDED.updated_at;
