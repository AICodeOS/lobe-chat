import { createStyles } from 'antd-style';
import { Bot, Compass, FolderClosed, LucideIcon, MessageSquare, Palette } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  label: css`
    font-size: 11px;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
  `,
  menuItem: css`
    cursor: pointer;

    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
    justify-content: center;

    padding-block: 8px;
    padding-inline: 4px;
    border-radius: ${token.borderRadiusLG}px;

    color: ${token.colorTextSecondary};
    text-decoration: none;

    transition: all 0.2s ease;

    &:hover {
      color: ${token.colorText};
      background: ${token.colorFillTertiary};
    }
  `,
  menuItemActive: css`
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    &:hover {
      background: ${token.colorPrimaryBgHover};
    }
  `,
}));

interface MenuItemProps {
  active?: boolean;
  icon: LucideIcon;
  label: string;
}

const MenuItem = memo<MenuItemProps>(({ active, icon: Icon, label }) => {
  const { styles, cx } = useStyles();

  return (
    <div className={cx(styles.menuItem, active && styles.menuItemActive)}>
      <div className={styles.iconWrapper}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
});

export interface TopActionProps {
  isPinned?: boolean | null;
  tab?: SidebarTabKey;
}

const TopActions = memo<TopActionProps>(({ tab, isPinned }) => {
  const { t } = useTranslation('common');
  const switchBackToChat = useGlobalStore((s) => s.switchBackToChat);
  const { showMarket, enableKnowledgeBase, showAiImage } =
    useServerConfigStore(featureFlagsSelectors);

  const isChatActive = tab === SidebarTabKey.Chat && !isPinned;
  const isFilesActive = tab === SidebarTabKey.Files;
  const isDiscoverActive = tab === SidebarTabKey.Discover;
  const isAgentActive = tab === SidebarTabKey.Agent;
  const isImageActive = tab === SidebarTabKey.Image;

  return (
    <Flexbox gap={8}>
      <Link
        aria-label={t('tab.chat')}
        href={'/chat'}
        onClick={(e) => {
          // If Cmd key is pressed, let the default link behavior happen (open in new tab)
          if (e.metaKey || e.ctrlKey) {
            return;
          }

          // Otherwise, prevent default and switch session within the current tab
          e.preventDefault();
          switchBackToChat(useSessionStore.getState().activeId);
        }}
        style={{ textDecoration: 'none' }}
      >
        <MenuItem active={isChatActive} icon={MessageSquare} label={t('tab.chat')} />
      </Link>
      {enableKnowledgeBase && (
        <Link
          aria-label={t('tab.knowledgeBase')}
          href={'/files'}
          style={{ textDecoration: 'none' }}
        >
          <MenuItem active={isFilesActive} icon={FolderClosed} label={t('tab.knowledgeBase')} />
        </Link>
      )}
      {showAiImage && (
        <Link aria-label={t('tab.aiImage')} href={'/image'} style={{ textDecoration: 'none' }}>
          <MenuItem active={isImageActive} icon={Palette} label={t('tab.aiImage')} />
        </Link>
      )}
      {showMarket && (
        <Link aria-label={t('tab.discover')} href={'/discover'} style={{ textDecoration: 'none' }}>
          <MenuItem active={isDiscoverActive} icon={Compass} label={t('tab.discover')} />
        </Link>
      )}
      <Link aria-label={t('tab.agent')} href={'/agent'} style={{ textDecoration: 'none' }}>
        <MenuItem active={isAgentActive} icon={Bot} label={t('tab.agent')} />
      </Link>
    </Flexbox>
  );
});

export default TopActions;
