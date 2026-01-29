import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Footer } from './Footer';
import { Header } from './Header';

interface FeedCard {
  code: string;
  title?: string;
  description?: string;
  writtenMessage?: string;
  senderName?: string;
  recipientName?: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt: string;
  personalizedAt?: string;
  pageUrl: string;
  voteCount: number;
  commentCount: number;
  userVoted?: boolean;
}

interface Comment {
  _id: string;
  cardCode: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export function FeedPage() {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [voting, setVoting] = useState<Record<string, boolean>>({});
  const observerTarget = useRef<HTMLDivElement>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Cargar tarjetas iniciales
  useEffect(() => {
    loadCards(1);
  }, []);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreCards();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingMore]);

  const loadCards = async (pageNum: number) => {
    try {
      setLoading(pageNum === 1);
      setLoadingMore(pageNum > 1);

      const response = await fetch(`${backendUrl}/api/feed?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success) {
        const newCards = data.data.pages;
        
        // Cargar estado de votos para cada tarjeta
        const cardsWithVotes = await Promise.all(
          newCards.map(async (card: FeedCard) => {
            const voteResponse = await fetch(`${backendUrl}/api/feed/${card.code}/votes`);
            const voteData = await voteResponse.json();
            return {
              ...card,
              userVoted: voteData.data?.userVoted || false,
            };
          })
        );

        if (pageNum === 1) {
          setCards(cardsWithVotes);
          setCurrentIndex(0);
        } else {
          setCards((prev) => [...prev, ...cardsWithVotes]);
        }

        setHasMore(data.data.pagination.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreCards = () => {
    if (!loadingMore && hasMore) {
      loadCards(page + 1);
    }
  };

  const handleVote = async (code: string) => {
    if (voting[code]) return;

    try {
      setVoting((prev) => ({ ...prev, [code]: true }));
      const response = await fetch(`${backendUrl}/api/feed/${code}/vote`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setCards((prev) =>
          prev.map((card) =>
            card.code === code
              ? {
                  ...card,
                  voteCount: data.data.voteCount,
                  userVoted: data.data.userVoted,
                }
              : card
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting((prev) => ({ ...prev, [code]: false }));
    }
  };

  const loadComments = async (code: string) => {
    if (comments[code]) return; // Ya cargados

    try {
      const response = await fetch(`${backendUrl}/api/feed/${code}/comments`);
      const data = await response.json();

      if (data.success) {
        setComments((prev) => ({ ...prev, [code]: data.data.comments }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleComments = (code: string) => {
    const isShowing = showComments[code];
    setShowComments((prev) => ({ ...prev, [code]: !isShowing }));

    if (!isShowing && !comments[code]) {
      loadComments(code);
    }
  };

  const submitComment = async (code: string) => {
    const text = newComment[code]?.trim();
    if (!text || submittingComment[code]) return;

    try {
      setSubmittingComment((prev) => ({ ...prev, [code]: true }));
      const response = await fetch(`${backendUrl}/api/feed/${code}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success) {
        setComments((prev) => ({
          ...prev,
          [code]: [data.data, ...(prev[code] || [])],
        }));
        setNewComment((prev) => ({ ...prev, [code]: '' }));
        setCards((prev) =>
          prev.map((card) =>
            card.code === code ? { ...card, commentCount: card.commentCount + 1 } : card
          )
        );
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [code]: false }));
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (hasMore && !loadingMore) {
      loadMoreCards();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const renderCard = (card: FeedCard, index: number) => (
    <div key={card.code} className="bg-white rounded-2xl shadow-lg overflow-hidden mx-2 md:mx-0">
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">
              {card.senderName || 'Anónimo'}
            </p>
            <p className="text-xs text-gray-500">
              Para: {card.recipientName || 'Tú'} • {formatDate(card.personalizedAt || card.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Card Image */}
      {card.imageUrl && (
        <div className="w-full bg-gray-100">
          <img
            src={card.imageUrl}
            alt="Tarjeta"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Card Content */}
      <div className="px-4 py-3">
        {card.writtenMessage && (
          <p className="text-gray-800 mb-3 whitespace-pre-wrap">
            {card.writtenMessage}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-4 mb-3">
          <button
            onClick={() => handleVote(card.code)}
            disabled={voting[card.code]}
            className={`flex items-center space-x-2 ${
              card.userVoted
                ? 'text-red-500'
                : 'text-gray-600 hover:text-red-500'
            } transition-colors`}
          >
            <Heart
              className={`w-6 h-6 ${card.userVoted ? 'fill-current' : ''}`}
            />
            <span className="font-semibold">{card.voteCount}</span>
          </button>

          <button
            onClick={() => toggleComments(card.code)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold">{card.commentCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments[card.code] && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
              {comments[card.code]?.length > 0 ? (
                comments[card.code].map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-800">
                          {comment.userName}
                        </span>{' '}
                        <span className="text-gray-600">{comment.text}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay comentarios aún. Sé el primero en comentar.
                </p>
              )}
            </div>

            {/* Comment Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment[card.code] || ''}
                onChange={(e) =>
                  setNewComment((prev) => ({
                    ...prev,
                    [card.code]: e.target.value,
                  }))
                }
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    submitComment(card.code);
                  }
                }}
                placeholder="Escribe un comentario..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <button
                onClick={() => submitComment(card.code)}
                disabled={!newComment[card.code]?.trim() || submittingComment[card.code]}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submittingComment[card.code] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Heart className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No hay tarjetas aún</h2>
          <p className="text-gray-600">Sé el primero en crear una tarjeta personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col">
      <Header title="MemeCards Feed" />
      
      {/* Card Counter - Solo móvil */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-[73px] z-40 md:hidden">
        <div className="max-w-md mx-auto px-4 py-2 text-center">
          <div className="text-sm text-gray-600 font-medium">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      </div>

      {/* Desktop: Masonry Layout */}
      <div className="hidden md:block flex-1 pb-20 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Masonry Container */}
          <div 
            className="columns-1 lg:columns-2 xl:columns-3 2xl:columns-4"
            style={{ 
              columnGap: '1.5rem',
              columnFill: 'balance'
            }}
          >
            {cards.map((card, index) => (
              <div 
                key={card.code} 
                className="break-inside-avoid mb-6"
                style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid',
                  display: 'inline-block',
                  width: '100%'
                }}
              >
                {renderCard(card, index)}
              </div>
            ))}
          </div>

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Vertical scroll, one card at a time with snap */}
      <div className="md:hidden max-w-md mx-auto pb-20 relative">
        <div className="space-y-4 snap-y snap-mandatory overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {cards.map((card, index) => (
            <div key={card.code} className="snap-start">
              {renderCard(card, index)}
            </div>
          ))}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* Observer Target for Infinite Scroll (shared) */}
      <div ref={observerTarget} className="h-4" />

      <Footer />
    </div>
  );
}
