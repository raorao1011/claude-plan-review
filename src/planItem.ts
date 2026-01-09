import * as vscode from 'vscode';

export class PlanItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly fileName: string,
        public readonly resourceUri: vscode.Uri,
        public readonly createdDate: Date,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);

        this.tooltip = this.generateTooltip();
        this.description = this.formatDate(createdDate);
        this.contextValue = 'plan';

        // クリック時の動作
        this.command = {
            command: 'claudePlans.openPreview',
            title: 'Open Preview',
            arguments: [this]
        };
    }

    private generateTooltip(): string {
        return `${this.label}\n\nFile: ${this.fileName}\nCreated: ${this.createdDate.toLocaleString()}`;
    }

    private formatDate(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}
