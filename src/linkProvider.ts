import * as vscode from 'vscode';

export class LinkProvider implements vscode.DocumentLinkProvider {
    // ファイルパスのパターン（/Users/で始まるパス）
    private readonly filePathPattern = /\/Users\/[^\s\)]+\.(ts|tsx|js|jsx|py|go|java|yaml|yml|json|md|txt)/g;

    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();

        let match: RegExpExecArray | null;
        while ((match = this.filePathPattern.exec(text)) !== null) {
            const filePath = match[0];
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + filePath.length);
            const range = new vscode.Range(startPos, endPos);

            const link = new vscode.DocumentLink(
                range,
                vscode.Uri.file(filePath)
            );
            link.tooltip = `Open ${filePath}`;
            links.push(link);
        }

        return links;
    }

    resolveDocumentLink?(
        link: vscode.DocumentLink,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink> {
        // リンクの解決（必要に応じて）
        return link;
    }
}
