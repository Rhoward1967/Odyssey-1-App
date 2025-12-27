import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Apex Dashboard as the main landing page
    navigate('/app/apex', { replace: true });
  }, [navigate]);

  return null;
}
