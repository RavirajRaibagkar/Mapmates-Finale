-- Helper function to increment plan views
CREATE OR REPLACE FUNCTION increment_plan_views(plan_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE travel_plans
  SET views = views + 1,
      updated_at = NOW()
  WHERE id = plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_plan_views(UUID) TO authenticated, anon;
