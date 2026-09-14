'use client';

import { useState } from 'react';
import axios from 'axios';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ReviewFormProps {
  productId: number;
  orderId: number;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, orderId, onSubmitted }: ReviewFormProps) {
  const { success, error: showError } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { showError('Please select a star rating'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/reviews`, {
        productId,
        orderId,
        rating,
        reviewText: text || null
      });

      success('Review submitted! Thank you for your feedback.');
      onSubmitted();
    } catch (err: any) {
      showError(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-8 bg-primary-50 border border-primary-100 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
      <h3 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
        <Star className="w-6 h-6 text-primary-600 fill-primary-600" />
        Rate Your Experience
      </h3>

      {/* Star selector */}
      <div className="flex gap-1.5 mb-6">
        {[1,2,3,4,5].map(s => (
          <button key={s}
            onClick={() => setRating(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95">
            <Star className={`w-10 h-10 transition-colors duration-200 ${
              s <= (hovered || rating)
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                : 'text-gray-300'
            }`} />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-4 text-sm font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded-full self-center">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Review text */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your experience with this product... (Was it fresh? How was the delivery?)"
        rows={3}
        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-6 resize-none shadow-sm transition-shadow"
      />

      <button onClick={handleSubmit} disabled={loading || rating === 0}
        className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/20 disabled:opacity-50 disabled:hover:shadow-none transition-all w-full sm:w-auto">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
