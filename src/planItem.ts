import * as vscode from 'vscode';
import { formatRelativeTime, categorizePlan } from './utils/dateUtils';
import { PlanGroup } from './planGroupItem';

export class PlanItem extends vscode.TreeItem {
    public readonly group: PlanGroup;

    constructor(
        public readonly label: string,
        public readonly fileName: string,
        public readonly resourceUri: vscode.Uri,
        public readonly createdDate: Date,
        public readonly lastModified: Date,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);

        this.group = categorizePlan(createdDate, lastModified);
        this.tooltip = this.generateTooltip();
        this.description = formatRelativeTime(lastModified);
        this.contextValue = 'plan';
        this.iconPath = this.getIconForGroup();

        // クリック時の動作
        this.command = {
            command: 'claudePlans.openPreview',
            title: 'Open Preview',
            arguments: [this]
        };
    }

    private generateTooltip(): string {
        return `${this.label}\n\nFile: ${this.fileName}\nCreated: ${this.createdDate.toLocaleString()}\nLast Modified: ${this.lastModified.toLocaleString()}`;
    }

    private getIconForGroup(): vscode.ThemeIcon {
        switch (this.group) {
            case 'today':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
            case 'thisWeek':
                return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.blue'));
            case 'older':
                return new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('editorLineNumber.foreground'));
        }
    }
}
