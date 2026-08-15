import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MasterTasks } from './pages/MasterTasks';
import { FinancialModel } from './pages/FinancialModel';
import { Licences } from './pages/Licences';
import { MenuSuppliers } from './pages/MenuSuppliers';
import { Property } from './pages/Property';
import { PeopleSops } from './pages/PeopleSops';
import { PreOpening } from './pages/PreOpening';
import { Gates } from './pages/Gates';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<MasterTasks />} />
          <Route path="/financial" element={<FinancialModel />} />
          <Route path="/licences" element={<Licences />} />
          <Route path="/menu-suppliers" element={<MenuSuppliers />} />
          <Route path="/property" element={<Property />} />
          <Route path="/people" element={<PeopleSops />} />
          <Route path="/pre-opening" element={<PreOpening />} />
          <Route path="/gates" element={<Gates />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
