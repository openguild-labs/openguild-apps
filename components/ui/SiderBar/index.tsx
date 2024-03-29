import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarOutlined,
  GithubFilled,
  HomeOutlined,
  RocketOutlined,
  MoneyCollectOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { MIDDLE_STYLE } from '@/constants';
import { useSupabase } from '@/components/supabase/provider';
import Brand from '../Brand/Brand';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const SiderBarItem = ({
  icon,
  itemName,
  pathname,
  href,
  disabled,
}: {
  icon: React.ReactNode;
  pathname: string | null | undefined;
  itemName: string;
  href: string;
  disabled?: boolean;
}) => {
  return (
    <Link
      href={disabled ? '' : `/${href}`}
      style={{ fontSize: 15 }}
      className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-2 font-small ${
        disabled ? 'text-gray-500' : 'text-black'
      } duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-meta-4 ${
        pathname?.includes(href) && 'bg-gray-300 dark:bg-meta-4'
      }`}>
      {icon}
      {itemName}
    </Link>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { user } = useSupabase();
  const pathname = usePathname();

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = 'true';
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target))
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (!sidebarOpen || key !== 'Escape') return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      style={{ maxWidth: 250 }}
      className={`absolute bg-white left-0 top-0 z-9999 flex h-screen w-102.5 flex-col overflow-y-hidden duration-300 ease-linear lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } border-r border-gray-400 `}>
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden">
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="px-2 lg:mt-9 lg:px-4">
          {/* <!-- Menu Group --> */}
          <div className="border-b border-gray-400 pb-4 mb-5">
            <div style={{ ...MIDDLE_STYLE, justifyContent: 'space-between' }} className="mb-5">
              <div style={{ ...MIDDLE_STYLE }}>
                <Brand w="30" h="30" />
                <h1 className="text-sm font-bold text-black" style={{ marginLeft: 10 }}>
                  OpenGuild Apps
                </h1>
              </div>
              <GithubFilled
                className="text-black"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open('https://github.com/openguild-labs')}
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Join our community, grow your knowledge and learn from others!
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-500">GENERAL</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <SiderBarItem
                  icon={<HomeOutlined />}
                  itemName="Overview"
                  pathname={pathname}
                  href="#"
                />
              </li>
              {/* <li>
                <SiderBarItem
                  icon={<UserOutlined />}
                  itemName="Members"
                  pathname={pathname}
                  href="members"
                />
              </li> */}
              <li>
                <SiderBarItem
                  icon={<MoneyCollectOutlined />}
                  itemName="Job Board"
                  pathname={pathname}
                  href="job-board"
                />
              </li>
              <li>
                <SiderBarItem
                  icon={<div style={{ marginRight: 3 }}>🤝</div>}
                  itemName="Trade"
                  pathname={pathname}
                  href="characters"
                  disabled
                />
              </li>
              <li>
                <SiderBarItem
                  icon={<RocketOutlined />}
                  itemName="Launch Pad"
                  pathname={pathname}
                  disabled
                  href="#"
                />
              </li>
              <li>
                <SiderBarItem
                  icon={<StarOutlined />}
                  itemName="Quests"
                  pathname={pathname}
                  href="quests"
                  disabled
                />
              </li>
              <li>
                <SiderBarItem
                  href="events"
                  icon={<CalendarOutlined />}
                  pathname={pathname}
                  itemName={'Events'}
                  disabled
                />
              </li>
            </ul>
          </div>
          {user && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-500">PERSONAL</h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <SiderBarItem
                    icon={<UserOutlined />}
                    href={`@${user.username}`}
                    itemName="Profile"
                    pathname={pathname}
                  />
                </li>
              </ul>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
