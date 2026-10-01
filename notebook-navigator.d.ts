/*
 * Notebook Navigator - Plugin for Obsidian
 * Copyright (c) 2025-2026 Johan Sanneblad
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Notebook Navigator Plugin API Type Definitions
 * Version: 2.0.0
 *
 * Download this file to your Obsidian plugin project to get TypeScript support
 * for the Notebook Navigator API.
 *
 * Usage:
 * ```typescript
 * import type { NotebookNavigatorAPI } from './notebook-navigator';
 *
 * const nn = app.plugins.plugins['notebook-navigator']?.api as NotebookNavigatorAPI | undefined;
 * if (nn) {
 *   const folder = app.vault.getFolderByPath('Projects');
 *   if (folder) {
 *     await nn.metadata.setFolderMeta(folder, { icon: 'folder-star' });
 *   }
 * }
 * ```
 */

import { EventRef, MenuItem, TFile, TFolder } from 'obsidian';

// Core types

/**
 * Short icon provider prefixes used by Notebook Navigator frontmatter values.
 */
export type IconProviderPrefix = 'bi' | 'fas' | 'mi' | 'ph' | 'ra' | 'si';

/**
 * Typed short-provider icon input format used in frontmatter.
 * Bare Lucide slugs and bare emoji are accepted as plain strings.
 */
export type IconString = `${IconProviderPrefix}-${string}`;

/**
 * Icon input type accepted by public API setters.
 * Setters parse the same icon value format Notebook Navigator writes to frontmatter.
 */
export type IconInput = string;

/**
 * Icon value returned by public API getters and events.
 * Supported icons use the same value format as frontmatter: Lucide slug,
 * short provider-prefixed slug, or bare emoji.
 */
export type IconValue = string;

/**
 * Aggregate tag collection ids used by the navigator for virtual tag rows.
 */
export type TagCollectionId = '__tagged__' | '__untagged__';

/**
 * Metadata associated with a folder
 */
export interface FolderMetadata {
    /** CSS color value (hex, rgb, hsl, named colors) */
    color?: string;
    /** CSS background color value */
    backgroundColor?: string;
    /** Normalized icon identifier stored by the plugin */
    icon?: IconValue;
}

/**
 * Metadata associated with a tag
 */
export interface TagMetadata {
    /** CSS color value (hex, rgb, hsl, named colors) */
    color?: string;
    /** CSS background color value */
    backgroundColor?: string;
    /** Normalized icon identifier stored by the plugin */
    icon?: IconValue;
}

/**
 * Metadata associated with a property node
 */
export interface PropertyMetadata {
    /** CSS color value (hex, rgb, hsl, named colors) */
    color?: string;
    /** CSS background color value */
    backgroundColor?: string;
    /** Normalized icon identifier stored by the plugin */
    icon?: IconValue;
}

/**
 * Metadata update payload for folders
 */
export interface FolderMetadataUpdate {
    /** CSS color value. Use null to clear the stored value. */
    color?: string | null;
    /** CSS background color value. Use null to clear the stored value. */
    backgroundColor?: string | null;
    /** Canonical icon input. Use null to clear the stored value. */
    icon?: IconInput | null;
}

/**
 * Metadata update payload for tags
 */
export interface TagMetadataUpdate {
    /** CSS color value. Use null to clear the stored value. */
    color?: string | null;
    /** CSS background color value. Use null to clear the stored value. */
    backgroundColor?: string | null;
    /** Canonical icon input. Use null to clear the stored value. */
    icon?: IconInput | null;
}

/**
 * Metadata update payload for property nodes
 */
export interface PropertyMetadataUpdate {
    /** CSS color value. Use null to clear the stored value. */
    color?: string | null;
    /** CSS background color value. Use null to clear the stored value. */
    backgroundColor?: string | null;
    /** Canonical icon input. Use null to clear the stored value. */
    icon?: IconInput | null;
}

/**
 * Currently selected navigation item (folder, tag, property, or none).
 *
 * `property` uses the property tree node id (`properties-root` for the section root,
 * or `key:<normalizedKey>` / `key:<normalizedKey>=<normalizedValuePath>` for key/value nodes).
 */
export type NavItemType = 'folder' | 'tag' | 'property' | 'none';

export type NavItem =
    | { type: 'folder'; folder: TFolder; tag: null; property: null }
    | { type: 'tag'; folder: null; tag: string; property: null }
    | { type: 'property'; folder: null; tag: null; property: string }
    | { type: 'none'; folder: null; tag: null; property: null };

