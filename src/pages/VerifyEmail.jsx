import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await authAPI.verifyEmail(token);
                if (data.success) {
                    setStatus('success');
                    setMessage(data.message);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be expired.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="h-screen w-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#111] border border-white/10 p-10 rounded-3xl text-center shadow-2xl">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <Loader2 className="mx-auto animate-spin text-brand-primary" size={48} />
                        <h2 className="text-2xl font-bold">Verifying your email...</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <CheckCircle className="mx-auto text-green-500" size={64} />
                        <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
                        <p className="text-gray-400">{message}</p>
                        <Link to="/login" className="block w-full bg-brand-primary py-3 rounded-xl font-semibold hover:brightness-110 transition-all">
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <XCircle className="mx-auto text-red-500" size={64} />
                        <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                        <p className="text-red-400/80">{message}</p>
                        <Link to="/signup" className="block w-full border border-white/20 py-3 rounded-xl font-semibold hover:bg-white/5 transition-all">
                            Try Signing Up Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}