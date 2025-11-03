'use client';

import { memo } from 'react';

import AgentFrame from './AgentFrame';

const AgentPage = memo(() => {
  return <AgentFrame />;
});

AgentPage.displayName = 'AgentPage';

export default AgentPage;
