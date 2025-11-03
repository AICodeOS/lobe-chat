'use client';

import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
  `,
  iframe: css`
    width: 100%;
    height: 100%;
    border: none;
  `,
  loading: css`
    position: absolute;
    z-index: 10;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    background: ${token.colorBgLayout};
  `,
  loadingHidden: css`
    display: none;
  `,
}));

const AgentFrame = memo(() => {
  const { styles, cx } = useStyles();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={cx(styles.loading, !loading && styles.loadingHidden)}>
        <Flexbox align="center" gap={16} justify="center">
          <Spin size="large" />
          <div style={{ fontSize: 16 }}>{t('loading')}</div>
        </Flexbox>
      </div>
      <iframe
        className={styles.iframe}
        onLoad={handleLoad}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        src="http://joyagent.aicodetime.com"
        title="智能体"
      />
    </div>
  );
});

AgentFrame.displayName = 'AgentFrame';

export default AgentFrame;
