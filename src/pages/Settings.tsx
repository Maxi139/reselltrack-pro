import { ShieldCheck } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Personalization tools are on the way.</p>
          </div>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            We're putting the finishing touches on profile management, notification preferences, and billing controls.
          </p>
          <p className="text-sm text-gray-500">
            Need to adjust something urgently? Reach out via the help center and we'll take care of it manually.
          </p>
        </div>
      </div>
    </div>
  );
}
