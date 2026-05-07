-- Update subscription_plan enum with all 8 plan variants.
-- Old values ('weekly', 'monthly') kept — Postgres cannot remove enum values.

ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'basic_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'premium_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_basic_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_basic_monthly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_premium_weekly';
ALTER TYPE subscription_plan ADD VALUE IF NOT EXISTS 'couples_premium_monthly';
