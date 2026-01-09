import * as vscode from 'vscode';
import { PlanItem } from './planItem';
import { parseMarkdownTitle } from './utils/fileParser';

export class PlanProvider implements vscode.TreeDataProvider<PlanItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<PlanItem | undefined | void>();
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

    getTreeItem(element: PlanItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PlanItem): Promise<PlanItem[]> {
        if (element) {
            return [];
        }

        try {
            const files = await vscode.workspace.fs.readDirectory(this.plansPath);
            const planFiles = files
                .filter(([name, type]) => type === vscode.FileType.File && name.endsWith('.md'))
                .map(([name]) => name);

            // ファイル情報を取得してソート
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

            // 作成日時で降順ソート（新しい順）
            filteredItems.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());

            return filteredItems;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load plans: ${error}`);
            return [];
        }
    }
}
