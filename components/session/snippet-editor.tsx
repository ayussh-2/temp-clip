const defaultContent = `// Cloud Sync Active
// Session: X4K9MQ

// Temporary Code Snippet Shared via TempClip
const config = {
    apiKey: "7v92-x4k9-mq22-88lp",
    environment: "production",
    encryption: "AES-256-GCM"
};

function initializeFleet() {
    console.log("Device fleet synchronized. Ready for deployment.");
}`;

export function SnippetEditor() {
  return (
    <textarea
      className="w-full h-full bg-transparent border-none focus:ring-0 p-4 md:p-10 text-on-surface font-body text-base md:text-xl leading-relaxed placeholder:text-on-surface-variant/20 resize-none selection:bg-primary/20"
      placeholder="Paste or type your snippet here..."
      defaultValue={defaultContent}
    />
  );
}
