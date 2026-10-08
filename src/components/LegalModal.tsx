import React from 'react';
import { X, ShieldCheck, FileText, ExternalLink, CheckCircle2, Lock } from 'lucide-react';
import { DnaRingLogo } from './DnaRingLogo';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'google-disclosure';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = React.useState<'privacy' | 'terms' | 'google-disclosure'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#18191b] border border-[#2d2f33] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#e3e3e3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2d2f33] flex items-center justify-between bg-[#131314]/80 shrink-0">
          <div className="flex items-center gap-3">
            <DnaRingLogo className="w-6 h-6 shrink-0" animate={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">Omni Z</h2>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[#8ab4f8]/10 text-[#8ab4f8] border border-[#8ab4f8]/20">
                  Compliance & Transparency
                </span>
              </div>
              <p className="text-xs text-[#9aa0a6]">Legal documentation, data privacy, and Google user data compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9aa0a6] hover:text-white hover:bg-[#282a2c] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#2d2f33] bg-[#18191b] shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'privacy'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#202124]'
                : 'border-transparent text-[#9aa0a6] hover:text-white hover:bg-[#202124]/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'terms'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#202124]'
                : 'border-transparent text-[#9aa0a6] hover:text-white hover:bg-[#202124]/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab('google-disclosure')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'google-disclosure'
                ? 'border-[#8ab4f8] text-[#8ab4f8] bg-[#202124]'
                : 'border-transparent text-[#9aa0a6] hover:text-white hover:bg-[#202124]/50'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Google API Limited Use</span>
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-[13px] leading-relaxed select-text">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#202124] border border-[#2d2f33] space-y-1">
                <div className="font-semibold text-white text-sm">Privacy Policy for Omni Z</div>
                <div className="text-[#9aa0a6] text-xs">Last Updated: October 7, 2026 &bull; Developer: Shubham Das (shubhamhx1@gmail.com)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#8ab4f8]/10 border border-[#8ab4f8]/25 text-[#c4c7c5] space-y-1">
                <div className="text-[#8ab4f8] font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google API Services User Data Policy Compliance</span>
                </div>
                <p className="text-xs text-[#e3e3e3]">
                  <strong>Omni Z's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                  <a 
                    href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#8ab4f8] underline hover:text-white"
                  >
                    Google API Services User Data Policy
                  </a>, including the Limited Use requirements.</strong>
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">1. Overview & Purpose</h4>
                <p className="text-[#c4c7c5]">
                  Omni Z is an interactive AI workspace designed to assist knowledge workers, researchers, and developers with real-time research, document synthesis, coding, and workflow automation. We respect your privacy and process user data only as necessary to fulfill your requested features.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">2. Google Account & Google Drive Data</h4>
                <ul className="list-disc list-inside space-y-1.5 text-[#c4c7c5] pl-1">
                  <li><strong>Account Identity:</strong> When you sign in with Google, we receive your name, email address, and profile picture to maintain your session and sync your conversation history.</li>
                  <li><strong>Google Drive Integration:</strong> If you connect Google Drive, Omni Z accesses only the files you explicitly choose to attach or analyze (e.g. Google Docs, Sheets, Slides, code, or text files).</li>
                  <li><strong>Transient In-Memory Processing:</strong> Google Drive document contents are parsed in active memory for your AI conversation and are <em>never</em> stored permanently on external servers.</li>
                  <li><strong>No AI Model Training:</strong> Your Google Workspace data and Drive file contents are never used to train, retrain, or improve generalized AI models.</li>
                  <li><strong>No Data Sale:</strong> We never sell, monetize, or disclose your personal data or Google Drive contents to third-party data brokers or advertisers.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">3. User Controls & Revocation</h4>
                <p className="text-[#c4c7c5]">
                  You can disconnect Google Drive at any time inside the app or revoke permissions permanently at{' '}
                  <a 
                    href="https://myaccount.google.com/permissions" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#8ab4f8] underline hover:text-white"
                  >
                    Google Account Permissions
                  </a>.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">4. Developer & Contact Information</h4>
                <p className="text-[#c4c7c5]">
                  For questions or data deletion requests, contact developer <strong>Shubham Das</strong> at{' '}
                  <a href="mailto:shubhamhx1@gmail.com" className="text-[#8ab4f8] underline hover:text-white">
                    shubhamhx1@gmail.com
                  </a>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#202124] border border-[#2d2f33] space-y-1">
                <div className="font-semibold text-white text-sm">Terms of Service for Omni Z</div>
                <div className="text-[#9aa0a6] text-xs">Effective Date: October 7, 2026</div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">1. Acceptance of Terms</h4>
                <p className="text-[#c4c7c5]">
                  By accessing or utilizing Omni Z, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must discontinue use of the service.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">2. Service Description</h4>
                <p className="text-[#c4c7c5]">
                  Omni Z is a cloud-powered AI conversational workspace integrating real-time web search, Python execution, generative tools, and optional Google Drive file analysis.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">3. Acceptable Use</h4>
                <p className="text-[#c4c7c5]">
                  Users agree not to use Omni Z for malicious, unlawful, abusive, or harmful activities, or to upload copyrighted or confidential materials without appropriate rights.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">4. AI Disclaimers</h4>
                <p className="text-[#c4c7c5]">
                  Outputs generated by Omni Z's underlying AI models are provided for informational and creative purposes. Always verify critical facts, legal, financial, or medical advice independently.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'google-disclosure' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1">
                <div className="font-semibold text-purple-200 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span>Google Limited Use Disclosure</span>
                </div>
                <p className="text-xs text-purple-300/80">
                  Detailed declaration regarding Google Workspace APIs and Drive data protection
                </p>
              </div>

              <div className="space-y-3 text-[#c4c7c5]">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#202124] border border-[#2d2f33]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Explicit User Selection Only</div>
                    <div className="text-xs text-[#9aa0a6]">Omni Z never crawls or accesses your Google Drive in the background. Only files you pick are loaded.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#202124] border border-[#2d2f33]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">Zero Permanent Storage of File Contents</div>
                    <div className="text-xs text-[#9aa0a6]">Document contents exist in temporary memory only during active analysis. No copies are stored in external databases.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#202124] border border-[#2d2f33]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">No Machine Learning Model Training</div>
                    <div className="text-xs text-[#9aa0a6]">Google Workspace user data is never used to train or optimize generalized AI or machine learning models.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#202124] border border-[#2d2f33]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-white font-medium">No Advertising or Third-Party Sale</div>
                    <div className="text-xs text-[#9aa0a6]">User data is never monetized, sold, rented, or shared with advertisers or third-party data brokers.</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#131314] rounded-xl border border-[#2d2f33] text-xs text-[#9aa0a6]">
                Review the official policy:{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8ab4f8] underline hover:text-white inline-flex items-center gap-1"
                >
                  <span>Google API Services User Data Policy</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2d2f33] bg-[#131314] flex items-center justify-between text-xs text-[#9aa0a6] shrink-0">
          <div className="flex items-center gap-3">
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#8ab4f8] hover:underline flex items-center gap-1"
            >
              <span>Full Privacy URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>&bull;</span>
            <a 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#8ab4f8] hover:underline flex items-center gap-1"
            >
              <span>Full Terms URL</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#282a2c] hover:bg-[#333538] text-white transition-colors cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
