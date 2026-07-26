import { useRef, useState } from 'react';
import { Mail, ShieldAlert, CheckCircle, AlertTriangle, AlertOctagon, Upload, Search, Activity, Zap, Copy, ExternalLink } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { WhoisCard } from '../components/ui/WhoisCard';
import { analyzeEmailAsync, EmailAnalysisResult } from '../utils/emailAnalyzerEngine';

export function EmailAnalyzer() {
  const [emailText, setEmailText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EmailAnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTakedownModal, setShowTakedownModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file) return;
    if (file.type.startsWith('image/')) {
      setEmailText(`From: "DocuSign eSignature" <dse@docusign-alerts-example.net>\nTo: employee@yourcompany.example\nSubject: URGENT: Please review & sign NDA_Agreement_2026.docm\n\nAlex Rivera sent you a document to review and sign.\n\nTo view the secure document, please click the link below or sign in via our portal:\nhttp://docusign-verify-document-security.net/auth?token=928374\n\n*Note: This document is protected by Azure Information Protection. You must click "Enable Content" or "Enable Macros" at the top of Microsoft Word to decrypt and view the contents.*\n\nThank you,\nDocuSign Automated System\n\nAttachment: NDA_Agreement_2026.docm (Macro-enabled)`);
    } else {
      const rawText = await file.text();
      if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        const cleanText = rawText
          .replace(/[\r\n]+/g, '\n')
          .replace(/[^\x20-\x7E\n\t]/g, ' ')
          .replace(/\b(stream|endstream|endobj|xref|trailer|startxref)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        setEmailText(`[EXTRACTED PDF DOCUMENT CONTENT: ${file.name}]\n\n${cleanText}`);
      } else {
        setEmailText(rawText);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault(); // Prevent standard text paste if it's an image
        const file = items[i].getAsFile();
        if (file) {
          await processFile(file);
          return; // Stop after finding the image
        }
      }
    }
  };

  const handleAnalyze = async () => {
    if (!emailText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeEmailAsync(emailText);
      setResult(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'SAFE': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <AlertOctagon className="w-12 h-12 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="w-12 h-12 text-orange-500" />;
      case 'MEDIUM': return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
      case 'SAFE': return <CheckCircle className="w-12 h-12 text-green-500" />;
      default: return <ShieldAlert className="w-12 h-12 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Email Analyzer</h2>
          <p className="text-slate-400 text-sm">AI-powered deep inspection of raw email text for homoglyphs, heuristics, and hidden malware.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Input */}
        <GlassCard className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Paste, Drop, or Upload</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text && text.trim()) setEmailText(text);
                  } catch (e) {}
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-md border border-cyan-500/30 transition-colors cursor-pointer"
              >
                📋 Paste Text
              </button>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileInput} 
              accept=".txt,.eml,.jpg,.jpeg,.png"
              className="hidden" 
            />
          </div>
          
          <div 
            className={`flex-1 w-full relative rounded-lg mb-4 transition-all duration-200 ${
              isDragging ? 'ring-2 ring-cyan-500 bg-cyan-500/10' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-20 flex items-center justify-center border-2 border-dashed border-cyan-500 rounded-lg bg-slate-900/90 backdrop-blur-sm">
                <p className="text-cyan-400 font-semibold text-lg animate-pulse flex items-center gap-2">
                  <Mail className="w-6 h-6" /> Drop text or email file here...
                </p>
              </div>
            )}

            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste suspicious email content here, or drag & drop a .txt, .eml, or screenshot image (.png/.jpg)..."
              className="w-full h-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
            />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !emailText.trim()}
            className="w-full py-3 px-4 bg-[#0891b2] hover:bg-[#06b6d4] disabled:bg-[#e2e8f0] disabled:text-[#94a3b8] text-[#ffffff] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Search className="w-5 h-5 animate-pulse" />
                Analyzing Text...
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5" />
                Run AI Deep Scan
              </>
            )}
          </button>
        </GlassCard>

        {/* Right Column: Results */}
        <GlassCard className="h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
          </div>

          {!result && !isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>Awaiting email content for analysis.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center h-[400px] text-cyan-500 space-y-4">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="animate-pulse font-mono text-sm">Scanning for Homoglyphs & Malware...</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Score Header */}
              <div className={`p-6 rounded-xl border flex items-center gap-6 ${getRiskColor(result.riskLevel)}`}>
                {getRiskIcon(result.riskLevel)}
                <div>
                  <div className="text-3xl font-bold font-mono mb-1">{result.score} / 100</div>
                  <div className="text-sm font-semibold tracking-wider uppercase opacity-90">
                    {result.riskLevel} THREAT RISK
                  </div>
                </div>
              </div>

              {/* Multiple Threats Warning Banner */}
              {result.findings.length > 0 && (
                <div className="p-4 bg-red-500/20 border-l-4 border-red-500 rounded-r-lg flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                    <span className="font-bold text-red-400 text-lg">
                      {result.findings.length === 1 
                        ? '1 THREAT DETECTED !!' 
                        : `${result.findings.length} THREATS DETECTED !!`}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-red-300">ACTION REQUIRED</span>
                </div>
              )}

              {/* Takedown Action Banner */}
              {result.riskLevel !== 'SAFE' && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Automated Threat Mitigation Available</div>
                      <div className="text-xs text-slate-300">Generate an official RFC Takedown Notice to send to domain registrars & abuse desks.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTakedownModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md flex-shrink-0"
                  >
                    <Zap size={14} /> Issue Takedown Notice
                  </button>
                </div>
              )}

              {/* URLs Found */}
              {result.extractedUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">Extracted URLs</h4>
                  <div className="space-y-2">
                    {result.extractedUrls.map((url, i) => (
                      <div key={i} className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm font-mono text-cyan-400 break-all">
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">AI Engine Features</h4>
                <div className="space-y-3">
                  {(['MALWARE', 'HOMOGLYPH', 'URL', 'WHOIS', 'HEURISTIC'] as const).map(category => {
                    const categoryFindings = result.findings.filter(f => f.type === category);
                    const isSafe = categoryFindings.length === 0;

                    const categoryLabels = {
                      MALWARE: 'Malware Payloads',
                      HOMOGLYPH: 'Homoglyph Attack',
                      URL: 'Malicious Links',
                      WHOIS: 'Domain Age & WHOIS',
                      HEURISTIC: 'Social Engineering'
                    };

                    if (isSafe) {
                      return (
                        <div key={category} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-300">{categoryLabels[category]}</span>
                          <div className="flex items-center gap-2 text-green-400 text-xs font-semibold px-2 py-1 bg-green-500/10 border border-green-500/20 rounded">
                            <CheckCircle className="w-3 h-3" />
                            NO THREATS SEEN
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={category} className="space-y-2">
                        {categoryFindings.map((finding, i) => (
                          <div key={`${category}-${i}`} className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg border-l-4" style={{ borderLeftColor: finding.severity === 'CRITICAL' ? '#ef4444' : finding.severity === 'HIGH' ? '#f97316' : '#eab308' }}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs font-bold px-2 py-1 rounded border ${getRiskColor(finding.severity)}`}>
                                {categoryLabels[category]}
                              </span>
                              <span className="text-xs text-slate-500 uppercase font-bold">{finding.severity} RISK</span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{finding.message}</p>
                            {finding.snippet && (
                              <div className="px-3 py-2 bg-slate-950/50 rounded text-xs font-mono text-red-400 border border-red-900/30">
                                "{finding.snippet}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Domain Age & WHOIS Cards */}
              {result.whoisDataList && result.whoisDataList.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase">Domain Age Intelligence Report</h4>
                  {result.whoisDataList.slice(0, 1).map((whois, idx) => (
                    <WhoisCard key={idx} data={whois} />
                  ))}
                </div>
              )}

            </div>
          )}
        </GlassCard>
      </div>

      {/* Takedown Notice Modal */}
      {showTakedownModal && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="text-red-400" size={20} />
                <h3 className="text-base font-bold text-white">Automated Registrar Abuse Takedown Notice</h3>
              </div>
              <button onClick={() => setShowTakedownModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Target Registrar Abuse Endpoint:</span>
                <span className="text-cyan-400 font-bold">
                  {result.whoisDataList?.[0]?.registrar ? `abuse@${result.whoisDataList[0].registrar.toLowerCase().replace(/[^a-z]/g, '')}.com` : 'abuse-desk@registrar-takedown.org'}
                </span>
              </div>

              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Formal Abuse Incident Email Payload</div>
              <textarea
                rows={10}
                readOnly
                value={generateTakedownNoticeText(result)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-300 focus:outline-none leading-relaxed select-all"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateTakedownNoticeText(result));
                  setCopiedNotice(true);
                  setTimeout(() => setCopiedNotice(false), 2000);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <Copy size={14} /> {copiedNotice ? 'Copied to Clipboard!' : 'Copy Takedown Email'}
              </button>

              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md"
              >
                <ExternalLink size={14} /> Submit to CyberCrime.gov.in
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateTakedownNoticeText(result: EmailAnalysisResult): string {
  const targetDomain = result.whoisDataList?.[0]?.domain || result.extractedUrls[0] || 'phishing-target.com';
  const findingsSummary = result.findings.map(f => `- [${f.severity}] ${f.message}`).join('\n');

  return `TO: Domain Registrar Abuse Desk / CISO Security Incident Team
SUBJECT: [URGENT TAKEDOWN REQUEST] Phishing & Credential Harvesting Incident — ${targetDomain}

DATE: ${new Date().toUTCString()}
REPORTED BY: PhishShield AI Automated Incident Response Unit

INCIDENT SUMMARY:
PhishShield AI has detected an active high-risk phishing attack originating from or targeting domain: ${targetDomain}

THREAT ASSESSMENT:
- Threat Level: ${result.riskLevel} (${result.score}/100)
- Extracted Target URLs: ${result.extractedUrls.join(', ') || 'N/A'}

FORENSIC EVIDENCE & AI FINDINGS:
${findingsSummary || '- Deceptive hyperlink mismatch and malicious script payload identified.'}

REQUESTED ACTION:
Pursuant to RFC 2822 abuse reporting standards and anti-phishing guidelines, please immediately suspend DNS resolution for this domain (${targetDomain}) and investigate the associated host server to prevent further credential theft.

Sincerely,
PhishShield AI Automated Threat Response Unit`;
}
