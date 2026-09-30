import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setAuth } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';
import { authApi } from '../api/authApi';

export const useImpersonate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const handleLoginAsUser = async (email: string, targetRole?: string) => {
    if (!email) return;
    setIsSwitching(email);
    try {
      const res = await authApi.loginAsUser({ email });
      if (res.success && res.data) {
        const { user, accessToken, refreshToken, token } = res.data;
        dispatch(setAuth({ user, accessToken: accessToken || token, refreshToken }));
        dispatch(
          addToast({
            type: 'success',
            message: `Successfully switched to user ${user.name || user.email} (${user.role})`,
          })
        );

        // Route to the appropriate workspace dashboard
        const role = user.role || targetRole;
        if (role === 'SALES') {
          navigate('/sales/orders');
        } else if (role === 'DEALER') {
          navigate('/dealer');
        } else if (role === 'MARKETING') {
          navigate('/marketing');
        } else {
          navigate('/admin');
        }
      }
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Failed to switch user',
        })
      );
    } finally {
      setIsSwitching(null);
    }
  };

  return { handleLoginAsUser, isSwitching };
};
