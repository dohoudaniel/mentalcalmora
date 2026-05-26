import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mint-mist">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-slate-text">404</h1>
        <p className="text-xl text-slate-text/70 mb-4">Oops! Page not found</p>
        <Link to="/" className="text-leaf-green hover:text-leaf-green/80 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
