import * as vscode from 'vscode';
import { PlanItem } from './planItem';

export type PlanGroup = 'today' | 'thisWeek' | 'older';

export class PlanGroupItem extends vscode.TreeItem {
    constructor(
        public readonly group: PlanGroup,
        public readonly plans: PlanItem[],
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        const label = PlanGroupItem.getGroupLabel(group);
        super(`${label} (${plans.length})`, collapsibleState);

        this.contextValue = 'planGroup';
        this.iconPath = new vscode.ThemeIcon(PlanGroupItem.getGroupIcon(group));
        this.tooltip = `${plans.length} plan(s) in ${label}`;
    }

    private static getGroupLabel(group: PlanGroup): string {
        switch (group) {
            case 'today':
                return '📅 Today';
            case 'thisWeek':
                return '📆 This Week';
            case 'older':
                return '⏳ Older';
        }
    }

    private static getGroupIcon(group: PlanGroup): string {
        switch (group) {
            case 'today':
                return 'calendar';
            case 'thisWeek':
                return 'calendar-week';
            case 'older':
                return 'archive';
        }
    }
}