export type PropertyNodeParts =
    | {
          /** Root node returned for `propertyNodes.rootId` */
          kind: 'root';
          key: null;
          valuePath: null;
      }
    | {
          /** Key node without a value path */
          kind: 'key';
          /** Normalized property key */
          key: string;
          valuePath: null;
      }
    | {
          /** Key/value node */
          kind: 'value';
          /** Normalized property key */
          key: string;
          /** Normalized value path */
          valuePath: string;
      };

/**
 * Current file selection state in the navigator
 */
export interface SelectionState {
    /** Array of currently selected files */
    files: readonly TFile[];
    /** The file that has keyboard focus (can be null) */
    focused: TFile | null;
}

/**
 * Selection mode for file context menu extensions.
 *
 * - `single`: Menu opened on a single file (context.selection.files is `[file]`)
 * - `multiple`: Menu opened on a selected file while multiple files are selected
 */
export type FileMenuSelectionMode = 'single' | 'multiple';

export interface FileMenuExtensionContext {
    /** Add a menu item (must be called synchronously during menu construction) */
    addItem(cb: (item: MenuItem) => void): void;
    /** The file the menu was opened on */
    file: TFile;
    selection: {
        /** Effective selection mode for this menu */
        mode: FileMenuSelectionMode;
        /** Snapshot of files for this menu (single mode uses `[file]`) */
        files: readonly TFile[];
    };
}

export interface FolderMenuExtensionContext {
    /** Add a menu item (must be called synchronously during menu construction) */
    addItem(cb: (item: MenuItem) => void): void;
    /** The folder the menu was opened on */
    folder: TFolder;
}

export interface TagMenuExtensionContext {
    /** Add a menu item (must be called synchronously during menu construction) */
    addItem(cb: (item: MenuItem) => void): void;
    /** Canonical tag path, or a tag collection id for aggregate tag rows */
    tag: string;
}

export interface PropertyMenuExtensionContext {
    /** Add a menu item (must be called synchronously during menu construction) */
    addItem(cb: (item: MenuItem) => void): void;
    /** Property node id for the menu target */
    nodeId: string;
}

/** Dispose function returned by menu registration methods */
export type MenuExtensionDispose = () => void;

/**
 * Context where a note can be pinned
 * - 'folder': Pin appears when viewing folders
 * - 'tag': Pin appears when viewing tags
 * - 'property': Pin appears when viewing properties
 * - 'all': Pin appears in folder, tag, and property views
 */
export type PinContext = 'folder' | 'tag' | 'property' | 'all';

/**
 * Type alias for the Map structure returned by the API for pinned notes
 * Maps file paths to their pinning context states
 */
export type Pinned = Map<string, Readonly<{ folder: boolean; tag: boolean; property: boolean }>>;

/**
 * All available event types that can be subscribed to
 */
export type NotebookNavigatorEventType = keyof NotebookNavigatorEvents;

/**
 * Event payload definitions for each event type
 */
export interface NotebookNavigatorEvents {
    /** Fired when the storage system is ready for queries */
    'storage-ready': void;

    /** Fired when the navigation selection changes (folder, tag, property, or nothing) */
    'nav-item-changed': {
        item: NavItem;
    };

    /** Fired when selection changes in the list pane */
    'selection-changed': {
        state: SelectionState;
    };

    /** Fired when pinned files change */
    'pinned-files-changed': {
        /** All currently pinned files with their context information as a Map */
        files: Readonly<Pinned>;
    };

    /** Fired when folder metadata changes */
    'folder-changed': {
        folder: TFolder;
        metadata: FolderMetadata | null;
    };

    /** Fired when tag metadata changes */
    'tag-changed': {
        tag: string;
        metadata: TagMetadata | null;
    };

    /** Fired when property metadata changes */
    'property-changed': {
        nodeId: string;
        metadata: PropertyMetadata | null;
    };
}

/**
 * Main Notebook Navigator API interface
 * @version 2.0.0
 */
export interface NotebookNavigatorAPI {
    /** Get the API version string */
    getVersion(): string;

    /** Check if the initial storage bootstrap has completed */
    isStorageReady(): boolean;
    /** Resolve when the initial storage bootstrap completes */
    whenReady(): Promise<void>;

