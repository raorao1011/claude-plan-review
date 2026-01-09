/**
 * マークダウンからH1見出しを抽出してタイトルとする
 */
export function parseMarkdownTitle(content: string): string | null {
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
            return trimmed.substring(2).trim();
        }
    }

    return null;
}

/**
 * マークダウンからファイルパスを抽出
 */
export function extractFilePathsFromMarkdown(content: string): string[] {
    const pattern = /\/Users\/[^\s\)]+\.(ts|tsx|js|jsx|py|go|java|yaml|yml|json|md|txt)/g;
    const matches = content.match(pattern);
    return matches ? [...new Set(matches)] : [];
}
