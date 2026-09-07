import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/ToastProvider';
import Home from './pages/Home';
import Items from './pages/Items';
import Detail from './pages/Detail';
import { NewRecord, EditRecord } from './pages/Editor';
import Guide from './pages/Guide';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="items" element={<Items />} />
          <Route path="items/new" element={<NewRecord />} />
          <Route path="items/:id" element={<Detail />} />
          <Route path="items/:id/edit" element={<EditRecord />} />
          <Route path="guide" element={<Guide />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
