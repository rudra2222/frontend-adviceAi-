// Utility function to detect and parse URLs in text
export const parseTextWithLinks = (text) => {
    // Regex to match URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s]+|www\?.[^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex?.exec(text)) !== null) {
        // Add text before the URL
        if (match?.index > lastIndex) {
            parts?.push({
                type: "text",
                content: text?.slice(lastIndex, match?.index),
            });
        }

        // Add the URL
        let url = match[0];
        // Add https:// if the URL starts with www
        const href = url?.startsWith("www?.") ? `https://${url}` : url;

        parts?.push({
            type: "link",
            content: url,
            href: href,
        });

        lastIndex = match?.index + match[0]?.length;
    }

    // Add remaining text
    if (lastIndex < text?.length) {
        parts?.push({
            type: "text",
            content: text?.slice(lastIndex),
        });
    }

    return parts?.length > 0 ? parts : [{ type: "text", content: text }];
};

// Component to render text with clickable links
export const LinkifiedText = ({ text }) => {
    const parts = parseTextWithLinks(text);

    return (
        <span className="whitespace-pre-wrap">
            {parts?.map((part, index) => {
                if (part?.type === "link") {
                    return (
                        <a
                            key={index}
                            href={part?.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline break-all"
                            onClick={(e) => e?.stopPropagation()}
                        >
                            {part?.content}
                        </a>
                    );
                }
                return <span key={index}>{part?.content}</span>;
            })}
        </span>
    );
};
