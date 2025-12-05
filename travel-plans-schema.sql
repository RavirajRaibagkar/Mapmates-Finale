-- Travel Plans Feature Schema

-- Create travel_plans table
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cover_image TEXT,
  duration_days INTEGER,
  budget_estimate TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Moderate', 'Challenging')),
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plan_checkpoints table
CREATE TABLE IF NOT EXISTS plan_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  checkpoint_order INTEGER NOT NULL,
  checkpoint_type TEXT CHECK (checkpoint_type IN ('start', 'stop', 'activity', 'meal', 'rest', 'end')),
  title TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- in minutes
  estimated_cost TEXT,
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plan_likes table
CREATE TABLE IF NOT EXISTS plan_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

-- Create plan_ratings table
CREATE TABLE IF NOT EXISTS plan_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

-- Create plan_saves table (for users to save plans)
CREATE TABLE IF NOT EXISTS plan_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_by ON travel_plans(created_by);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);
CREATE INDEX IF NOT EXISTS idx_travel_plans_rating ON travel_plans(rating DESC);
CREATE INDEX IF NOT EXISTS idx_plan_checkpoints_plan_id ON plan_checkpoints(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_checkpoints_order ON plan_checkpoints(plan_id, checkpoint_order);
CREATE INDEX IF NOT EXISTS idx_plan_likes_plan_id ON plan_likes(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_ratings_plan_id ON plan_ratings(plan_id);

-- Enable RLS
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_saves ENABLE ROW LEVEL SECURITY;

-- RLS Policies for travel_plans
CREATE POLICY "Public plans are viewable by everyone"
  ON travel_plans FOR SELECT
  USING (is_public = true AND status = 'published');

CREATE POLICY "Users can view their own plans"
  ON travel_plans FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create plans"
  ON travel_plans FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own plans"
  ON travel_plans FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own plans"
  ON travel_plans FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for plan_checkpoints
CREATE POLICY "Checkpoints viewable with plan"
  ON plan_checkpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans 
      WHERE id = plan_checkpoints.plan_id 
      AND (is_public = true OR created_by = auth.uid())
    )
  );

CREATE POLICY "Users can create checkpoints for their plans"
  ON plan_checkpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans 
      WHERE id = plan_checkpoints.plan_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update checkpoints for their plans"
  ON plan_checkpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans 
      WHERE id = plan_checkpoints.plan_id 
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete checkpoints for their plans"
  ON plan_checkpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans 
      WHERE id = plan_checkpoints.plan_id 
      AND created_by = auth.uid()
    )
  );

-- RLS Policies for plan_likes
CREATE POLICY "Anyone can view likes"
  ON plan_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like plans"
  ON plan_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike plans"
  ON plan_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plan_ratings
CREATE POLICY "Anyone can view ratings"
  ON plan_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate plans"
  ON plan_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings"
  ON plan_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ratings"
  ON plan_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plan_saves
CREATE POLICY "Users can view their saves"
  ON plan_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save plans"
  ON plan_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave plans"
  ON plan_saves FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update plan rating
CREATE OR REPLACE FUNCTION update_plan_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE travel_plans
  SET rating = (
    SELECT AVG(rating)::NUMERIC(3,2)
    FROM plan_ratings
    WHERE plan_id = NEW.plan_id
  ),
  updated_at = NOW()
  WHERE id = NEW.plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating
DROP TRIGGER IF EXISTS trigger_update_plan_rating ON plan_ratings;
CREATE TRIGGER trigger_update_plan_rating
AFTER INSERT OR UPDATE OR DELETE ON plan_ratings
FOR EACH ROW
EXECUTE FUNCTION update_plan_rating();

-- Function to update plan likes count
CREATE OR REPLACE FUNCTION update_plan_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE travel_plans
    SET likes = likes + 1,
        updated_at = NOW()
    WHERE id = NEW.plan_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE travel_plans
    SET likes = GREATEST(likes - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.plan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update likes
DROP TRIGGER IF EXISTS trigger_update_plan_likes ON plan_likes;
CREATE TRIGGER trigger_update_plan_likes
AFTER INSERT OR DELETE ON plan_likes
FOR EACH ROW
EXECUTE FUNCTION update_plan_likes();

-- Insert sample travel plans
INSERT INTO travel_plans (title, description, created_by, duration_days, budget_estimate, difficulty_level, tags, status, is_public)
SELECT 
  'Pune Heritage Walk',
  'Explore the rich history of Pune with visits to ancient forts, temples, and colonial architecture',
  id,
  1,
  '₹₹',
  'Easy',
  ARRAY['heritage', 'culture', 'history', 'walking'],
  'published',
  true
FROM profiles
LIMIT 1;

INSERT INTO travel_plans (title, description, created_by, duration_days, budget_estimate, difficulty_level, tags, status, is_public)
SELECT 
  'Foodie Tour of Pune',
  'A culinary journey through Pune''s best eateries, from street food to fine dining',
  id,
  1,
  '₹₹₹',
  'Easy',
  ARRAY['food', 'restaurants', 'cafes', 'street-food'],
  'published',
  true
FROM profiles
LIMIT 1;

-- Success message
SELECT 'Travel Plans schema created successfully!' as message;
