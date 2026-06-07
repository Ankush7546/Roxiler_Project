import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel = { ADMIN: 'Administrator', USER: 'User', OWNER: 'Store Owner' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const home =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'OWNER' ? '/owner' : '/stores';

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to={home} className="brand">Store<span>Rater</span></Link>
        {user && (
          <div className="nav-links">
            <span className="nav-role">{roleLabel[user.role]}</span>
            <Link to="/account">Account</Link>
            <button className="btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        )}
      </div>
    </nav>
  );
}
