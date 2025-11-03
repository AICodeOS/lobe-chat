import { ActionIcon } from '@lobehub/ui';
import { Tooltip } from 'antd';
import { LucideX } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import UserAvatar from '@/features/User/UserAvatar';
import UserPanel from '@/features/User/UserPanel';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

const BottomActions = memo(() => {
  const { t } = useTranslation('common');
  const hideSettingsMoveGuide = useUserStore(preferenceSelectors.hideSettingsMoveGuide);
  const updateGuideState = useUserStore((s) => s.updateGuideState);

  const content = (
    <Suspense fallback={<UserAvatar />}>
      <UserPanel placement="rightTop">
        <UserAvatar clickable />
      </UserPanel>
    </Suspense>
  );

  return (
    <Flexbox gap={8}>
      {/* TODO: Add custom bottom menu items here */}
      {/* Example:
      <Link aria-label="Custom Menu" href="/custom-menu">
        <MenuItem icon={YourIcon} label="Custom Menu" />
      </Link>
      */}

      {/* User Avatar */}
      {hideSettingsMoveGuide ? (
        content
      ) : (
        <Tooltip
          color={'blue'}
          open
          placement={'rightTop'}
          prefixCls={'guide'}
          title={
            <Flexbox align={'center'} gap={8} horizontal>
              <div style={{ lineHeight: '22px' }}>{t('userPanel.moveGuide')}</div>
              <ActionIcon
                icon={LucideX}
                onClick={() => {
                  updateGuideState({ moveSettingsToAvatar: true });
                }}
                role={'close-guide'}
                size={'small'}
                style={{ color: 'inherit' }}
              />
            </Flexbox>
          }
        >
          {content}
        </Tooltip>
      )}
    </Flexbox>
  );
});

export default BottomActions;
