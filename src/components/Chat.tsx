import React from 'react';
import DemoChatContainer from './chat/DemoChatContainer';
import ModuleWrapper from './ui/ModuleWrapper';

interface ChatProps {
  onModuleChange?: (module: string) => void;
}

const Chat: React.FC<ChatProps> = ({ onModuleChange }) => {
  return (
    <ModuleWrapper module="chat" showTopAccent={true}>
      <div className="h-full">
        <DemoChatContainer onModuleChange={onModuleChange} />
      </div>
    </ModuleWrapper>
  );
};

export default Chat;