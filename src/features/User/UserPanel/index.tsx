'use client';

import { Popover } from 'antd';
import type { PopoverProps } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo, useState } from 'react';

import { isDesktop } from '@/const/version';

import PanelContent from './PanelContent';
import UpgradeBadge from './UpgradeBadge';
import { useNewVersion } from './useNewVersion';

const useStyles = createStyles(({ css }, placement?: PopoverProps['placement']) => {
  const isBottom = placement === 'right' || placement === 'rightTop' || placement === 'rightBottom';

  return {
    popover: css`
      ${isBottom
        ? `inset-block-end: 8px !important;`
        : `inset-block-start: ${isDesktop ? 32 : 8}px !important;`}
      inset-inline-start: 8px !important;
    `,
  };
});

interface UserPanelProps extends PropsWithChildren {
  placement?: PopoverProps['placement'];
}

const UserPanel = memo<UserPanelProps>(({ children, placement = 'topRight' }) => {
  const hasNewVersion = useNewVersion();
  const [open, setOpen] = useState(false);
  const { styles } = useStyles(placement);

  return (
    <UpgradeBadge showBadge={hasNewVersion}>
      <Popover
        arrow={false}
        content={<PanelContent closePopover={() => setOpen(false)} />}
        onOpenChange={setOpen}
        open={open}
        placement={placement}
        rootClassName={styles.popover}
        styles={{
          body: { padding: 0 },
        }}
        trigger={['click']}
      >
        {children}
      </Popover>
    </UpgradeBadge>
  );
});

UserPanel.displayName = 'UserPanel';

export default UserPanel;
