'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

interface Feedback {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

// Sample existing feedback
const INITIAL_FEEDBACK: Feedback[] = [
  { name: 'Ayesha R.',   rating: 5, comment: 'This platform saved my brother\'s life. Found a donor within 20 minutes!', date: '2026-04-10' },
  { name: 'Bilal K.',    rating: 5, comment: 'Incredibly easy to use. Registered as a donor in under 2 minutes.', date: '2026-04-15' },
  { name: 'Sana M.',     rating: 4, comment: 'Great service. The AI matching feature is very impressive.', date: '2026-04-20' },
];

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks]   = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [name, setName]             = useState('');
  const [comment, setComment]       = useState('');
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim())    { setError('Please enter your name.');    return; }
    if (!comment.trim()) { setError('Please enter your feedback.'); return; }
    if (rating === 0)    { setError('Please select a star rating.'); return; }

    const newFeedback: Feedback = {
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);
    setName(''); setComment(''); setRating(0); setError('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section style={{ background: '#fff', padding: '80px 0', borderTop: '1px solid #ebebeb' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className="section-tag">Community Voice</span>
          <h2 className="section-heading">What People Are Saying</h2>
          <p style={{ color: '#888', marginTop: 12, maxWidth: 500, margin: '12px auto 0', fontSize: 15 }}>
            Real stories from donors and patients who have used our platform.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}
          className="feedback-grid">
          <style>{`
            @media (max-width: 768px) {
              .feedback-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>

          {/* Submit form */}
          <div>
            <h3 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 18, marginBottom: 20 }}>Share Your Experience</h3>
            {submitted && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                ✅ Thank you for your feedback!
              </div>
            )}
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13 }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Your Name</label>
                <input
                  className="input"
                  placeholder="e.g. Ahmed Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Star rating */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform .15s' }}
                    >
                      <Star
                        size={28}
                        fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                        color={(hoverRating || rating) >= star ? '#f59e0b' : '#d1d5db'}
                        style={{ transition: 'all .15s' }}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span style={{ fontSize: 13, color: '#888', alignSelf: 'center', marginLeft: 6 }}>
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>Your Feedback</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Share your experience with Blood Donor Connect..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 32px' }}>
                Submit Feedback
              </button>
            </form>
          </div>

          {/* Existing feedback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 18, marginBottom: 4 }}>Recent Reviews</h3>
            {feedbacks.slice(0, 4).map((fb, i) => (
              <div key={i} style={{
                background: '#f9f9f9', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #ebebeb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'box-shadow .2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{fb.name}</span>
                    <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={13} fill={fb.rating >= s ? '#f59e0b' : 'none'} color={fb.rating >= s ? '#f59e0b' : '#d1d5db'} />
                      ))}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#bbb' }}>{fb.date}</span>
                </div>
                <p style={{ color: '#666', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>&ldquo;{fb.comment}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