    /** Metadata operations for folders, tags, property nodes, and pinned files */
    metadata: {
        // Folder metadata
        /** Get all metadata for a folder */
        getFolderMeta(folder: TFolder): FolderMetadata | null;
        /** Set folder metadata (color and/or icon). Pass null to clear a property */
        setFolderMeta(folder: TFolder, meta: FolderMetadataUpdate): Promise<void>;

        // Tag metadata
        /** Get all metadata for a tag */
        getTagMeta(tag: string): TagMetadata | null;
        /** Set tag metadata (color and/or icon). Pass null to clear a property */
        setTagMeta(tag: string, meta: TagMetadataUpdate): Promise<void>;

        // Property metadata
        /** Get all metadata for a property node */
        getPropertyMeta(nodeId: string): PropertyMetadata | null;
        /** Set property metadata (color and/or icon). Pass null to clear a property */
        setPropertyMeta(nodeId: string, meta: PropertyMetadataUpdate): Promise<void>;

        // Pinned files
        /** Get all pinned files with their context information as a Map */
        getPinned(): Readonly<Pinned>;
        /** Check if a file is pinned (no context = any, 'all' = all contexts) */
        isPinned(file: TFile, context?: PinContext): boolean;
        /** Pin a file (defaults to 'all' - all contexts) */
        pin(file: TFile, context?: PinContext): Promise<void>;
        /** Unpin a file (defaults to 'all' - all contexts) */
        unpin(file: TFile, context?: PinContext): Promise<void>;
    };

    /** Navigation operations */
    navigation: {
        /** Reveal and select a file in the navigator. Returns false when the file cannot be revealed, including hidden files while hidden items are off. */
        reveal(file: TFile | string): Promise<boolean>;
        /** Select a folder in the navigator navigation pane */
        navigateToFolder(folder: TFolder | string): Promise<boolean>;
        /** Select a tag in the navigator navigation pane (e.g. '#work' or 'work'). Requires tag data to be available (`storage-ready`). */
        navigateToTag(tag: string): Promise<boolean>;
        /** Select a property node in the navigator navigation pane (e.g. 'key:status' or 'key:status=done'). */
        navigateToProperty(nodeId: string): Promise<boolean>;
    };

    /** Query current selection state */
    selection: {
        /** Get the currently selected folder, tag, property, or none in navigation pane */
        getNavItem(): NavItem;
        /** Get current file selection state */
        getCurrent(): SelectionState;
    };

    /** Helpers for aggregate tag rows used by tag menus and navigation */
    tagCollections: {
        /** Aggregate row id for notes with at least one tag */
        readonly taggedId: TagCollectionId;
        /** Aggregate row id for notes without tags */
        readonly untaggedId: TagCollectionId;
        /** Check whether a tag target is an aggregate row id */
        isCollection(tag: string | null | undefined): tag is TagCollectionId;
        /** Current localized label for an aggregate row id */
        getLabel(tag: TagCollectionId): string;
    };

    /** Helpers for building and parsing public property node ids */
    propertyNodes: {
        /** Property root node id used by navigation APIs */
        readonly rootId: 'properties-root';
        /** Build a canonical key node id */
        buildKey(key: string): string | null;
        /** Build a canonical key/value node id */
        buildValue(key: string, valuePath: string): string | null;
        /** Parse a property node id into normalized parts */
        parse(nodeId: string): PropertyNodeParts | null;
        /** Normalize a property node id to canonical form */
        normalize(nodeId: string): string | null;
    };

    /** Menu extensions for Notebook Navigator context menus (callbacks run synchronously during menu construction) */
    menus: {
        /** Register items for the file context menu */
        registerFileMenu(callback: (context: FileMenuExtensionContext) => void): MenuExtensionDispose;
        /** Register items for the folder context menu */
        registerFolderMenu(callback: (context: FolderMenuExtensionContext) => void): MenuExtensionDispose;
        /** Register items for the tag context menu */
        registerTagMenu(callback: (context: TagMenuExtensionContext) => void): MenuExtensionDispose;
        /** Register items for the property context menu */
        registerPropertyMenu(callback: (context: PropertyMenuExtensionContext) => void): MenuExtensionDispose;
    };

    // Event subscription
    /** Subscribe to navigator events with type safety */
    on<T extends NotebookNavigatorEventType>(event: T, callback: (data: NotebookNavigatorEvents[T]) => void): EventRef;
    /** Subscribe to an event only once - automatically unsubscribes after first trigger */
    once<T extends NotebookNavigatorEventType>(event: T, callback: (data: NotebookNavigatorEvents[T]) => void): EventRef;
    /** Unsubscribe from an event */
    off(ref: EventRef): void;
}
