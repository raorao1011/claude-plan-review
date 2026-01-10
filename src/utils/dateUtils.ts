import { PlanGroup } from '../planGroupItem';

/**
 * 相対時間を人間に読みやすい形式で返す
 * 例: "2h ago", "5 hours ago", "yesterday", "3 days ago"
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
        return diffHours === 1 ? '1h ago' : `${diffHours}h ago`;
    } else if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * プランの作成日時と最終更新日時からグループを判定する
 */
export function categorizePlan(createdDate: Date, lastModified: Date): PlanGroup {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // 今日作成または更新された場合
    if (lastModified >= startOfToday || createdDate >= startOfToday) {
        return 'today';
    }

    // 過去7日以内に作成された場合
    if (createdDate >= startOfWeek) {
        return 'thisWeek';
    }

    // それ以外
    return 'older';
}

/**
 * 日付が今日かどうかを判定
 */
export function isToday(date: Date): boolean {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}
