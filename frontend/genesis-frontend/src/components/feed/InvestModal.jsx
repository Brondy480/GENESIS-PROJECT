import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import axios from '../../api/axios';

const F = { jakarta: "'Plus Jakarta Sans', sans-serif", dm: "'DM Sans', sans-serif" };

const InvestModal = ({ project, onClose }) => {
    const [amount, setAmount] = useState('');
    const [equity, setEquity] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const suggestedAmounts = [1000, 5000, 10000, 25000];

    // Handle investment submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const investAmount = parseFloat(amount);
        if (!investAmount || investAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        const minInvestment = 100;
        if (investAmount < minInvestment) {
            setError(`Minimum investment is ${minInvestment.toLocaleString()} FCFA`);
            return;
        }

        const equityPct = parseFloat(equity);
        if (!equityPct || equityPct <= 0 || equityPct > 100) {
            setError('Please enter a valid equity percentage (0.01 – 100)');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await axios.post(`/investment/projects/${project._id}/invest`, {
                amount: investAmount,
                equityRequested: equityPct,
                message: message || `Investment request for $${investAmount} for ${equityPct}% equity`,
            });

            setSuccess(true);

            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.error('Error creating investment:', err);
            setError(err.response?.data?.message || 'Failed to create investment');
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
                maxHeight: 'calc(100vh - 32px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #D97706, #B45309)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={20} color="white" />
                        </div>
                        <div>
                            <h2 style={{
                                fontFamily: F.jakarta,
                                fontSize: 20,
                                fontWeight: 800,
                                color: 'white',
                                margin: 0,
                            }}>
                                Invest in This Project
                            </h2>
                            <p style={{
                                fontFamily: F.dm,
                                fontSize: 13,
                                color: 'rgba(255, 255, 255, 0.8)',
                                margin: '2px 0 0 0',
                            }}>
                                Equity Investment Opportunity
                            </p>
                        </div>
                    </div>
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
                            Investment Submitted!
                        </h3>
                        <p style={{
                            fontFamily: F.dm,
                            fontSize: 14,
                            color: '#6B7280',
                            margin: 0,
                        }}>
                            The project creator will review your investment offer.
                        </p>
                    </div>
                ) : (
                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', flex: 1 }}>
                        {/* Project Preview */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: 12,
                            background: '#FFFBEB',
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
                                    color: '#D97706',
                                    fontWeight: 600,
                                    margin: '2px 0 0 0',
                                }}>
                                    {formatCurrency(project.fundingGoal)} goal
                                </p>
                            </div>
                        </div>

                        {/* Project info strip */}
                        <div style={{ padding: 12, background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Target</p>
                                <p style={{ fontFamily: F.jakarta, fontSize: 15, fontWeight: 700, color: '#0D0621', margin: '2px 0 0 0' }}>
                                    {formatCurrency(project.targetAmount || 0)}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>Equity available</p>
                                <p style={{ fontFamily: F.jakarta, fontSize: 15, fontWeight: 700, color: '#0D0621', margin: '2px 0 0 0' }}>
                                    {project.equityAvailable || 0}%
                                </p>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label style={{ display: 'block', fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                Investment Amount (FCFA)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: F.dm, fontSize: 16, fontWeight: 600, color: '#6B7280' }}>$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    min="100"
                                    step="1"
                                    style={{ width: '100%', paddingLeft: 32, paddingRight: 14, paddingTop: 14, paddingBottom: 14, border: '2px solid #E5E7EB', borderRadius: 12, fontFamily: F.dm, fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={(e) => e.target.style.borderColor = '#D97706'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    autoFocus
                                />
                            </div>
                            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0 0' }}>Minimum investment: 100 FCFA</p>
                        </div>

                        {/* Quick-select amounts */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {suggestedAmounts.map((s) => (
                                <button key={s} type="button" onClick={() => setAmount(s.toString())}
                                    style={{ padding: '10px 0', borderRadius: 10, fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: amount === s.toString() ? '#D97706' : '#F3F4F6', color: amount === s.toString() ? 'white' : '#4B5563' }}>
                                    ${(s / 1000).toFixed(0)}K
                                </button>
                            ))}
                        </div>

                        {/* Equity % Input */}
                        <div>
                            <label style={{ display: 'block', fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                Equity Requested (%)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    value={equity}
                                    onChange={(e) => setEquity(e.target.value)}
                                    placeholder="e.g. 5"
                                    min="0.01"
                                    max="100"
                                    step="0.01"
                                    style={{ width: '100%', paddingLeft: 14, paddingRight: 36, paddingTop: 14, paddingBottom: 14, border: '2px solid #E5E7EB', borderRadius: 12, fontFamily: F.dm, fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={(e) => e.target.style.borderColor = '#D97706'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                />
                                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: F.dm, fontSize: 16, fontWeight: 600, color: '#6B7280' }}>%</span>
                            </div>
                            <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0 0' }}>How much equity you are requesting in exchange</p>
                        </div>

                        {/* Message */}
                        <div>
                            <label style={{ display: 'block', fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                                Message to Creator (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Introduce yourself and explain why you want to invest..."
                                rows={3}
                                style={{ width: '100%', padding: 14, border: '2px solid #E5E7EB', borderRadius: 12, fontFamily: F.dm, fontSize: 13, color: '#0D0621', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                onFocus={(e) => e.target.style.borderColor = '#D97706'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        {/* Terms */}
                        <div style={{ padding: 14, background: '#F3F4F6', borderRadius: 12 }}>
                            <h4 style={{ fontFamily: F.jakarta, fontSize: 13, fontWeight: 600, color: '#0D0621', margin: '0 0 8px 0' }}>Investment Terms</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {['Equity stake based on percentage requested', 'Agreement signing required before funds are released', 'Funds held in escrow until deal closes'].map((t, i) => (
                                    <p key={i} style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{t}</p>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{ padding: 10, background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10 }}>
                                <p style={{ fontSize: 12, color: '#DC2626', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12,
                                fontFamily: F.jakarta, fontWeight: 700, fontSize: 14, border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading ? '#A78BFF' : '#7C3AED',
                                color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                opacity: loading ? 0.8 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                    Processing...
                                </>
                            ) : (
                                'Send Investment Request'
                            )}
                        </button>

                        <p style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', margin: 0 }}>
                            Your investment is protected through our escrow system
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestModal;
