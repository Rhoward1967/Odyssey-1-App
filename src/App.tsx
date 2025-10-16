import AppLayout from '@/components/AppLayout'; // ✅ CORRECT (remove /layout/)import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import Subscription from '@/pages/Subscription';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path='/' element={<Index />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/subscription' element={<Subscription />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
