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
    height: 100vh;
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
  const [error, setError] = useState(false);

  const handleLoad = () => {
    console.log('iframe loaded successfully');
    setLoading(false);
  };

  const handleError = () => {
    console.error('iframe failed to load');
    setError(true);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      {loading && !error && (
        <div className={styles.loading}>
          <Flexbox align="center" gap={16} justify="center">
            <Spin size="large" />
            <div style={{ fontSize: 16 }}>{t('loading')}</div>
          </Flexbox>
        </div>
      )}
      {error && (
        <div className={styles.loading}>
          <Flexbox align="center" gap={16} justify="center">
            <div style={{ fontSize: 16, color: 'red' }}>
              Failed to load iframe. Please check the URL.
            </div>
          </Flexbox>
        </div>
      )}
      <iframe
        className={styles.iframe}
        onError={handleError}
        onLoad={handleLoad}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
        src="http://joyagent.aicodetime.com"
        title="智能体"
      />
    </div>
  );
});

AgentFrame.displayName = 'AgentFrame';

export default AgentFrame;
