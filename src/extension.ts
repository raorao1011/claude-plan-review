import * as vscode from 'vscode';
import { PlanProvider } from './planProvider';
import { LinkProvider } from './linkProvider';
import { PlanFileWatcher } from './planFileWatcher';

export function activate(context: vscode.ExtensionContext) {
    const plansPath = vscode.Uri.file(
        `${process.env.HOME}/.claude/plans`
    );

    // TreeDataProviderの登録
    const planProvider = new PlanProvider(plansPath);
    const treeView = vscode.window.createTreeView('claudePlansExplorer', {
        treeDataProvider: planProvider,
        showCollapseAll: true
    });

    // DocumentLinkProviderの登録（マークダウン内のパスクリック対応）
    const linkProvider = new LinkProvider();
    const linkProviderDisposable = vscode.languages.registerDocumentLinkProvider(
        { scheme: 'file', language: 'markdown' },
        linkProvider
    );

    // ファイル監視の開始
    const watcher = new PlanFileWatcher(plansPath, planProvider);

    // コマンド登録
    context.subscriptions.push(
        vscode.commands.registerCommand('claudePlans.refresh', () => {
            planProvider.refresh();
        }),
        vscode.commands.registerCommand('claudePlans.openPreview', (planItem) => {
            openMarkdownPreview(planItem.resourceUri);
        }),
        vscode.commands.registerCommand('claudePlans.delete', async (planItem) => {
            await deletePlan(planItem);
            planProvider.refresh();
        }),
        vscode.commands.registerCommand('claudePlans.search', async () => {
            await searchPlans(planProvider);
        }),
        treeView,
        linkProviderDisposable,
        watcher
    );
}

async function openMarkdownPreview(uri: vscode.Uri) {
    // 左側にマークダウンエディターを開く
    await vscode.window.showTextDocument(uri, {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false
    });

    // 右側にプレビューを開く
    await vscode.commands.executeCommand('markdown.showPreviewToSide');
}

async function deletePlan(planItem: any) {
    const answer = await vscode.window.showWarningMessage(
        `Delete "${planItem.label}"?`,
        { modal: true },
        'Delete'
    );

    if (answer === 'Delete') {
        await vscode.workspace.fs.delete(planItem.resourceUri);
        vscode.window.showInformationMessage(`Deleted: ${planItem.label}`);
    }
}

async function searchPlans(planProvider: PlanProvider) {
    const inputBox = vscode.window.createInputBox();
    inputBox.placeholder = 'Search plans by title or filename...';
    inputBox.prompt = 'Type to filter plans';

    // クリアボタンを追加
    const clearButton: vscode.QuickInputButton = {
        iconPath: new vscode.ThemeIcon('close'),
        tooltip: 'Clear filter'
    };
    inputBox.buttons = [clearButton];

    // リアルタイム検索：入力するたびにフィルタリング
    inputBox.onDidChangeValue((value) => {
        planProvider.setFilter(value);
    });

    // クリアボタンがクリックされたとき
    inputBox.onDidTriggerButton((button) => {
        if (button === clearButton) {
            inputBox.value = '';
            planProvider.setFilter('');
        }
    });

    // Enterキーで閉じる
    inputBox.onDidAccept(() => {
        inputBox.hide();
    });

    // 閉じられたときの処理
    inputBox.onDidHide(() => {
        inputBox.dispose();
    });

    inputBox.show();
}

export function deactivate() {}
