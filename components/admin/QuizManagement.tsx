'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
  points: number;
  explanation: string;
  is_active: boolean;
}

export function QuizManagement() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer: 0,
    category: 'places',
    difficulty: 'medium',
    points: 10,
    explanation: ''
  });
  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.warn('Quiz questions table not found. Run quiz-games-schema.sql');
          setTableExists(false);
          setQuestions([]);
          return;
        }
        throw error;
      }
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (!(error as any)?.message?.includes('relation')) {
        toast.error('Failed to load questions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4
    ];

    const questionData = {
      question: formData.question,
      options: JSON.stringify(options),
      correct_answer: formData.correct_answer,
      category: formData.category,
      difficulty: formData.difficulty,
      points: formData.points,
      explanation: formData.explanation,
      is_active: true
    };

    try {
      if (editingQuestion) {
        const { error } = await (supabase as any)
          .from('quiz_questions')
          .update(questionData)
          .eq('id', editingQuestion.id);

        if (error) throw error;
        toast.success('Question updated successfully!');
      } else {
        const { error } = await (supabase as any)
          .from('quiz_questions')
          .insert([questionData]);

        if (error) throw error;
        toast.success('Question added successfully!');
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correct_answer: question.correct_answer,
      category: question.category,
      difficulty: question.difficulty,
      points: question.points,
      explanation: question.explanation
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await (supabase as any)
        .from('quiz_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Question deleted');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('quiz_questions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Question ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchQuestions();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_answer: 0,
      category: 'places',
      difficulty: 'medium',
      points: 10,
      explanation: ''
    });
    setEditingQuestion(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tableExists) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Quiz Questions Table Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The quiz_questions table hasn't been created yet.
          </p>
          <div className="bg-white rounded-lg p-4 text-left max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-gray-700 mb-2">To fix this:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to Supabase → SQL Editor</li>
              <li>Copy the contents of <code className="bg-gray-100 px-2 py-1 rounded">quiz-games-schema.sql</code></li>
              <li>Paste and run the SQL</li>
              <li>Refresh this page</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 The schema includes 12 sample questions to get you started!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Quiz Questions</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Question
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                rows={3}
                placeholder="Enter your question here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Option 1"
                required
                value={formData.option1}
                onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
              />
              <Input
                label="Option 2"
                required
                value={formData.option2}
                onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
              />
              <Input
                label="Option 3"
                required
                value={formData.option3}
                onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
              />
              <Input
                label="Option 4"
                required
                value={formData.option4}
                onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                <select
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="places">Places</option>
                  <option value="travel">Travel</option>
                  <option value="culture">Culture</option>
                  <option value="food">Food</option>
                  <option value="trends">Trends</option>
                  <option value="geography">Geography</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <Input
                label="Points"
                type="number"
                min="5"
                step="5"
                required
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation (Optional)</label>
              <textarea
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                rows={2}
                placeholder="Add an interesting fact or explanation..."
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-600">No questions yet. Add your first question!</p>
          </div>
        ) : (
          questions.map((question) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-md p-6 ${
                !question.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold capitalize">
                      {question.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                      {question.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {question.points} pts
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-3">{question.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-sm ${
                          idx === question.correct_answer
                            ? 'bg-green-50 border-2 border-green-500 font-semibold'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <p className="text-sm text-gray-600 mt-3 italic">💡 {question.explanation}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(question.id, question.is_active)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={question.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {question.is_active ? (
                      <Eye className="w-5 h-5 text-green-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(question)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
