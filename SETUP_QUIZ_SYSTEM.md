# 🎮 Quiz System Setup Guide

## Error: "Error fetching question"

If you see this error, it means the quiz tables haven't been created yet.

## Quick Fix (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the SQL Script
Copy and paste the entire contents of `quiz-games-schema.sql` and click "Run"

**The script will create:**
- ✅ `quiz_questions` table (stores all questions)
- ✅ `quiz_attempts` table (tracks user answers)
- ✅ `daily_quiz_stats` table (daily performance)
- ✅ RLS policies (security)
- ✅ 12 sample questions (ready to play!)

### Step 3: Verify
Run this to check if tables were created:

```sql
SELECT * FROM quiz_questions;
```

You should see 12 sample questions!

### Step 4: Refresh Your App
Refresh your browser and the quiz game will work!

---

## What You Get

### Sample Questions (12 included)

**Places** (🏛️)
- "Which city is known as the Pink City of India?"
- "What is the tallest building in the world?"
- "Which ancient wonder is in Petra, Jordan?"

**Travel** (✈️)
- "What is the busiest airport in the world?"
- "Which country has the most UNESCO World Heritage Sites?"

**Food** (🍽️)
- "Which Indian city is famous for Hyderabadi Biryani?"
- "What is the main ingredient in Japanese miso soup?"

**Geography** (🌍)
- "Which is the longest river in the world?"
- "How many time zones does Russia span?"

**Culture** (🎭)
- "Which festival is known as the Festival of Lights?"

**Trends** (📱)
- "Which social media platform introduced Threads in 2023?"
- "What is the most popular travel trend in 2024?"

All with:
- ✅ 4 multiple choice options
- ✅ Correct answer marked
- ✅ Difficulty level (easy/medium/hard)
- ✅ Points (10-20 Mapos)
- ✅ Fun explanations

---

## Features Enabled

Once the tables are created:

### For Users
- ✅ Play quiz games at `/games`
- ✅ Answer questions and earn Mapos
- ✅ 30-second timer per question
- ✅ Instant feedback with explanations
- ✅ Confetti animation for correct answers
- ✅ Track daily stats

### For Admins
- ✅ Manage questions at `/admin` → "Quiz Questions"
- ✅ Add new questions
- ✅ Edit existing questions
- ✅ Delete questions
- ✅ Activate/deactivate questions
- ✅ Set difficulty and points

---

## Categories Available

1. **Places** (🏛️) - Cities, landmarks, buildings
2. **Travel** (✈️) - Airports, routes, tourism
3. **Culture** (🎭) - Festivals, traditions, customs
4. **Food** (🍽️) - Cuisine, dishes, ingredients
5. **Trends** (📱) - Current events, technology, social media
6. **Geography** (🌍) - Countries, rivers, mountains

---

## Difficulty Levels

- **Easy** (10 Mapos) - General knowledge
- **Medium** (15 Mapos) - Requires some knowledge
- **Hard** (20 Mapos) - Tricky or detailed knowledge

---

## How to Add Your Own Questions

### As Admin:

1. **Go to Admin Panel**
   - Navigate to `/admin`
   - Click "Quiz Questions" tab

2. **Click "Add Question"**

3. **Fill the Form:**
   - Question text
   - 4 options
   - Select correct answer (0-3)
   - Choose category
   - Set difficulty
   - Set points (5-20)
   - Add explanation (optional but recommended!)

4. **Click "Add Question"**

5. **Test It!**
   - Go to `/games`
   - Play quiz
   - Your question will appear randomly

---

## Tips for Good Questions

### Do's ✅
- Make questions clear and specific
- Provide 4 distinct options
- Add interesting explanations
- Use current information (especially for Trends)
- Test difficulty appropriately
- Include fun facts

### Don'ts ❌
- Don't make questions too vague
- Don't use similar options
- Don't skip explanations
- Don't use outdated information
- Don't make all questions hard

---

## Example Question Format

```
Question: "Which city is known as the Pink City of India?"

Options:
1. Mumbai
2. Jaipur ✓ (Correct)
3. Delhi
4. Kolkata

Category: Places
Difficulty: Easy
Points: 10

Explanation: "Jaipur is called the Pink City because of the distinctive pink color of its buildings, painted in 1876 to welcome Prince Albert."
```

---

## Troubleshooting

### Still seeing errors?
1. Check if you're logged in
2. Verify SQL script ran successfully
3. Check browser console for specific error
4. Try logging out and back in

### Can't add questions as admin?
Make sure you're an admin:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Questions not appearing in game?
1. Check if questions are marked as `is_active = true`
2. Verify at least one question exists
3. Check RLS policies are set up

---

## Database Structure

### quiz_questions
- Stores all questions
- Admin can CRUD
- Users can only view active ones

### quiz_attempts
- Tracks every answer
- Used for analytics
- Auto-updates stats

### daily_quiz_stats
- Daily performance per user
- Questions answered
- Correct answers
- Total points earned
- Streak tracking

---

## Future Enhancements

Want to add more features? Consider:

- [ ] Leaderboards
- [ ] Multiplayer battles
- [ ] Time-limited events
- [ ] Category challenges
- [ ] Question of the day
- [ ] Achievements
- [ ] Share results
- [ ] Image-based questions
- [ ] Voice questions
- [ ] AI-generated questions

---

## Done! ✅

Your quiz system is now fully functional!

**Next Steps:**
1. Run the SQL script
2. Refresh your app
3. Play some quizzes
4. Add more questions as admin
5. Watch users engage and earn Mapos!

---

## Support

If you encounter issues:
1. Check browser console
2. Review Supabase logs
3. Verify SQL script ran completely
4. Check RLS policies
5. Test in incognito mode

---

**Enjoy your quiz games! 🎉**
