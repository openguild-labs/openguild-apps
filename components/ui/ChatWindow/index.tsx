'use client';

import { IconChatBubbleLeft } from '@/components/Icons';
import LinkItem from '../Link/LinkItem';
import { IconChatBubbleOvalLeftEllipsis } from '@/components/Icons';
import { useEffect, useState } from 'react';
import johnPicture from '@/public/johnrush.jpeg';
import Image from 'next/image';
import * as Popover from '@radix-ui/react-popover';
import { CloseOutlined } from '@ant-design/icons';

export default () => {
  const [isPopupActive, setPopupActive] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPopupActive(false);
    }, 6000);
  }, []);

  return (
    <Popover.Root open={isPopupActive} onOpenChange={val => setPopupActive(val)}>
      <div className="fixed z-10 bottom-4 right-4 max-w-xs">
        <Popover.Trigger asChild>
          <button
            aria-label="Chat button"
            className="w-10 h-10 rounded-full text-white bg-green-600 flex items-center justify-center group">
            {isPopupActive ? <CloseOutlined className="w-6 h-6" /> : <IconChatBubbleLeft />}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="mr-4 mb-4 relative z-20">
            <div className="p-4 flex flex-wrap items-start gap-3 shadow-md rounded-lg bg-slate-500 border-gray-800">
              <Image
                src={johnPicture}
                width={32}
                height={32}
                className="flex-none w-8 h-8 object-cover rounded-full"
                alt="John rush"
              />
              <div className="w-full text-sm text-left sm:w-auto">
                <p className="text-gray-100">You got a question? You can DM me!</p>
                <div className="flex items-center gap-x-2 mt-1">
                  <span className="flex-none block w-2 h-2 rounded-full bg-green-600"></span>
                  <p className="text-xs text-gray-300">Online, replies near instant</p>
                </div>
                <LinkItem
                  href="https://twitter.com/messages/compose?recipient_id=1456321269029380097"
                  target="_blank"
                  className="mt-2 w-full flex items-center justify-center gap-x-2 bg-green-600 hover:bg-green-600 text-xs py-2">
                  <IconChatBubbleOvalLeftEllipsis className="w-4 h-4" />
                  Contact @chungquantin
                </LinkItem>
              </div>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
};
