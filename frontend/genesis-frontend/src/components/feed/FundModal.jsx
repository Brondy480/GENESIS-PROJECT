import { useState } from 'react';
import axios from '../../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const FundModal = ({ project, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Suggested amounts
  const suggestedAmounts = [25, 50, 100, 250];

  // Handle amount change
  const handleAmountChange = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setAmount('');
    } else {
      setAmount(numValue.toString());
    }
  };

  // Select suggested amount
  const selectSuggestedAmount = (suggested) => {
    setAmount(suggested.toString());
  };

  // Handle fund submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fundAmount = parseFloat(amount);
    if (!fundAmount || fundAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post(`/projectsFunding/create/${project._id}`, {
        amount: fundAmount,
        projectId: project._id,
      });

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error funding project:', err);
      setError(err.response?.data?.message || 'Failed to fund project');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `${(amount || 0).toLocaleString()} FCFA`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: 440,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          padding: '20px 24px',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 style={{
            fontFamily: F.jakarta,
            fontSize: 20,
            fontWeight: 800,
            color: 'white',
            margin: 0,
          }}>
            Back This Project
          </h2>
          <p style={{
            fontFamily: F.dm,
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.8)',
            margin: '4px 0 0 0',
          }}>
            {project.title}
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              margin: '0 auto 16px',
              background: '#D1FAE5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="32" height="32" fill="none" stroke="#059669" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 style={{
              fontFamily: F.jakarta,
              fontSize: 20,
              fontWeight: 800,
              color: '#0D0621',
              margin: '0 0 8px 0',
            }}>
              Thank You!
            </h3>
            <p style={{
              fontFamily: F.dm,
              fontSize: 14,
              color: '#6B7280',
              margin: 0,
            }}>
              Your backing has been received successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Project Preview */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              background: '#F9FAFB',
              borderRadius: 12,
            }}>
              <img
                src={project.coverImage || 'https://via.placeholder.com/80'}
                alt={project.title}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  objectFit: 'cover',
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: F.jakarta,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0D0621',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {project.title}
                </p>
                <p style={{
                  fontFamily: F.dm,
                  fontSize: 11,
                  color: '#9CA3AF',
                  margin: '2px 0 0 0',
                }}>
                  {project.category}
                </p>
                <div style={{ marginTop: 6 }}>
                  <div style={{
                    height: 4,
                    background: '#E5E7EB',
                    borderRadius: 100,
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #7C3AED, #6D28D9)',
                        borderRadius: 100,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: F.jakarta,
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}>
                Enter your backing amount
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: F.dm,
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#6B7280',
                }}>
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  style={{
                    width: '100%',
                    paddingLeft: 32,
                    paddingRight: 14,
                    paddingTop: 14,
                    paddingBottom: 14,
                    border: '2px solid #E5E7EB',
                    borderRadius: 12,
                    fontFamily: F.dm,
                    fontSize: 16,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  autoFocus
                />
              </div>
            </div>

            {/* Suggested Amounts */}
            <div>
              <label style={{
                display: 'block',
                fontFamily: F.jakarta,
                fontSize: 13,
                fontWeight: 600,
                color: '#374151',
                marginBottom: 8,
              }}>
                Quick select
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {suggestedAmounts.map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => selectSuggestedAmount(suggested)}
                    style={{
                      padding: '10px 0',
                      borderRadius: 10,
                      fontFamily: F.jakarta,
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: amount === suggested.toString() ? '#7C3AED' : '#F3F4F6',
                      color: amount === suggested.toString() ? 'white' : '#4B5563',
                    }}
                  >
                    ${suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div style={{
              padding: 14,
              background: '#EDE9FE',
              borderRadius: 12,
            }}>
              <h4 style={{
                fontFamily: F.jakarta,
                fontSize: 13,
                fontWeight: 600,
                color: '#5B21B6',
                margin: '0 0 8px 0',
              }}>
                Why Back This Project?
              </h4>
              <ul style={{
                fontSize: 11,
                color: '#7C3AED',
                margin: 0,
                padding: '0 0 0 16px',
                lineHeight: 1.6,
              }}>
                <li>✨ Support innovative ideas</li>
                <li>🎁 Get exclusive rewards</li>
                <li>🌍 Make a positive impact</li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: 10,
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 10,
              }}>
                <p style={{
                  fontSize: 12,
                  color: '#DC2626',
                  margin: 0,
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0 || loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                fontFamily: F.jakarta,
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: amount && parseFloat(amount) > 0 && !loading ? 'pointer' : 'not-allowed',
                background: amount && parseFloat(amount) > 0 && !loading
                  ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                  : '#E5E7EB',
                color: amount && parseFloat(amount) > 0 && !loading ? 'white' : '#9CA3AF',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18,
                    height: 18,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Processing...
                </>
              ) : (
                `Back ${amount ? `for ${formatCurrency(parseFloat(amount))}` : ''}`
              )}
            </button>

            {/* Security Note */}
            <p style={{
              fontSize: 11,
              color: '#9CA3AF',
              textAlign: 'center',
              margin: 0,
            }}>
              🔒 Your payment is secured through our escrow system
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default FundModal;
