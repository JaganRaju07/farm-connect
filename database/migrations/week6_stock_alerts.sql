-- Add alert threshold to products
ALTER TABLE products
 ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
 ADD COLUMN IF NOT EXISTS last_low_stock_alert TIMESTAMP;

COMMENT ON COLUMN products.low_stock_threshold IS
 'Send low stock notification when stock_available falls below this value';

COMMENT ON COLUMN products.last_low_stock_alert IS
 'Timestamp of last alert sent — prevents duplicate alerts within 24 hours';

-- Function that fires after every stock update
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
 -- Only trigger when stock just dropped below threshold
 IF NEW.stock_available < NEW.low_stock_threshold
 AND OLD.stock_available >= OLD.low_stock_threshold
 AND (
 NEW.last_low_stock_alert IS NULL
 OR NEW.last_low_stock_alert < NOW() - INTERVAL '24 hours'
 )
 THEN
 -- Insert notification for the farmer
 INSERT INTO notifications
 (user_id, user_type, title, message, notification_type, related_id, related_type, action_url)
 VALUES (
 NEW.farmer_id,
 'farmer',
 'Low Stock Alert',
 'Your product "' || NEW.name || '" has only ' || NEW.stock_available || ' ' || NEW.unit || ' remaining.',
 'low_stock',
 NEW.id,
 'product',
 '/farmer/products'
 );

 -- Record alert time to prevent spam
 NEW.last_low_stock_alert := NOW();
 END IF;

 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after every UPDATE on products
DROP TRIGGER IF EXISTS tr_low_stock_alert ON products;
CREATE TRIGGER tr_low_stock_alert
BEFORE UPDATE OF stock_available ON products
FOR EACH ROW EXECUTE FUNCTION check_low_stock();

-- Verify trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'tr_low_stock_alert';
