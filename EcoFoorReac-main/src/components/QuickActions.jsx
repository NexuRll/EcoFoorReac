import { Link } from 'react-router-dom';
import './QuickActions.css';

const QuickActions = () => {
  return (
    <div className="quick-actions">
      <h2>Acciones Rápidas</h2>
      <div className="actions-grid">
        <Link to="/admin/products" className="action-card">
          <span role="img" aria-label="productos">🛒</span>
          <p>Gestionar Productos</p>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
