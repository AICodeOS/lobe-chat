'use client';

import { ActionIcon, Button, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus, Search } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { useActionSWR } from '@/libs/swr';
import { useChatGroupStore } from '@/store/chatGroup';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession } from '@/types/session';

import TogglePanelButton from '../../../features/TogglePanelButton';
import SessionSearchBar from '../../features/SessionSearchBar';

export const useStyles = createStyles(({ css, token }) => ({
  newAgentButton: css`
    width: 200px;
    height: 36px;
    padding-inline: 16px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;

    font-size: 13px;
    font-weight: 500;

    background: ${token.colorBgContainer};

    &:hover {
      border-color: ${token.colorPrimary};
      background: ${token.colorFillQuaternary};
    }
  `,
  searchButton: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;
  `,
  top: css`
    position: sticky;
    inset-block-start: 0;
    padding-block-start: 10px;
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const groupTemplates = useGroupTemplates();
  const [createSession, refreshSessions] = useSessionStore((s) => [
    s.createSession,
    s.refreshSessions,
  ]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);
  const { enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const [isGroupWizardOpen, setIsGroupWizardOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // We need pass inital member list so we cannot use mutate
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    () => createSession(),
  );

  const handleCreateGroupFromTemplate = async (
    templateId: string,
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
    selectedMemberTitles?: string[],
  ) => {
    // Don't close the modal immediately, keep it open during the process
    setIsCreatingGroup(true);
    try {
      const template = groupTemplates.find((t) => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Determine which members to create based on selection
      const membersToCreate =
        typeof selectedMemberTitles === 'undefined'
          ? template.members
          : template.members.filter((m) => selectedMemberTitles.includes(m.title));

      // Create assistants for each selected member and get their agent IDs
      const memberAgentIds: string[] = [];
      for (const member of membersToCreate) {
        const sessionId = await createSession(
          {
            config: {
              plugins: member.plugins,
              systemRole: member.systemRole,
              virtual: true,
            },
            meta: {
              avatar: member.avatar,
              backgroundColor: member.backgroundColor,
              description: `${member.title} - ${template.description}`,
              title: member.title,
            },
          },
          false, // Don't switch to each session
        );

        // Refresh sessions to ensure we get the latest data
        await refreshSessions();

        // Get the agent ID from the created session
        const session = sessionSelectors.getSessionById(sessionId)(useSessionStore.getState());
        if (session && session.type === 'agent') {
          const agentSession = session as LobeAgentSession;
          if (agentSession.config?.id) {
            memberAgentIds.push(agentSession.config.id);
          }
        }
      }

      // Wait 1 second delay between member creation and group creation
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 1000);
      });

      // Create the group with the agent IDs and host configuration
      console.log('Creating group with hostConfig:', hostConfig);
      console.log(
        'Mapped config:',
        hostConfig
          ? {
              orchestratorModel: hostConfig.model,
              orchestratorProvider: hostConfig.provider,
            }
          : undefined,
      );

      await createGroup(
        {
          config: {
            ...(hostConfig
              ? {
                  orchestratorModel: hostConfig.model,
                  orchestratorProvider: hostConfig.provider,
                }
              : {}),
            enableSupervisor: enableSupervisor ?? true,
            scene: DEFAULT_CHAT_GROUP_CHAT_CONFIG.scene,
          },
          title: template.title,
        },
        memberAgentIds,
      );

      // Close the modal only after all requests are finished successfully
      setIsGroupWizardOpen(false);
    } catch (error) {
      console.error('Failed to create group from template:', error);
      // Keep modal open on error so user can try again
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateGroupWithMembers = async (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => {
    // Don't close modal immediately for custom group creation either
    setIsCreatingGroup(true);
    try {
      console.log('Creating custom group with hostConfig:', hostConfig);
      console.log(
        'Mapped config:',
        hostConfig
          ? {
              orchestratorModel: hostConfig.model,
              orchestratorProvider: hostConfig.provider,
            }
          : undefined,
      );

      await createGroup(
        {
          config: {
            ...(hostConfig
              ? {
                  orchestratorModel: hostConfig.model,
                  orchestratorProvider: hostConfig.provider,
                }
              : {}),
            enableSupervisor: enableSupervisor ?? true,
            scene: DEFAULT_CHAT_GROUP_CHAT_CONFIG.scene,
          },
          title: t('defaultGroupChat'),
        },
        selectedAgents,
      );
      // Close modal only after successful creation
      setIsGroupWizardOpen(false);
    } catch (error) {
      console.error('Failed to create group:', error);
      // Keep modal open on error
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleGroupWizardCancel = () => {
    setIsGroupWizardOpen(false);
  };

  return (
    <Flexbox className={styles.top} gap={16} paddingInline={8}>
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <Flexbox align={'center'} gap={4} horizontal style={{ flexShrink: 0 }}>
          <TogglePanelButton />
        </Flexbox>

        <Flexbox align={'center'} style={{ flex: 1, justifyContent: 'center' }}>
          <Button
            className={styles.newAgentButton}
            icon={<Icon icon={MessageSquarePlus} />}
            loading={isValidatingAgent}
            onClick={() => mutateAgent()}
            type={'default'}
          >
            {t('newAgent')}
          </Button>
        </Flexbox>

        <Flexbox align={'center'} gap={4} horizontal style={{ flexShrink: 0 }}>
          <ActionIcon
            className={styles.searchButton}
            icon={Search}
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            title={t('searchAgentPlaceholder')}
            tooltipProps={{
              placement: 'bottom',
            }}
          />
        </Flexbox>
      </Flexbox>
      {isSearchVisible && <SessionSearchBar />}

      {enableGroupChat && (
        <ChatGroupWizard
          isCreatingFromTemplate={isCreatingGroup}
          onCancel={handleGroupWizardCancel}
          onCreateCustom={handleCreateGroupWithMembers}
          onCreateFromTemplate={handleCreateGroupFromTemplate}
          open={isGroupWizardOpen}
        />
      )}
    </Flexbox>
  );
});

export default Header;
