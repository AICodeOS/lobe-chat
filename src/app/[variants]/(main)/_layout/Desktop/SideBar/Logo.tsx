import { createStyles } from 'antd-style';
import Image from 'next/image';
import { memo } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  image: css`
    border-radius: ${token.borderRadius}px;
  `,
  logo: css`
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;
    border-radius: ${token.borderRadiusLG}px;
  `,
}));

const Logo = memo(() => {
  const { styles } = useStyles();

  return (
    <div className={styles.logo}>
      <Image alt="Logo" className={styles.image} height={40} src="/logo.jpg" width={40} />
    </div>
  );
});

Logo.displayName = 'Logo';

export default Logo;
