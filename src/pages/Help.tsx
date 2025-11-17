import { MailQuestion } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white">
          <MailQuestion className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Help Center</h1>
        <p className="text-gray-600 mb-6">
          Articles, tutorials, and in-app chat are launching shortly. In the meantime, email support@reselltrack.pro with any
          questions and we'll jump in within one business day.
        </p>
        <a
          href="mailto:support@reselltrack.pro"
          className="btn-primary inline-flex items-center justify-center px-6 py-3"
        >
          Email Support
        </a>
      </div>
    </div>
  );
}
