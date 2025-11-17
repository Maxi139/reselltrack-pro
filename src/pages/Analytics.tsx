import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes';

export default function Analytics() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
          <BarChart3 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Analytics Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          We're building deeper insights to help you spot trends, monitor profitability, and share progress with your team.
          Stay tuned!
        </p>
        <Link to={ROUTES.dashboard} className="btn-primary inline-flex items-center justify-center px-6 py-3">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
