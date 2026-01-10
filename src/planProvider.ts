import * as vscode from 'vscode';
import { PlanItem } from './planItem';
import { PlanGroupItem, PlanGroup } from './planGroupItem';
import { parseMarkdownTitle } from './utils/fileParser';

type TreeElement = PlanGroupItem | PlanItem;

export class PlanProvider implements vscode.TreeDataProvider<TreeElement> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TreeElement | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private filterQuery: string = '';

    constructor(private plansPath: vscode.Uri) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    setFilter(query: string): void {
        this.filterQuery = query.toLowerCase();
        this.refresh();
    }

    getTreeItem(element: TreeElement): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TreeElement): Promise<TreeElement[]> {
        // グループアイテムが選択された場合、その中のプランを返す
        if (element instanceof PlanGroupItem) {
            return element.plans;
        }

        // プランアイテムの場合は子要素なし
        if (element instanceof PlanItem) {
            return [];
        }

        // ルート要素の場合、グループ化されたプランを返す
        try {
            const files = await vscode.workspace.fs.readDirectory(this.plansPath);
            const planFiles = files
                .filter(([name, type]) => type === vscode.FileType.File && name.endsWith('.md'))
                .map(([name]) => name);

            // ファイル情報を取得
            const planItems = await Promise.all(
                planFiles.map(async (fileName) => {
                    const filePath = vscode.Uri.joinPath(this.plansPath, fileName);
                    const stat = await vscode.workspace.fs.stat(filePath);
                    const content = await vscode.workspace.fs.readFile(filePath);
                    const contentStr = Buffer.from(content).toString('utf8');
                    const title = parseMarkdownTitle(contentStr) || fileName;

                    return new PlanItem(
                        title,
                        fileName,
                        filePath,
                        new Date(stat.ctime),
                        new Date(stat.mtime),
                        vscode.TreeItemCollapsibleState.None
                    );
                })
            );

            // フィルタリング
            let filteredItems = planItems;
            if (this.filterQuery) {
                filteredItems = planItems.filter(item =>
                    item.label.toLowerCase().includes(this.filterQuery) ||
                    item.fileName.toLowerCase().includes(this.filterQuery)
                );
            }

            // グループごとに分類
            const groups = new Map<PlanGroup, PlanItem[]>();
            groups.set('today', []);
            groups.set('thisWeek', []);
            groups.set('older', []);

            for (const item of filteredItems) {
                const group = item.group;
                groups.get(group)!.push(item);
            }

            // 各グループ内で最終更新日時で降順ソート
            for (const planList of groups.values()) {
                planList.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
            }

            // グループアイテムを作成（プランがある場合のみ）
            const result: TreeElement[] = [];
            const groupOrder: PlanGroup[] = ['today', 'thisWeek', 'older'];

            for (const group of groupOrder) {
                const plans = groups.get(group)!;
                if (plans.length > 0) {
                    // olderグループはデフォルトで折りたたみ、それ以外は展開
                    const collapsibleState = group === 'older'
                        ? vscode.TreeItemCollapsibleState.Collapsed
                        : vscode.TreeItemCollapsibleState.Expanded;

                    result.push(new PlanGroupItem(group, plans, collapsibleState));
                }
            }

            return result;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load plans: ${error}`);
            return [];
        }
    }
}
