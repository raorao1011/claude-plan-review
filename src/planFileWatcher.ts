import * as vscode from 'vscode';
import { PlanProvider } from './planProvider';

export class PlanFileWatcher implements vscode.Disposable {
    private watcher: vscode.FileSystemWatcher;

    constructor(plansPath: vscode.Uri, planProvider: PlanProvider) {
        const pattern = new vscode.RelativePattern(plansPath.fsPath, '*.md');
        this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

        // ファイル作成時
        this.watcher.onDidCreate(() => {
            planProvider.refresh();
        });

        // ファイル変更時
        this.watcher.onDidChange(() => {
            planProvider.refresh();
        });

        // ファイル削除時
        this.watcher.onDidDelete(() => {
            planProvider.refresh();
        });
    }

    dispose() {
        this.watcher.dispose();
    }
}
