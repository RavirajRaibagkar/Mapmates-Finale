-- Quiz Games System
-- Questions about places, travel, and trends

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  category TEXT NOT NULL CHECK (category IN ('places', 'travel', 'culture', 'food', 'trends', 'geography')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER DEFAULT 10,
  explanation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  points_earned INTEGER DEFAULT 0,
  time_taken INTEGER, -- seconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Quiz Stats
CREATE TABLE IF NOT EXISTS daily_quiz_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_quiz_stats(user_id, date);

-- RLS Policies
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quiz_stats ENABLE ROW LEVEL SECURITY;

-- Everyone can view active questions
CREATE POLICY "Anyone can view active questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can insert/update/delete questions
CREATE POLICY "Admins can manage questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can view their own attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can manage their own stats
CREATE POLICY "Users can manage own stats"
  ON daily_quiz_stats FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Function to update quiz stats
CREATE OR REPLACE FUNCTION update_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert daily stats
  INSERT INTO daily_quiz_stats (user_id, date, questions_answered, correct_answers, total_points)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NEW.points_earned
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    questions_answered = daily_quiz_stats.questions_answered + 1,
    correct_answers = daily_quiz_stats.correct_answers + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    total_points = daily_quiz_stats.total_points + NEW.points_earned;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quiz stats
DROP TRIGGER IF EXISTS update_quiz_stats_trigger ON quiz_attempts;
CREATE TRIGGER update_quiz_stats_trigger
  AFTER INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_stats();

-- Sample Questions
INSERT INTO quiz_questions (question, options, correct_answer, category, difficulty, points, explanation) VALUES
-- Places
('Which city is known as the "Pink City" of India?', 
 '["Mumbai", "Jaipur", "Delhi", "Kolkata"]', 1, 'places', 'easy', 10,
 'Jaipur is called the Pink City because of the distinctive pink color of its buildings.'),

('What is the tallest building in the world as of 2024?',
 '["Burj Khalifa", "Shanghai Tower", "Merdeka 118", "Tokyo Skytree"]', 0, 'places', 'medium', 15,
 'Burj Khalifa in Dubai stands at 828 meters tall.'),

('Which ancient wonder is located in Petra, Jordan?',
 '["The Treasury", "The Colosseum", "Machu Picchu", "Angkor Wat"]', 0, 'places', 'hard', 20,
 'The Treasury (Al-Khazneh) is the most famous structure in Petra.'),

-- Travel
('What is the busiest airport in the world by passenger traffic?',
 '["Dubai International", "Hartsfield-Jackson Atlanta", "Beijing Capital", "Tokyo Haneda"]', 1, 'travel', 'medium', 15,
 'Hartsfield-Jackson Atlanta International Airport handles the most passengers annually.'),

('Which country has the most UNESCO World Heritage Sites?',
 '["China", "Italy", "Spain", "France"]', 1, 'travel', 'hard', 20,
 'Italy has the most UNESCO World Heritage Sites with over 58 locations.'),

-- Food
('Which Indian city is famous for its Hyderabadi Biryani?',
 '["Mumbai", "Delhi", "Hyderabad", "Bangalore"]', 2, 'food', 'easy', 10,
 'Hyderabad is renowned for its distinctive style of biryani.'),

('What is the main ingredient in Japanese miso soup?',
 '["Tofu", "Seaweed", "Fermented soybean paste", "Fish"]', 2, 'food', 'medium', 15,
 'Miso is a fermented soybean paste that gives the soup its name and flavor.'),

-- Geography
('Which is the longest river in the world?',
 '["Amazon", "Nile", "Yangtze", "Mississippi"]', 1, 'geography', 'easy', 10,
 'The Nile River in Africa is approximately 6,650 km long.'),

('How many time zones does Russia span?',
 '["7", "9", "11", "13"]', 2, 'geography', 'hard', 20,
 'Russia spans 11 time zones, the most of any country.'),

-- Culture
('Which festival is known as the "Festival of Lights"?',
 '["Holi", "Diwali", "Eid", "Christmas"]', 1, 'culture', 'easy', 10,
 'Diwali is celebrated with lights, fireworks, and diyas.'),

-- Trends (2024)
('Which social media platform introduced "Threads" in 2023?',
 '["Twitter", "Meta", "TikTok", "Snapchat"]', 1, 'trends', 'medium', 15,
 'Meta (Facebook/Instagram) launched Threads as a Twitter competitor.'),

('What is the most popular travel trend in 2024?',
 '["Cruise vacations", "Sustainable tourism", "Space tourism", "Road trips"]', 1, 'trends', 'medium', 15,
 'Sustainable and eco-friendly tourism is the biggest trend in 2024.');

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_quiz_question_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quiz_question_timestamp ON quiz_questions;
CREATE TRIGGER update_quiz_question_timestamp
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_question_timestamp();
