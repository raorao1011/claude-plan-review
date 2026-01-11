# Changelog

All notable changes to the "Claude Plans Reviewer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-10

### Added
- Initial release of Claude Plans Reviewer VSCode Extension
- Sidebar TreeView for plan files listing from `~/.claude/plans`
- Plans automatically grouped into Today, This Week, and Older categories
- Sort by creation date (newest first) within each group
- Real-time search and filtering by title or filename
- Markdown editor and preview side-by-side display
- File path jump functionality (click to open `/Users/...` paths in plans)
- Plan deletion with confirmation dialog
- Auto-refresh when plan files are created, modified, or deleted
- Relative date display (e.g., "Today", "Yesterday", "3 days ago")
- Visual indicators for plan age (color-coded icons)

### Technical Details
- Built with TypeScript and VSCode Extension API
- Uses oxlint for code quality
- Optimized preview display for smooth scrolling
