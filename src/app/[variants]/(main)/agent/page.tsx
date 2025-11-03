import { Suspense } from 'react';

import StructuredData from '@/components/StructuredData';
import { BRANDING_NAME } from '@/const/branding';
import { ldModule } from '@/server/ld';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import AgentFrame from './AgentFrame';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('metadata', locale);
  return metadataModule.generate({
    description: t('agent.description', { appName: BRANDING_NAME }),
    title: t('agent.title'),
    url: '/agent',
  });
};

const AgentPage = async (props: DynamicLayoutProps) => {
  const { locale } = await RouteVariants.getVariantsFromProps(props);
  const { t } = await translation('metadata', locale);
  const ld = ldModule.generate({
    description: t('agent.description', { appName: BRANDING_NAME }),
    title: t('agent.title'),
    url: '/agent',
  });

  return (
    <>
      <StructuredData ld={ld} />
      <Suspense fallback={<div>Loading...</div>}>
        <AgentFrame />
      </Suspense>
    </>
  );
};

AgentPage.displayName = 'AgentPage';

export default AgentPage;
