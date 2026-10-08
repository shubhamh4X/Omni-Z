export function getPrivacyPolicyHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - Omni Z</title>
  <meta name="description" content="Omni Z Privacy Policy. Learn how Omni Z collects, uses, and protects your information, including Google Drive and Google user data.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #131314;
      --card-bg: #1e1f20;
      --card-border: #2d2f33;
      --text: #e3e3e3;
      --text-muted: #9aa0a6;
      --accent: #8ab4f8;
      --accent-hover: #aecbfa;
      --callout-bg: rgba(138, 180, 248, 0.08);
      --callout-border: rgba(138, 180, 248, 0.25);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
      padding: 0;
      margin: 0;
    }
    header {
      border-bottom: 1px solid var(--card-border);
      background-color: rgba(19, 19, 20, 0.95);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }
    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #fff;
      font-weight: 600;
      font-size: 1.15rem;
    }
    .logo-ring {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: conic-gradient(from 180deg at 50% 50%, #4285f4 0deg, #9b51e0 120deg, #ea4335 240deg, #4285f4 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-inner {
      width: 18px;
      height: 18px;
      background: #131314;
      border-radius: 50%;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      margin-left: 20px;
      transition: color 0.2s;
    }
    .nav-links a:hover {
      color: #fff;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }
    .title-section {
      margin-bottom: 36px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 24px;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .meta {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 600;
      color: #ffffff;
      margin-top: 36px;
      margin-bottom: 14px;
      letter-spacing: -0.01em;
    }
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f1f3f4;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    p {
      margin-bottom: 16px;
      color: #d2d4d7;
      font-size: 0.98rem;
    }
    ul, ol {
      margin-left: 24px;
      margin-bottom: 18px;
      color: #d2d4d7;
    }
    li {
      margin-bottom: 8px;
    }
    a {
      color: var(--accent);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .callout {
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .callout-title {
      color: var(--accent);
      font-weight: 600;
      font-size: 1.05rem;
      margin-bottom: 8px;
    }
    footer {
      border-top: 1px solid var(--card-border);
      padding: 32px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .footer-links {
      margin-bottom: 12px;
    }
    .footer-links a {
      margin: 0 12px;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="logo-ring"><div class="logo-inner"></div></div>
        <span>Omni Z</span>
      </a>
      <div class="nav-links">
        <a href="/">App Home</a>
        <a href="/terms">Terms of Service</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="title-section">
      <h1>Privacy Policy for Omni Z</h1>
      <p class="meta">Effective Date: October 7, 2026 &bull; Last Updated: October 7, 2026</p>
    </div>

    <div class="card">
      <p><strong>Omni Z</strong> ("we", "our", or "the Application") is an intelligent, real-time AI research and workspace application designed to assist users with interactive problem solving, web grounding, document synthesis, and code execution. This Privacy Policy informs you how Omni Z handles, collects, uses, and safeguards information when you access our service or use our integrations, including Google Sign-In and Google Drive.</p>
      <p>Developer & Contact: <strong>Shubham Das</strong> (<a href="mailto:shubhamhx1@gmail.com">shubhamhx1@gmail.com</a>).</p>
    </div>

    <h2>1. Information We Collect</h2>
    <p>We believe in data minimization. Omni Z only accesses and processes data strictly necessary to provide the features you choose to use:</p>
    <ul>
      <li><strong>Google Account Information (When You Sign In):</strong> When you choose to authenticate via Google Sign-In, we receive your basic public Google profile information, including your Google UID, display name, email address, and profile picture URL. This data is used solely to authenticate your identity and personalize your session.</li>
      <li><strong>Google Drive Data (Upon Explicit User Selection):</strong> If you choose to connect Google Drive, Omni Z requests permission to read or attach files that you specifically select (such as Google Docs, Google Sheets, Google Slides, or text files). We only access Drive file metadata (name, file ID, MIME type) and file contents when you explicitly choose to attach or analyze that file in your chat.</li>
      <li><strong>Conversation & Prompt Content:</strong> Messages, prompts, code snippets, and questions you submit in the chat are processed to generate contextual AI responses.</li>
    </ul>

    <div class="callout">
      <div class="callout-title">Google API Services User Data Policy Compliance</div>
      <p style="margin-bottom: 0;"><strong>Omni Z's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.</strong></p>
    </div>

    <h2>2. How We Use Google Workspace & Drive Data</h2>
    <p>When you grant Omni Z permission to access Google Drive:</p>
    <ul>
      <li><strong>Explicit User Direction:</strong> Omni Z only accesses and loads files that you select via the file selector. We do not perform unauthorized background indexing or bulk copying of your Google Drive.</li>
      <li><strong>Episodic In-Session Analysis:</strong> The text and data extracted from your selected Google Drive files are provided to the AI model in memory solely to answer your questions or summarize the document during your active session.</li>
      <li><strong>No Server-Side File Storage:</strong> Omni Z does not retain or store copies of your Google Drive files on permanent external servers or databases. Once your conversation is completed or cleared, the file context is discarded from active execution memory.</li>
      <li><strong>No AI Model Training:</strong> Your Google Workspace data and Drive file contents are <strong>NEVER used to train, retrain, or improve generalized machine learning or artificial intelligence models</strong>.</li>
      <li><strong>No Advertising or Monetization:</strong> We do not sell, rent, monetize, or transfer your Google Drive data or personal information to third parties, advertising networks, or data brokers.</li>
    </ul>

    <h2>3. Guest & Unauthenticated Access</h2>
    <p>Omni Z does not require you to sign in to explore or experience the application. Anyone can visit the Omni Z homepage, inspect its capabilities, review its documentation, test sample prompts, and engage with temporary guest sessions without creating an account or providing credentials.</p>

    <h2>4. Data Storage and Retention</h2>
    <ul>
      <li><strong>Authenticated Sessions:</strong> If you sign in with your Google account, your chat session titles and messages may be securely saved in your private user space in Firebase Firestore to allow you to resume your conversations across visits.</li>
      <li><strong>Temporary & Guest Chats:</strong> Temporary chats are not saved to long-term storage and can be erased with a single click.</li>
      <li><strong>Deletion Rights:</strong> You can delete any chat session at any time directly in the Omni Z sidebar. You can also sign out or request complete deletion of your user record by emailing <a href="mailto:shubhamhx1@gmail.com">shubhamhx1@gmail.com</a>.</li>
    </ul>

    <h2>5. Disconnecting Google Drive & Revoking Access</h2>
    <p>You maintain complete control over your Google account permissions at all times:</p>
    <ul>
      <li><strong>Within Omni Z:</strong> Click the "Disconnect" button in the Google Drive file selector modal or your user menu at any time to clear cached credentials.</li>
      <li><strong>Via Google Security Settings:</strong> You can revoke Omni Z's permissions at any time by visiting your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account Permissions page</a>.</li>
    </ul>

    <h2>6. Security of Your Information</h2>
    <p>We implement robust industry-standard safeguards to protect your information. All communications between your client browser, Omni Z servers, and Google APIs are encrypted in transit using Transport Layer Security (TLS/HTTPS). Tokens and credentials are handled strictly via secure client-side flows.</p>

    <h2>7. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time to reflect operational, legal, or regulatory updates. Any changes will be posted on this page with an updated Effective Date.</p>

    <h2>8. Contact Us</h2>
    <p>If you have any questions, feedback, or concerns regarding this Privacy Policy or your data, please contact:</p>
    <div class="card">
      <p><strong>Omni Z Developer:</strong> Shubham Das</p>
      <p><strong>Email:</strong> <a href="mailto:shubhamhx1@gmail.com">shubhamhx1@gmail.com</a></p>
      <p><strong>Application:</strong> Omni Z (https://ais-dev-k3l7okpsndbxhy2pbyfql7-152525428510.asia-east1.run.app)</p>
    </div>
  </main>

  <footer>
    <div class="footer-links">
      <a href="/">Home</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="mailto:shubhamhx1@gmail.com">Support</a>
    </div>
    <p>&copy; 2026 Omni Z. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

export function getTermsOfServiceHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service - Omni Z</title>
  <meta name="description" content="Omni Z Terms of Service. Guidelines and terms governing the use of the Omni Z application.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #131314;
      --card-bg: #1e1f20;
      --card-border: #2d2f33;
      --text: #e3e3e3;
      --text-muted: #9aa0a6;
      --accent: #8ab4f8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.65;
    }
    header {
      border-bottom: 1px solid var(--card-border);
      background-color: rgba(19, 19, 20, 0.95);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }
    .header-inner {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #fff;
      font-weight: 600;
      font-size: 1.15rem;
    }
    .logo-ring {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: conic-gradient(from 180deg at 50% 50%, #4285f4 0deg, #9b51e0 120deg, #ea4335 240deg, #4285f4 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-inner {
      width: 18px;
      height: 18px;
      background: #131314;
      border-radius: 50%;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      margin-left: 20px;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #fff; }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }
    .title-section {
      margin-bottom: 36px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 24px;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .meta { font-size: 0.9rem; color: var(--text-muted); }
    h2 {
      font-size: 1.35rem;
      font-weight: 600;
      color: #ffffff;
      margin-top: 36px;
      margin-bottom: 14px;
    }
    p { margin-bottom: 16px; color: #d2d4d7; font-size: 0.98rem; }
    ul { margin-left: 24px; margin-bottom: 18px; color: #d2d4d7; }
    li { margin-bottom: 8px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    footer {
      border-top: 1px solid var(--card-border);
      padding: 32px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .footer-links { margin-bottom: 12px; }
    .footer-links a { margin: 0 12px; }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="brand">
        <div class="logo-ring"><div class="logo-inner"></div></div>
        <span>Omni Z</span>
      </a>
      <div class="nav-links">
        <a href="/">App Home</a>
        <a href="/terms">Terms of Service</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </header>

  <main class="container">
    <div class="title-section">
      <h1>Terms of Service for Omni Z</h1>
      <p class="meta">Effective Date: October 7, 2026</p>
    </div>

    <div class="card">
      <p>Welcome to <strong>Omni Z</strong> ("Application", "Service"). By accessing or using Omni Z, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Application.</p>
    </div>

    <h2>1. Description of Service</h2>
    <p>Omni Z is an AI-powered workspace and research assistant providing real-time generative responses, web search grounding, document and code analysis, and optional Google Drive file integration. The service is accessible to all users for exploration with optional Google authentication for account persistence.</p>

    <h2>2. User Responsibilities & Acceptable Use</h2>
    <p>When using Omni Z, you agree that you will not:</p>
    <ul>
      <li>Use the service to violate any applicable laws or regulations.</li>
      <li>Upload or transmit harmful code, viruses, or malicious exploits.</li>
      <li>Attempt to bypass security controls or abuse server resources.</li>
      <li>Upload sensitive files or Google Drive content that you do not have authorization to access or share.</li>
    </ul>

    <h2>3. Intellectual Property & Your Content</h2>
    <p>You retain full ownership of all prompts, documents, and files you attach to Omni Z. We claim no ownership over your inputs or the Google Drive files you analyze.</p>

    <h2>4. Disclaimers & Limitation of Liability</h2>
    <p>Omni Z utilizes generative artificial intelligence models. While we strive for accuracy, AI-generated outputs may occasionally be inaccurate or incomplete. Omni Z is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.</p>

    <h2>5. Termination</h2>
    <p>You may stop using Omni Z at any time. We reserve the right to suspend or terminate access for any user violating these Terms of Service.</p>

    <h2>6. Contact</h2>
    <div class="card">
      <p>For questions regarding these Terms of Service, contact:</p>
      <p><strong>Developer:</strong> Shubham Das</p>
      <p><strong>Email:</strong> <a href="mailto:shubhamhx1@gmail.com">shubhamhx1@gmail.com</a></p>
    </div>
  </main>

  <footer>
    <div class="footer-links">
      <a href="/">Home</a>
      <a href="/terms">Terms of Service</a>
      <a href="/privacy">Privacy Policy</a>
      <a href="mailto:shubhamhx1@gmail.com">Support</a>
    </div>
    <p>&copy; 2026 Omni Z. All rights reserved.</p>
  </footer>
</body>
</html>`;
}
